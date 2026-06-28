// ─────────────────────────────────────────────────────────────
// LastMinute — Common Zod Schemas
// Reusable schema primitives and API response wrappers.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";

/** UUID v4 format validator. */
export const uuidSchema = z.string().uuid("Must be a valid UUID v4");

/** ISO 8601 datetime string validator. */
export const isoDateTimeSchema = z
  .string()
  .datetime({ message: "Must be a valid ISO 8601 datetime string" });

/** ISO 8601 date string (YYYY-MM-DD) validator. */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date in YYYY-MM-DD format");

/** Time string (HH:MM) validator. */
export const timeStringSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Must be a valid time in HH:MM format")
  .refine((val) => {
    const [h, m] = val.split(":").map(Number) as [number, number];
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }, "Hours must be 0-23, minutes must be 0-59");

/** Pagination query parameters. Cursor-based, not offset-based. */
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

/** Standard API response envelope. */
export function apiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.enum(["success", "error"]),
    data: dataSchema,
    meta: z
      .object({
        nextCursor: z.string().nullable().default(null),
        hasMore: z.boolean().default(false),
        totalCount: z.number().int().optional(),
      })
      .default({}),
  });
}

/** API error detail schema. */
export const apiErrorDetailSchema = z.object({
  field: z.string(),
  message: z.string(),
});

/** Standard API error response. */
export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  details: z.array(apiErrorDetailSchema).default([]),
});

/** Working days array — integers 0 (Sunday) through 6 (Saturday). */
export const workingDaysSchema = z
  .array(z.number().int().min(0).max(6))
  .min(1, "At least one working day required")
  .max(7)
  .refine((days) => new Set(days).size === days.length, "Working days must not contain duplicates");

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
