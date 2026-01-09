jest.mock("../src/domain/entities/PagamentoMongo", () => {
  const findById = jest.fn((_id: string) => ({
    lean: jest.fn().mockResolvedValue({ _id: "1", status: "AGUARDANDO" }),
  }));

  const findByIdAndUpdate = jest.fn((_id: string, _update: any, _opts: any) => ({
    lean: jest.fn().mockResolvedValue({ _id: "1", status: "APROVADO" }),
  }));

  const create = jest.fn().mockResolvedValue({
    toObject: () => ({ _id: "1", status: "AGUARDANDO" }),
  });

  return {
    PagamentoModel: {
      create,
      findById,
      findByIdAndUpdate,
    },
  };
});

import { PagamentoMongoRepository } from "../src/infrastructure/database/repositories/PagamentoMongoRepository";

describe("PagamentoMongoRepository", () => {
  it("deve criar", async () => {
    const repo = new PagamentoMongoRepository();
    const r = await repo.criar({ pedidoId: "p1", status: "AGUARDANDO" });
    expect(r).toEqual(expect.objectContaining({ status: "AGUARDANDO" }));
  });

  it("deve buscarPorId", async () => {
    const repo = new PagamentoMongoRepository();
    const r = await repo.buscarPorId("1");
    expect(r).toEqual(expect.objectContaining({ status: "AGUARDANDO" }));
  });

  it("deve atualizarStatus", async () => {
    const repo = new PagamentoMongoRepository();
    const r = await repo.atualizarStatus("1", "APROVADO");
    expect(r).toEqual(expect.objectContaining({ status: "APROVADO" }));
  });
});
