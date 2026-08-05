/**
 * Supported webhook event types.
 * 
 * In a real payment system, providers send different
 * event types depending on what happened.
 */
export type WebhookEventType =
  | "payment.completed"
  | "payment.failed"
  | "payment.refunded";


/**
 * Generic webhook payload structure.
 *
 * This represents the data our system expects
 * from an external service.
 */
export interface WebhookEvent {
  id: string;

  type: WebhookEventType;

  createdAt: string;

  data: {
    transactionId: string;

    amount: number;

    currency: string;
  };
}


/**
 * Result returned after processing a webhook.
 */
export interface WebhookProcessingResult {
  success: boolean;

  eventId: string;

  message: string;
}