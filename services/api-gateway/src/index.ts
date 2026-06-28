// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Entry Point
// Single entry point for all client traffic per Architecture.md.
// Handles JWT auth, rate limiting, proxy routing, WebSocket, and error handling.
// ─────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { requestContextMiddleware } from "./middleware/requestContext.js";
import { gatewayAuthMiddleware } from "./middleware/auth.js";
import { rateLimiterMiddleware, closeRedisConnection } from "./middleware/rateLimiter.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";
import { registerProxyRoutes } from "./routes/proxy.js";
import { initWebSocketServer, getActiveConnectionCount } from "./websocket/server.js";

const app = express();
const server = createServer(app);

// ─────────────────────────────────────────────────────────────
// Global Middleware Stack
// ─────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());
app.use(cors());

// Correlation ID origination at the gateway level per Rule 8
app.use(requestContextMiddleware);

// Rate limiting applied at the gateway for all endpoints per Rules.md
app.use(rateLimiterMiddleware);

// ─────────────────────────────────────────────────────────────
// Health Check (no auth required)
// ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "UP",
    service: "api-gateway",
    activeWebSockets: getActiveConnectionCount(),
  });
});

// ─────────────────────────────────────────────────────────────
// Public Routes (no JWT auth — auth handled by downstream services)
// ─────────────────────────────────────────────────────────────
// Auth endpoints (register, login, refresh) don't require gateway-level JWT
// Webhook endpoints are authenticated by provider-specific signatures
const publicPrefixes = ["/api/v1/auth", "/api/v1/webhooks"];

app.use((req, res, next) => {
  const isPublic = publicPrefixes.some((prefix) => req.path.startsWith(prefix));
  if (isPublic) {
    next();
    return;
  }
  // All other routes require JWT authentication at the gateway
  gatewayAuthMiddleware(req, res, next);
});

// ─────────────────────────────────────────────────────────────
// Proxy Routes to Downstream Services
// ─────────────────────────────────────────────────────────────
registerProxyRoutes(app);

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use(errorHandlerMiddleware);

// ─────────────────────────────────────────────────────────────
// WebSocket Server Initialization
// ─────────────────────────────────────────────────────────────
initWebSocketServer(server);

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────
function startServer() {
  logger.info("Starting API Gateway...");

  server.listen(config.port, () => {
    logger.info(`API Gateway listening on port ${config.port} [ENV: ${config.env}]`);
    logger.info("Downstream service endpoints configured", {
      userService: config.services.userService,
      taskService: config.services.taskService,
      calendarService: config.services.calendarService,
      aiService: config.services.aiService,
      notificationService: config.services.notificationService,
    });
  });
}

// Graceful shutdown handlers
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down API Gateway gracefully...`);
  try {
    await closeRedisConnection();
  } catch (err) {
    logger.error("Error closing Redis rate limiter connection", { error: (err as Error).message });
  }
  server.close(() => {
    logger.info("API Gateway HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

startServer();
