// ─────────────────────────────────────────────────────────────
// LastMinute — Request Context & Correlation ID Middleware
// Wraps request processing in AsyncLocalStorage context per Rule 8.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { contextStorage } from "../utils/context.js";
import { logger } from "../config/logger.js";

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  // Retrieve from headers (passed by API Gateway) or generate a new one
  const correlationId = (req.header("x-correlation-id") || randomUUID()) as string;
  req.correlationId = correlationId;

  // Set correlation ID header in the response
  res.setHeader("x-correlation-id", correlationId);

  // Wrap in async local storage context
  contextStorage.run({ correlationId }, () => {
    logger.info("Incoming HTTP Request", {
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.header("user-agent"),
    });

    next();
  });
}
