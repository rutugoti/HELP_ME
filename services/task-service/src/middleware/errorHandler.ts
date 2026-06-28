// ─────────────────────────────────────────────────────────────
// LastMinute — Express Error Handling Middleware
// Aligns with error formats specified in Api.md.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    logger.warn("Application logic error", {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    res.status(err.statusCode).json({
      status: "error",
      error: {
        code: err.code,
        message: err.message,
        details: err.details || [],
      },
      meta: {
        correlationId: req.correlationId,
      },
    });
    return;
  }

  logger.error("Unhandled server exception", {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    status: "error",
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      details: [],
    },
    meta: {
      correlationId: req.correlationId,
    },
  });
}
