// ─────────────────────────────────────────────────────────────
// LastMinute — Global Express Error Handler
// Catch-all mapping of domain exception structures to standard JSON formats.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    logger.warn("HTTP request handling failure", {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      message: err.message,
    });

    res.status(err.statusCode).json({
      status: "error",
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details || null,
      },
    });
    return;
  }

  // Unhandled exceptions logged at error level
  logger.error("Unhandled request routing exception", {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    status: "error",
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected system error occurred. Please try again later.",
      details: null,
    },
  });
}
