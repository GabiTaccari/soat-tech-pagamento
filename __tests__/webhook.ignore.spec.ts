import { WebhookController } from "../src/interfaces/controllers/WebhookController";

function mockRes() {
  const res: any = {};
  res.statusCode = 200;
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.send = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe("WebhookController - ignores", () => {
  it("deve ignorar evento desconhecido e retornar 200", async () => {
    const req: any = {
      body: { action: "order.created", data: { id: "x" } },
    };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("deve retornar 200 quando payment.updated não tiver id", async () => {
    const req: any = {
      body: { action: "payment.updated", data: {} },
    };
    const res = mockRes();

    await WebhookController.receberNotificacao(req, res);

    // comportamento real do controller
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });
});
