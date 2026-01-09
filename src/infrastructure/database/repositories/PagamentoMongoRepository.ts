import { PagamentoModel } from '../../../domain/entities/PagamentoMongo';

export class PagamentoMongoRepository {
  async criar(data: any) {
    const doc = await PagamentoModel.create(data);
    return doc.toObject();
  }

  async buscarPorId(id: string) {
    const doc = await PagamentoModel.findById(id).lean();
    return doc;
  }

  async atualizarStatus(id: string, status: string) {
    const doc = await PagamentoModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();
    return doc;
  }
}
