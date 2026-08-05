import type { Request, Response, NextFunction } from "express";

import { verifySignature } from "../utils/crypto";

import { config } from "../config/environment";

import { logger } from "../utils/logger";

import { AppError } from "../utils/AppError";


/**
 * Middleware that verifies the HMAC-SHA256 signature
 * of incoming webhook requests.
 *
 * Expects headers:
 * - X-Webhook-Signature: hex-encoded HMAC-SHA256
 * - X-Webhook-Timestamp: Unix timestamp (optional but recommended)
 *
 * Rejects requests with:
 * - 401 Unauthorized if signature is missing or invalid
 * - 400 Bad Request if timestamp is stale (replay protection)
 */
export function verifyWebhookSignature(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const signature = req.headers["x-webhook-signature"] as string | undefined;

    if (!signature) {
      logger.warn("Webhook signature missing from headers");

      throw new AppError(
        "Webhook signature verification failed",
        401,
        "MISSING_SIGNATURE"
      );
    }

    const timestampHeader = req.headers["x-webhook-timestamp"] as
      | string
      | undefined;

    if (timestampHeader) {
      const timestamp = Number(timestampHeader);

      const now = Math.floor(Date.now() / 1000);

      const fiveMinutes = 5 * 60;

      if (Math.abs(now - timestamp) > fiveMinutes) {
        logger.warn("Webhook timestamp too old", { timestamp });

        throw new AppError(
          "Webhook request is stale",
          400,
          "STALE_WEBHOOK"
        );
      }
    }

    const payload = req.body;

    if (!payload) {
      logger.warn("Empty webhook payload");

      throw new AppError(
        "Webhook payload is empty",
        400,
        "EMPTY_PAYLOAD"
      );
    }

    const rawBody = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(JSON.stringify(payload));

    const isValid = verifySignature(
      rawBody,
      signature,
      config.webhookSecret
    );

    if (!isValid) {
      logger.warn("Invalid webhook signature", {
        receivedSignature: signature,
      });

      throw new AppError(
        "Webhook signature verification failed",
        401,
        "INVALID_SIGNATURE"
      );
    }

    logger.info("Webhook signature verified successfully");

    next();
  } catch (error) {
    next(error);
  }
}