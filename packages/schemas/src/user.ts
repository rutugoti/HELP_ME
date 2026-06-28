// ─────────────────────────────────────────────────────────────
// LastMinute — User Schemas
// Validation for: update profile, preferences (full replace),
// user stats response
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { EscalationThreshold, NotificationChannel } from "@lastminute/types";
import { timeStringSchema, workingDaysSchema } from "./common.js";

/** Notification channel array — validated per urgency level. */
const channelArraySchema = z
  .array(z.nativeEnum(NotificationChannel))
  .min(1, "At least one channel required");

/** PATCH /api/v1/users/me */
export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  timezone: z.string().min(1).max(100).optional(),
  voiceEnabled: z.boolean().optional(),
});

/** PUT /api/v1/users/me/preferences — full replacement. */
export const updatePreferencesSchema = z.object({
  notificationLowChannels: channelArraySchema,
  notificationMediumChannels: channelArraySchema,
  notificationHighChannels: channelArraySchema,
  notificationCriticalChannels: channelArraySchema,
  workingHoursStart: timeStringSchema,
  workingHoursEnd: timeStringSchema,
  workingDays: workingDaysSchema,
  voiceEnabled: z.boolean(),
  autonomousSchedulingEnabled: z.boolean(),
  contentPrivacyMode: z.boolean(),
  escalationContactEmail: z.string().email().nullable(),
  escalationContactName: z.string().max(255).nullable(),
  escalationThreshold: z.nativeEnum(EscalationThreshold).nullable(),
});

/** User public profile response. */
export const userPublicSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.string(),
  timezone: z.string(),
  isVerified: z.boolean(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** User stats response. */
export const userStatsSchema = z.object({
  completionRateByCategory: z.record(z.string(), z.number()),
  averageInitiationDelayByCategory: z.record(z.string(), z.number()),
  overrideRate: z.number(),
  streaksByCategory: z.record(z.string(), z.number()),
  productivityScore: z.number(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
