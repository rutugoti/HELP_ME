// ─────────────────────────────────────────────────────────────
// LastMinute — RequestContext Middleware
// Intercepts/generates request correlation IDs and stores in context.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { contextStore } from "../utils/context.js";

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();
  req.correlationId = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  contextStore.run({ correlationId }, () => {
    next();
  });
}
