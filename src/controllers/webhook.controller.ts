import type { Request, Response } from "express";

import { WebhookService } from "../services/webhook.service";

import type { ValidatedWebhookEvent } from "../validation/webhook.schema";

import type { WebhookProcessingResult } from "../types/webhook";

import { logger } from "../utils/logger";


/**
 * Controller handles HTTP request/response logic.
 *
 * It receives validated, sanitized data from middleware,
 * delegates to the service layer, and returns responses.
 */
export class WebhookController {
  constructor(private webhookService: WebhookService) {}


  /**
   * POST /webhook
   *
   * Receives and processes a webhook event.
   */
  async handleWebhook(
    req: Request<object, object, ValidatedWebhookEvent>,
    res: Response<WebhookProcessingResult>
  ): Promise<void> {
    try {
      const event = req.body;

      logger.info("Webhook received", {
        eventId: event.id,

        type: event.type,
      });

      const result = await this.webhookService.processEvent(event);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(422).json(result);
      }
    } catch (error) {
      logger.error("Controller error", { error });

      res.status(500).json({
        success: false,

        eventId: "",

        message: "Internal server error",
      });
    }
  }
}


export const webhookController = new WebhookController(new WebhookService());