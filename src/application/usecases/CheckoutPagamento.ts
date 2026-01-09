import axios from 'axios';
import { PagamentoMongoRepository } from '../../infrastructure/database/repositories/PagamentoMongoRepository';

const pagamentoRepo = new PagamentoMongoRepository();

type PedidoItem = {
  quantidade: number;
  produto?: { nome: string; preco: number };
  nome?: string;
  preco?: number;
};

type PedidoDTO = {
  id: string;
  itens?: PedidoItem[];
};

function calcularTotal(itens: PedidoItem[] = []) {
  return itens.reduce((acc, item) => {
    const preco = item.produto?.preco ?? item.preco ?? 0;
    const nome = item.produto?.nome ?? item.nome ?? 'Item';
    const quantidade = item.quantidade ?? 1;
    return acc + preco * quantidade;
  }, 0);
}

export class CheckoutPagamento {
  async gerarQrCodePagamento(pedidoId: string): Promise<string> {
    console.log('🔍 Iniciando geração de QR Code...', { pedidoId });

    const mpAccessToken = process.env.MP_ACCESS_TOKEN;
    const mpCollectorId = process.env.MP_COLLECTOR_ID;
    const pedidoServiceUrl = process.env.PEDIDO_SERVICE_URL;

    if (!mpAccessToken) throw new Error('MP_ACCESS_TOKEN não definido');
    if (!mpCollectorId) throw new Error('MP_COLLECTOR_ID não definido');
    if (!pedidoServiceUrl) throw new Error('PEDIDO_SERVICE_URL não definido');

    // 1) Buscar detalhes do pedido via HTTP (não via DB)
    // Se esse endpoint retornar outro formato, a gente ajusta depois.
    let pedido: PedidoDTO | null = null;

    try {
      const { data } = await axios.get(`${pedidoServiceUrl}/api/pedidos/${pedidoId}`);
      pedido = data;
    } catch (e: any) {
      console.warn('⚠️ Não consegui buscar pedido no pedido-service. Vou seguir com valor simbólico.', e?.message);
      pedido = null;
    }

    const itens = pedido?.itens ?? [];
    const total = itens.length ? calcularTotal(itens) : 1; // fallback simbólico
    const itemsPayload =
      itens.length
        ? itens.map((item) => {
            const nome = item.produto?.nome ?? item.nome ?? 'Item';
            const preco = item.produto?.preco ?? item.preco ?? 0;
            const quantidade = item.quantidade ?? 1;
            return {
              title: nome,
              quantity: quantidade,
              unit_price: preco,
              unit_measure: 'unit',
              total_amount: preco * quantidade,
            };
          })
        : [
            {
              title: `Pedido ${pedidoId}`,
              quantity: 1,
              unit_price: 1,
              unit_measure: 'unit',
              total_amount: 1,
            },
          ];

    console.log('🔗 Dados do Pedido (para pagamento):', {
      pedidoId,
      total,
      itemsCount: itemsPayload.length,
    });

    // 2) Montar payload do Mercado Pago (instore QR)
    const external_pos_id = '01';

    const qrCodePayload = {
      title: 'Pagamento Pedido ' + pedidoId,
      description: 'Pedido gerado via QR Code',
      total_amount: total,
      external_reference: pedidoId,
      // ⚠️ Dica: para demo local, pode remover notification_url (MP às vezes exige https)
      // notification_url: process.env.MP_WEBHOOK_URL,
      items: itemsPayload,
    };

    try {
      const response = await axios.post(
        `https://api.mercadopago.com/instore/orders/qr/seller/collectors/${mpCollectorId}/pos/${external_pos_id}/qrs`,
        qrCodePayload,
        {
          headers: {
            Authorization: `Bearer ${mpAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const qrImage = response.data.qr_data;

      // 3) Registrar pagamento no Mongo (NoSQL)
      // Usando pedidoId como vínculo. Não acessa DB do pedido.
      await pagamentoRepo.criar({
        pedidoId,
        metodo: 'QR_CODE',
        status: 'AGUARDANDO',
        valor: total,
      });

      console.log('✅ QR Code gerado e pagamento registrado no Mongo');
      return qrImage;
    } catch (error: any) {
      console.error('❌ Erro ao gerar QR Code:', error.response?.data || error.message);
      throw new Error('Erro ao gerar QR Code');
    }
  }
}
