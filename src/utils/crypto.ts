import { createHmac, timingSafeEqual } from "crypto";


/**
 * Verifies an HMAC-SHA256 signature for webhook payloads.
 *
 * Most payment providers (Stripe, PayPal, etc.) use HMAC-SHA256
 * to sign webhook payloads so receivers can verify:
 * 1. The payload hasn't been tampered with
 * 2. The request actually came from the expected sender
 *
 * @param payload - Raw request body bytes
 * @param signature - Signature from request header
 * @param secret - Shared webhook secret
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  payload: Buffer,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}


/**
 * Computes the expected HMAC-SHA256 signature for a payload.
 *
 * Useful for tests and for explaining the algorithm
 * in documentation.
 */
export function computeSignature(
  payload: Buffer,
  secret: string
): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}