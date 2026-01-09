// import { Request, Response } from 'express';
// import { CheckoutPagamento } from '../../application/usecases/CheckoutPagamento';

// export class PagamentoController {
//   static async gerarLink(req: Request, res: Response) {
//     const { pedidoId } = req.body;

//     if (!pedidoId) {
//       return res.status(400).json({ erro: 'pedidoId é obrigatório' });
//     }

//     try {
//       const pagamento = new CheckoutPagamento();
//     //   const link = await pagamento.gerarLinkPagamento(pedidoId);
//     const link = await pagamento.gerarQrCodePagamento(pedidoId);
//       return res.json({ link });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ erro: 'Erro ao gerar link de pagamento' });
//     }
//   }

//   static async gerarQrCodePagamento(req: Request, res: Response) {
//     const { pedidoId } = req.body;

//     if (!pedidoId) {
//       return res.status(400).json({ erro: 'pedidoId é obrigatório' });
//     }

//     try {
//       const pagamento = new CheckoutPagamento();
//       const qrCode = await pagamento.gerarQrCodePagamento(pedidoId);
//       return res.json({ qrCode });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ erro: 'Erro ao gerar QR Code de pagamento' });
//     }
//   }

// }


import { Request, Response } from 'express';
import { CheckoutPagamento } from '../../application/usecases/CheckoutPagamento';

export class PagamentoController {
  static async gerarQrCodePagamento(req: Request, res: Response) {
    const { pedidoId } = req.body;

    if (!pedidoId) {
      return res.status(400).json({ erro: 'pedidoId é obrigatório' });
    }

    try {
      const pagamento = new CheckoutPagamento();
      const qrCode = await pagamento.gerarQrCodePagamento(pedidoId);
      return res.json({ qrCode });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: 'Erro ao gerar QR Code de pagamento' });
    }
  }
}
