jest.mock("axios", () => ({
  post: jest.fn().mockResolvedValue({ data: { qr_data: "QR_TESTE" } }),
  get: jest.fn().mockResolvedValue({
    data: {
      id: "pedido-1",
      itens: [
        { quantidade: 2, produto: { nome: "X", preco: 10 } }, // 20
        { quantidade: 1, produto: { nome: "Y", preco: 5 } },  // 5
      ],
    },
  }),
}));

// ✅ Se o seu CheckoutPagamento registra no Mongo via PagamentoMongoRepository,
// mockamos o model do mongoose para não tentar gravar de verdade
jest.mock("../src/domain/entities/PagamentoMongo", () => ({
  PagamentoModel: {
    create: jest.fn().mockResolvedValue({ toObject: () => ({ ok: true }) }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

import axios from "axios";
import { CheckoutPagamento } from "../src/application/usecases/CheckoutPagamento";

describe("CheckoutPagamento", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MP_COLLECTOR_ID = "123";
    process.env.MP_ACCESS_TOKEN = "token";
    process.env.PEDIDO_SERVICE_URL = "http://localhost:3000";
  });

  it("deve gerar qr_data e registrar pagamento", async () => {
    const useCase = new CheckoutPagamento();
    const qr = await useCase.gerarQrCodePagamento("pedido-1");

    expect(qr).toBe("QR_TESTE");

    const axiosAny: any = axios as any;

    // buscou pedido via HTTP
    expect(axiosAny.get).toHaveBeenCalled();

    // gerou QR no MP (mock)
    expect(axiosAny.post).toHaveBeenCalled();
  });
});
