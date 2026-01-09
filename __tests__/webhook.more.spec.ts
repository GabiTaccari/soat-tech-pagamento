// __tests__/webhook.more.spec.ts
import axios from "axios";
import { WebhookController } from "../src/interfaces/controllers/WebhookController";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockImplementation(() => res);
  res.send = jest.fn().mockImplementation(() => res);
  res.json = jest.fn().mockImplementation(() => res);
  return res;
}

describe("WebhookController - more paths (prático)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.MP_ACCESS_TOKEN = "fake-token"; // garante que entra no fluxo do MP
  });

  afterEach(() => {
    delete process.env.MP_ACCESS_TOKEN;
  });

  it("deve retornar 200 e ignorar evento que não é payment.created/payment.updated", async () => {
    const req: any = { body: { action: "order.created", data: { id: "x" } } };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 200 quando não vier id de pagamento (sem data.id)", async () => {
    const req: any = { body: { action: "payment.updated", data: {} } };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    // teu controller: return res.status(200).send('OK (sem id)');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 200 quando o MP retornar pagamento sem external_reference", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { status: "approved" }, // sem external_reference
    } as any);

    const req: any = { body: { action: "payment.updated", data: { id: "1" } } };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    expect(mockedAxios.get).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 200 quando GET /payments/:id der 404 (pagamento ainda não disponível)", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } } as any);

    const req: any = { body: { action: "payment.updated", data: { id: "2" } } };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    expect(mockedAxios.get).toHaveBeenCalled();
    // teu controller: return res.status(200).send('OK (pagamento ainda não disponível)');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 200 quando o MP falhar com erro diferente de 404 (controller faz fail-safe)", async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: "boom" } },
      message: "Request failed",
    } as any);

    const req: any = { body: { action: "payment.updated", data: { id: "3" } } };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    // Pelo teu log, o controller faz:
    // console.warn('Erro consultando MP por ID:', ...) e retorna 200 'OK (erro consultando MP)'
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
