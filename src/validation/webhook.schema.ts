import { z } from "zod";


/**
 * Zod schema for validating incoming webhook payloads.
 *
 * Using a runtime validation library like Zod catches malformed
 * requests before they reach your business logic.
 */
export const WebhookEventSchema = z.object({
  id: z.string().uuid(),

  type: z.enum(["payment.completed", "payment.failed", "payment.refunded"]),

  createdAt: z.string().datetime(),

  data: z.object({
    transactionId: z.string(),

    amount: z.number().positive(),

    currency: z.string().length(3),
  }),
});


/**
 * Inferred TypeScript type from the Zod schema.
 *
 * This stays in sync with the schema automatically.
 */
export type ValidatedWebhookEvent = z.infer<typeof WebhookEventSchema>;