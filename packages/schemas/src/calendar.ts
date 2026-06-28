// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Schemas
// Validation for: connect provider, availability query,
// focus block create/cancel
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { CalendarProviderType, FocusBlockStatus, SyncStatus } from "@lastminute/types";
import { isoDateSchema, isoDateTimeSchema, uuidSchema } from "./common.js";

/** POST /api/v1/calendar/providers/connect */
export const connectProviderSchema = z.object({
  provider: z.nativeEnum(CalendarProviderType, {
    message: "Must be 'google' or 'microsoft'",
  }),
});

/** GET /api/v1/calendar/availability — query parameters. */
export const availabilityQuerySchema = z.object({
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  minimumMinutes: z.coerce.number().int().min(5).max(480).optional(),
});

/** POST /api/v1/calendar/focus-blocks */
export const createFocusBlockSchema = z.object({
  taskId: uuidSchema,
  preferredDuration: z.number().int().min(15).max(480),
  latestStartBy: isoDateTimeSchema,
  allowAutonomousBooking: z.boolean(),
});

/** Calendar provider response (public, no tokens). */
export const calendarProviderResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  provider: z.nativeEnum(CalendarProviderType),
  providerAccountId: z.string(),
  syncStatus: z.nativeEnum(SyncStatus),
  lastSyncedAt: z.string().nullable(),
  lastError: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Availability window response. */
export const availabilityWindowSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
  durationMinutes: z.number(),
});

/** Focus block response. */
export const focusBlockResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  taskId: z.string().uuid(),
  startsAt: z.string(),
  endsAt: z.string(),
  durationMinutes: z.number(),
  status: z.nativeEnum(FocusBlockStatus),
  externalEventId: z.string().nullable(),
  bookedAutonomously: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Connect provider response — OAuth URL. */
export const connectProviderResponseSchema = z.object({
  authorizationUrl: z.string().url(),
});

export type ConnectProviderInput = z.infer<typeof connectProviderSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;
export type CreateFocusBlockInput = z.infer<typeof createFocusBlockSchema>;
