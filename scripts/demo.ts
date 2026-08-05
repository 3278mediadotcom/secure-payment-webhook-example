/**
 * Demo script — shows the full webhook flow in one command.
 *
 * Usage: npm run demo
 *
 * 1. Starts the server
 * 2. Generates a signed webhook payload
 * 3. Sends it to POST /webhook
 * 4. Prints the response
 */
import { createHmac } from "crypto";

import { spawn } from "child_process";

import { config } from "../src/config/environment";


const PORT = config.port;

const BASE_URL = `http://localhost:${PORT}`;


const demoEvent = {
  id: "123e4567-e89b-12d3-a456-426614174000",

  type: "payment.completed",

  createdAt: new Date().toISOString(),

  data: {
    transactionId: "txn_demo_456",

    amount: 4999,

    currency: "USD",
  },
};


function signPayload(payload: object): string {
  return createHmac("sha256", config.webhookSecret)
    .update(JSON.stringify(payload))
    .digest("hex");
}


async function waitForServer(url: string, timeoutMs = 10000): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/health`);

      if (res.ok) return;
    } catch {
      // server not up yet
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("Server did not start in time");
}


async function main(): Promise<void> {
  console.log("\n=== Secure Payment Webhook Demo ===\n");

  console.log("Starting server...");

  const server = spawn("npx", ["tsx", "src/server.ts"], {
    stdio: "ignore",

    detached: true,
  });

  try {
    await waitForServer(BASE_URL);

    console.log("✓ Server started\n");

    const signature = signPayload(demoEvent);

    console.log("Sending webhook...\n");

    console.log("Payload:");

    console.log(JSON.stringify(demoEvent, null, 2));

    console.log("\nSignature:");

    console.log(signature);

    console.log("\nResponse:\n");

    const res = await fetch(`${BASE_URL}/webhook`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-Webhook-Signature": signature,
      },

      body: JSON.stringify(demoEvent),
    });

    const body = await res.json();

    console.log(JSON.stringify(body, null, 2));

    console.log("\n✓ Demo complete\n");
  } finally {
    server.kill();
  }
}


main().catch((error) => {
  console.error("Demo failed:", error);

  process.exit(1);
});