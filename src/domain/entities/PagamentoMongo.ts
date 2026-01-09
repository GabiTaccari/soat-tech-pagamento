import mongoose from 'mongoose';

const PagamentoSchema = new mongoose.Schema(
  {
    pedidoId: { type: String, required: true },
    metodo: { type: String, required: false },
    valor: { type: Number, required: false },
    status: { type: String, required: true, default: 'PENDENTE' },
  },
  { timestamps: true }
);

export const PagamentoModel = mongoose.model('Pagamento', PagamentoSchema);
