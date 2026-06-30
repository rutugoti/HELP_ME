// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Proxy Routes Configuration
// Maps incoming URL prefixes to downstream service URLs per Architecture.md.
// ─────────────────────────────────────────────────────────────

import type { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

/**
 * Registers reverse proxy routes that forward authenticated requests
 * to the appropriate downstream microservice.
 */
export function registerProxyRoutes(router: Router): void {
  const proxyOptions = (target: string, serviceName: string) =>
    createProxyMiddleware({
      target,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req) => {
          // Forward correlation ID to downstream services
          const correlationId = req.headers["x-correlation-id"];
          if (correlationId) {
            proxyReq.setHeader("x-correlation-id", correlationId as string);
          }
        },
        error: (err, _req, res) => {
          logger.error(`Proxy error forwarding to ${serviceName}`, {
            error: err.message,
            target,
          });
          if ("writeHead" in res && typeof res.writeHead === "function") {
            (res as import("http").ServerResponse).writeHead(502, {
              "Content-Type": "application/json",
            });
            (res as import("http").ServerResponse).end(
              JSON.stringify({
                status: "error",
                error: {
                  code: "BAD_GATEWAY",
                  message: `Downstream service ${serviceName} is unavailable.`,
                  details: null,
                },
              })
            );
          }
        },
      },
    });

  // User Service routes
  router.use(
    "/api/v1/auth",
    proxyOptions(`${config.services.userService}/api/v1/auth`, "user-service")
  );
  router.use(
    "/api/v1/users",
    proxyOptions(`${config.services.userService}/api/v1/users`, "user-service")
  );

  // Task Service routes
  router.use(
    "/api/v1/tasks",
    proxyOptions(`${config.services.taskService}/api/v1/tasks`, "task-service")
  );
  router.use(
    "/api/v1/goals",
    proxyOptions(`${config.services.taskService}/api/v1/goals`, "task-service")
  );
  router.use(
    "/api/v1/habits",
    proxyOptions(`${config.services.taskService}/api/v1/habits`, "task-service")
  );

  // Calendar Service routes
  router.use(
    "/api/v1/calendar",
    proxyOptions(`${config.services.calendarService}/api/v1/calendar`, "calendar-service")
  );

  // AI Service routes
  router.use("/api/v1/ai", proxyOptions(`${config.services.aiService}/api/v1/ai`, "ai-service"));

  // Notification Service routes
  router.use(
    "/api/v1/notifications",
    proxyOptions(
      `${config.services.notificationService}/api/v1/notifications`,
      "notification-service"
    )
  );

  // Webhook routes (bypasses JWT auth, handled at service level)
  router.use(
    "/api/v1/webhooks",
    proxyOptions(`${config.services.calendarService}/api/v1/webhooks`, "calendar-service")
  );
}
