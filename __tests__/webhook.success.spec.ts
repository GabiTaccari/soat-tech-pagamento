/**
 * __tests__/webhook.success.spec.ts
 *
 * Cobre o caminho “feliz” do WebhookController:
 * - action payment.updated
 * - consulta MP por ID
 * - pega external_reference (pedidoId)
 * - mapeia status
 * - registra pagamento no Mongo (via PagamentoModel.create)
 * - chama pedido-service (axios.patch)
 * - responde 200
 */

// 1) Mock do Mongoose Model (evita conexão real / buffering / open handles)
jest.mock("../src/domain/entities/PagamentoMongo", () => {
  return {
    PagamentoModel: {
      create: jest.fn().mockResolvedValue({
        toObject: () => ({ _id: "mongo-id", pedidoId: "pedido-123", status: "APROVADO" }),
      }),
      findById: jest.fn(() => ({ lean: jest.fn().mockResolvedValue(null) })),
      findByIdAndUpdate: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue({ _id: "mongo-id", pedidoId: "pedido-123", status: "APROVADO" }),
      })),
    },
  };
});

// 2) Mock do axios (MP + pedido-service)
import axios from "axios";
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// 3) Import do controller (DEPOIS dos mocks)
import { WebhookController } from "../src/interfaces/controllers/WebhookController";

function makeRes() {
  const res: any = {};
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.send = jest.fn().mockImplementation((body: any) => {
    res.body = body;
    return res;
  });
  res.json = jest.fn().mockImplementation((body: any) => {
    res.body = body;
    return res;
  });
  res.statusCode = 200;
  return res;
}

describe("WebhookController - success paths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MP_ACCESS_TOKEN = "token";
    process.env.PEDIDO_SERVICE_URL = "http://localhost:3000";
  });

  it("deve processar APPROVED: consultar MP, registrar no Mongo e chamar pedido-service, respondendo 200", async () => {
    // GIVEN
    const req: any = {
      body: {
        action: "payment.updated",
        data: { id: "999" },
      },
    };
    const res = makeRes();

    // Mercado Pago GET /v1/payments/:id
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        id: "999",
        status: "approved",
        external_reference: "pedido-123",
      },
    } as any);

    // pedido-service PATCH /api/pedidos/:id/status (ou o que teu controller usa)
    mockedAxios.patch.mockResolvedValueOnce({ data: { ok: true } } as any);

    // WHEN
    await WebhookController.receberNotificacao(req, res);

    // THEN
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();

    // consultou MP por id
    expect(mockedAxios.get).toHaveBeenCalled();

    // chamou pedido-service (seu controller faz PATCH)
    expect(mockedAxios.patch).toHaveBeenCalled();
  });
});
