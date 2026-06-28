// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Global Error Handler
// Catch-all for gateway-level errors, ensuring clean JSON responses.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger.js";

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Gateway unhandled exception", {
    error: err.message,
    stack: err.stack,
  });

  res.status(502).json({
    status: "error",
    error: {
      code: "BAD_GATEWAY",
      message: "An error occurred while routing the request to the downstream service.",
      details: null,
    },
  });
}
