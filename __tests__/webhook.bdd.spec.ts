jest.mock("axios", () => ({
  patch: jest.fn().mockResolvedValue({ data: {} }),
  get: jest.fn(),
  post: jest.fn(),
}));

// ✅ Mock do mongoose model para não tentar insertOne de verdade
jest.mock("../src/domain/entities/PagamentoMongo", () => ({
  PagamentoModel: {
    create: jest.fn().mockResolvedValue({ toObject: () => ({ ok: true }) }),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

import axios from "axios";
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

describe("WebhookController (BDD)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PEDIDO_SERVICE_URL = "http://localhost:3000";
  });

  // aumenta um pouquinho o timeout só por segurança
  it(
    "GIVEN payment.updated APPROVED com pedidoId, WHEN processa, THEN chama pedido-service e responde 200",
    async () => {
      // GIVEN
      const pedidoId = "f9774d43-cdcd-459f-823a-f33660f2232d";
      const req: any = {
        body: {
          action: "payment.updated",
          data: { id: "qualquer" },
          pedidoId,
          status: "APPROVED",
        },
      };

      const res = mockRes();

      // WHEN
      await WebhookController.receberNotificacao(req, res);

      // THEN
      expect(res.statusCode).toBe(200);

      const axiosAny: any = axios as any;
      expect(axiosAny.patch).toHaveBeenCalled();

      const calledUrls = axiosAny.patch.mock.calls.map((c: any[]) => c[0]);
      expect(calledUrls.some((url: string) => url.includes(pedidoId))).toBe(true);
    },
    10000
  );
});
