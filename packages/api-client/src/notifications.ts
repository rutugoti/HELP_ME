// ─────────────────────────────────────────────────────────────
// LastMinute — Notification API Functions
// /api/v1/notifications/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type { ApiResponse, Notification, UUID } from "@lastminute/types";
import type { UpdateNotificationPreferencesInput } from "@lastminute/schemas";

/** Returns notification history sorted by timestamp descending. */
export async function getNotifications(
  client: KyInstance
): Promise<ApiResponse<Notification[]>> {
  return client.get("api/v1/notifications").json();
}

/** Marks a notification as read. */
export async function markRead(
  client: KyInstance,
  notificationId: UUID
): Promise<void> {
  await client.post(`api/v1/notifications/${notificationId}/read`);
}

/** Marks a notification as acted on. */
export async function markActed(
  client: KyInstance,
  notificationId: UUID
): Promise<void> {
  await client.post(`api/v1/notifications/${notificationId}/acted`);
}

/** Updates notification channel preferences per urgency level. */
export async function updateNotificationPreferences(
  client: KyInstance,
  input: UpdateNotificationPreferencesInput
): Promise<void> {
  await client.put("api/v1/notifications/preferences", { json: input });
}
