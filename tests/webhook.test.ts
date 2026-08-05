import { describe, it, expect, beforeAll } from "vitest";

import request from "supertest";

import { createHmac } from "crypto";

import app from "../src/app";


const SECRET = "development-secret";


function signPayload(payload: object): string {
  return createHmac("sha256", SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
}


const validEvent = {
  id: "123e4567-e89b-12d3-a456-426614174000",

  type: "payment.completed",

  createdAt: "2025-01-01T00:00:00Z",

  data: {
    transactionId: "txn_123",

    amount: 99.99,

    currency: "USD",
  },
};


describe("Webhook API", () => {
  describe("GET /health", () => {
    it("returns ok status", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        status: "ok",

        service: "secure-payment-webhook-example",
      });
    });
  });


  describe("POST /webhook", () => {
    it("rejects request with missing signature", async () => {
      const res = await request(app)
        .post("/webhook")
        .send(validEvent);

      expect(res.status).toBe(401);

      expect(res.body).toEqual({
        success: false,

        error: {
          code: "MISSING_SIGNATURE",

          message: "Webhook signature verification failed",
        },
      });
    });


    it("rejects request with invalid signature", async () => {
      const res = await request(app)
        .post("/webhook")
        .set("X-Webhook-Signature", "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef")
        .send(validEvent);

      expect(res.status).toBe(401);

      expect(res.body).toEqual({
        success: false,

        error: {
          code: "INVALID_SIGNATURE",

          message: "Webhook signature verification failed",
        },
      });
    });


    it("rejects invalid payload", async () => {
      const res = await request(app)
        .post("/webhook")
        .set("X-Webhook-Signature", signPayload({ banana: "not-valid" }))
        .send({ banana: "not-valid" });

      expect(res.status).toBe(400);

      expect(res.body).toEqual({
        success: false,

        error: {
          code: "INVALID_PAYLOAD",

          message: "Invalid webhook payload",
        },
      });
    });


    it("accepts valid webhook event", async () => {
      const signature = signPayload(validEvent);

      const res = await request(app)
        .post("/webhook")
        .set("X-Webhook-Signature", signature)
        .send(validEvent);

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        success: true,

        eventId: validEvent.id,

        message: "Event processed",
      });
    });


    it("rejects duplicate webhook event (idempotency)", async () => {
      const signature = signPayload(validEvent);

      const first = await request(app)
        .post("/webhook")
        .set("X-Webhook-Signature", signature)
        .send(validEvent);

      expect(first.status).toBe(200);

      const second = await request(app)
        .post("/webhook")
        .set("X-Webhook-Signature", signature)
        .send(validEvent);

      expect(second.status).toBe(200);

      expect(second.body).toEqual({
        success: true,

        eventId: validEvent.id,

        message: "Event already processed",
      });
    });
  });
});