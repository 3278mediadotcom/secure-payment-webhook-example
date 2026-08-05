import type { Request, Response, NextFunction } from "express";

import type { WebhookEvent } from "../types/webhook";

import { logger } from "../utils/logger";

import { AppError } from "../utils/AppError";


/**
 * In-memory store for processed webhook event IDs.
 *
 * In production, replace this with Redis or a database table.
 */
const processedEventIds = new Set<string>();


/**
 * Middleware that prevents duplicate webhook processing.
 *
 * Webhook providers sometimes retry failed deliveries,
 * which means the same event can arrive multiple times.
 * This middleware ensures idempotency by tracking
 * already-processed event IDs.
 */
export function verifyIdempotency(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const event = req.body as WebhookEvent | undefined;

    if (!event?.id) {
      logger.warn("Webhook event missing ID for idempotency check");

      throw new AppError(
        "Webhook event is missing an ID",
        400,
        "MISSING_EVENT_ID"
      );
    }

    if (processedEventIds.has(event.id)) {
      logger.info("Duplicate webhook event rejected", {
        eventId: event.id,
      });

      res.status(200).json({
        success: true,

        eventId: event.id,

        message: "Event already processed",
      });

      return;
    }

    processedEventIds.add(event.id);

    logger.info("New webhook event accepted", { eventId: event.id });

    next();
  } catch (error) {
    next(error);
  }
}