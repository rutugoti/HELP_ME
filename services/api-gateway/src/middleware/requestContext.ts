// ─────────────────────────────────────────────────────────────
// LastMinute — RequestContext Middleware
// Establishes correlation ID at the API Gateway per Rule 8.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { contextStore } from "../utils/context.js";

/**
 * Generates a correlation ID for every incoming request at the gateway level.
 * This ID is propagated through all downstream service calls via the
 * x-correlation-id header.
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();
  req.correlationId = correlationId;
  req.headers["x-correlation-id"] = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  contextStore.run({ correlationId }, () => {
    next();
  });
}
