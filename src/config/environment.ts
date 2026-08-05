import "dotenv/config";


export const config = {
  port: Number(process.env.PORT) || 3000,

  webhookSecret:
    process.env.WEBHOOK_SECRET || "development-secret",

  nodeEnvironment:
    process.env.NODE_ENV || "development",
};