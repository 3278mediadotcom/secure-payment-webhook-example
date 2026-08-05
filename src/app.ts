import express from "express";

import webhookRoutes from "./routes/webhook.routes";

import { errorHandler } from "./middleware/errorHandler";


const app = express();


app.use(express.json());


app.use("/webhook", webhookRoutes);


app.get("/health", (_req, res) => {
  res.json({
    status: "ok",

    service: "secure-payment-webhook-example",
  });
});


app.use(errorHandler);


export default app;