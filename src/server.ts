import "dotenv/config";

import app from "./app";

import { config } from "./config/environment";


const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});


process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server.");

  server.close(() => {
    console.log("Server closed.");
  });
});
