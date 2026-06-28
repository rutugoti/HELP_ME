// ─────────────────────────────────────────────────────────────
// LastMinute — Request Query Validation Middleware
// Validates request query using Zod schemas per Rule 5.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Middleware factory to validate Express request query parameters against a Zod schema.
 */
export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.query);
    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      next(new ValidationError("Request query validation failed", details));
      return;
    }
    req.query = result.data;
    next();
  };
}
