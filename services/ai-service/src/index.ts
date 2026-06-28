// ─────────────────────────────────────────────────────────────
// LastMinute — AI Service Entry Point
// Implements startup checks (Rule 5), middleware stack, and graceful shutdown.
// ─────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { db } from "@lastminute/database";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { aiRouter } from "./routes/ai.js";

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Trace requests with correlation IDs per Rule 8
app.use(requestContextMiddleware);

// Health check endpoint
app.get("/health", async (_req, res) => {
  try {
    await db.raw("SELECT 1");
    res.status(200).json({ status: "UP", service: "ai-service" });
  } catch {
    res.status(500).json({ status: "DOWN", service: "ai-service" });
  }
});

// Mount routes
app.use("/api/v1/ai", aiRouter);

// Global Error Handler
app.use(errorHandlerMiddleware);

/**
 * Startup validation (Rule 5): Verifies database connection before binding port.
 */
async function startServer() {
  logger.info("Starting AI Service...");

  try {
    // Ping database
    logger.info("Verifying database connection...");
    await db.raw("SELECT 1");
    logger.info("Database connection verified successfully.");
  } catch (err) {
    const error = err as Error;
    logger.error("Database connection verification failed. Application is exiting.", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`AI Service listening on port ${config.port} [ENV: ${config.env}]`);
  });
}

import { queueClient } from "./utils/queue.js";

// Graceful shutdown handlers
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  try {
    logger.info("Closing queue client connection...");
    await queueClient.close();
    logger.info("Closing database connection pool...");
    await db.destroy();
    logger.info("Database connection pool closed.");
    process.exit(0);
  } catch (err) {
    const error = err as Error;
    logger.error("Error during graceful shutdown", { error: error.message });
    process.exit(1);
  }
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Run startup
startServer();
