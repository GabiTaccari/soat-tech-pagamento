import { Request, Response } from 'express';
import axios from 'axios';
import { PagamentoMongoRepository } from '../../infrastructure/database/repositories/PagamentoMongoRepository';

const pagamentoRepo = new PagamentoMongoRepository();

function mapStatusMercadoPago(statusMP: string): string {
  switch ((statusMP || '').toUpperCase()) {
    case 'APPROVED':
      return 'APROVADO';
    case 'PENDING':
      return 'AGUARDANDO';
    case 'REJECTED':
      return 'RECUSADO';
    default:
      return 'DESCONHECIDO';
  }
}

function mapStatusPedido(statusInterno: string): string {
  if (statusInterno === 'APROVADO') return 'PAGO';
  if (statusInterno === 'RECUSADO') return 'CANCELADO'; // se não existir no pedido-service, troque por 'RECEBIDO'
  return 'RECEBIDO';
}

export class WebhookController {
  static async receberNotificacao(req: Request, res: Response) {
    try {
      const { action, data, pedidoId: pedidoIdOverride, status: statusOverride } = req.body;

      console.log('📥 Webhook recebido:', action, data);

      // Aceita também simulação manual no Postman
      if (!action) {
        return res.status(400).send('action ausente');
      }

      if (!['payment.created', 'payment.updated'].includes(action)) {
        return res.status(200).send('Evento ignorado');
      }

      const pagamentoId = data?.id;

      // ✅ MODO SIMULADO (Postman): se mandar pedidoId + status, não chama MP
      if (pedidoIdOverride && statusOverride) {
        const statusInterno = mapStatusMercadoPago(statusOverride);
        const novoStatusPedido = mapStatusPedido(statusInterno);

        await pagamentoRepo.criar({
          pedidoId: pedidoIdOverride,
          metodo: 'QR_CODE',
          status: statusInterno,
          valor: 0,
        });

        const pedidoServiceUrl = process.env.PEDIDO_SERVICE_URL;
        if (pedidoServiceUrl) {
          await axios.patch(`${pedidoServiceUrl}/api/pedidos/${pedidoIdOverride}/status`, {
            status: novoStatusPedido,
          });
        }

        console.log(`✅ Webhook SIMULADO: pedido ${pedidoIdOverride} -> ${novoStatusPedido}`);
        return res.status(200).send('OK (simulado)');
      }

      if (!pagamentoId) {
        console.warn('Webhook sem ID de pagamento');
        return res.status(200).send('OK (sem id)');
      }

      const mpToken = process.env.MP_ACCESS_TOKEN;
      if (!mpToken) {
        console.warn('MP_ACCESS_TOKEN não definido. Ignorando consulta MP.');
        return res.status(200).send('OK (sem MP token)');
      }

      // 1) Buscar pagamento no Mercado Pago por ID
      let pagamentoMP: any = null;

      try {
        const response = await axios.get(`https://api.mercadopago.com/v1/payments/${pagamentoId}`, {
          headers: { Authorization: `Bearer ${mpToken}` },
        });
        pagamentoMP = response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          console.warn(`Pagamento ${pagamentoId} não encontrado ainda (404). Vou responder 200 e aguardar novo evento.`);
          return res.status(200).send('OK (pagamento ainda não disponível)');
        }

        // ✅ Se der 400/401/403 etc, não explode com 500 na demo
        console.warn('Erro consultando MP por ID:', error.response?.status, error.response?.data || error.message);
        return res.status(200).send('OK (erro consultando MP)');
      }

      const pedidoId = pagamentoMP?.external_reference;
      const statusMP = (pagamentoMP?.status || '').toUpperCase();
      const statusInterno = mapStatusMercadoPago(statusMP);

      if (!pedidoId) {
        console.warn('Pagamento sem external_reference');
        return res.status(200).send('OK (sem external_reference)');
      }

      // 2) Salvar/atualizar no Mongo
      // (aqui não usamos _id do MP, porque no seu fluxo de QR você não garante o id do payment)
      await pagamentoRepo.criar({
        pedidoId,
        metodo: pagamentoMP.payment_method_id || 'QR_CODE',
        status: statusInterno,
        valor: pagamentoMP.transaction_amount || 0,
      });

      // 3) Atualizar pedido-service
      const pedidoServiceUrl = process.env.PEDIDO_SERVICE_URL;
      if (!pedidoServiceUrl) {
        console.warn('PEDIDO_SERVICE_URL não definido. Não vou atualizar pedido.');
        return res.status(200).send('OK (sem atualizar pedido)');
      }

      const novoStatusPedido = mapStatusPedido(statusInterno);
      await axios.patch(`${pedidoServiceUrl}/api/pedidos/${pedidoId}/status`, {
        status: novoStatusPedido,
      });

      console.log(`✅ Pagamento ${pagamentoId} pedido ${pedidoId} -> ${statusInterno} | pedido->${novoStatusPedido}`);
      return res.status(200).send('OK');
    } catch (error: any) {
      console.error('Erro no webhook:', error?.response?.data || error.message);
      return res.status(500).send('Erro no processamento');
    }
  }
}
