// ─────────────────────────────────────────────────────────────
// LastMinute — Request Body Validation Middleware
// Validates request body using Zod schemas per Rule 5.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod";
import { ValidationError } from "../utils/errors.js";

/**
 * Middleware factory to validate Express request bodies against a Zod schema.
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync(req.body);
    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      next(new ValidationError("Request validation failed", details));
      return;
    }
    req.body = result.data;
    next();
  };
}
