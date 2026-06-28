// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Schemas
// Validation for: notification preferences, notification response
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { NotificationChannel, NotificationStatus, NotificationUrgency } from "@lastminute/types";

/** Channel array validator. */
const channelArray = z.array(z.nativeEnum(NotificationChannel));

/** PUT /api/v1/notifications/preferences */
export const updateNotificationPreferencesSchema = z.object({
  low: channelArray,
  medium: channelArray,
  high: channelArray,
  critical: channelArray.min(1, "At least one channel required for critical notifications"),
});

/** Notification response. */
export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.string(),
  urgency: z.nativeEnum(NotificationUrgency),
  title: z.string(),
  body: z.string(),
  relatedTaskId: z.string().uuid().nullable(),
  relatedRecommendationId: z.string().uuid().nullable(),
  channelsSent: z.array(z.nativeEnum(NotificationChannel)),
  status: z.nativeEnum(NotificationStatus),
  readAt: z.string().nullable(),
  actedAt: z.string().nullable(),
  dismissedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>;
