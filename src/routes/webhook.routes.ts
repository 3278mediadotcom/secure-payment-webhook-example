import { Router } from "express";

import { webhookController } from "../controllers/webhook.controller";

import { verifyWebhookSignature } from "../middleware/verifySignature";

import { verifyIdempotency } from "../middleware/idempotency";

import { WebhookEventSchema } from "../validation/webhook.schema";

import { AppError } from "../utils/AppError";


const router = Router();


/**
 * POST /webhook
 *
 * Accepts webhook events from payment providers.
 *
 * Middleware order matters:
 * 1. express.json() parses the body
 * 2. validateWebhookPayload ensures data integrity
 * 3. verifyWebhookSignature checks authenticity
 * 4. verifyIdempotency prevents duplicates
 * 5. WebhookController processes the event
 */
router.post(
  "/",
  async (req, _res, next) => {
    try {
      req.body = WebhookEventSchema.parse(req.body);

      next();
    } catch (error) {
      next(
        new AppError(
          "Invalid webhook payload",
          400,
          "INVALID_PAYLOAD"
        )
      );
    }
  },
  verifyWebhookSignature,
  verifyIdempotency,
  webhookController.handleWebhook.bind(webhookController)
);


export default router;
