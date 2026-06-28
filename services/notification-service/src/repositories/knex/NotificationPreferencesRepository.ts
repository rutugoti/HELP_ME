// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Preferences Knex Repository
// Maps user_preferences notification columns per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { UpdateNotificationPreferencesInput, NotificationChannel } from "@lastminute/types";
import type { INotificationPreferencesRepository } from "../interfaces.js";

export class NotificationPreferencesRepository implements INotificationPreferencesRepository {
  async getPreferences(userId: string): Promise<UpdateNotificationPreferencesInput | null> {
    const row = await db("user_preferences").where({ user_id: userId }).first();
    if (!row) return null;

    const parse = (val: unknown): NotificationChannel[] => {
      if (typeof val === "string") return JSON.parse(val);
      if (Array.isArray(val)) return val as NotificationChannel[];
      return [];
    };

    return {
      low: parse(row.notification_low_channels),
      medium: parse(row.notification_medium_channels),
      high: parse(row.notification_high_channels),
      critical: parse(row.notification_critical_channels),
    };
  }

  async updatePreferences(
    userId: string,
    prefs: UpdateNotificationPreferencesInput
  ): Promise<void> {
    await db("user_preferences")
      .where({ user_id: userId })
      .update({
        notification_low_channels: JSON.stringify(prefs.low),
        notification_medium_channels: JSON.stringify(prefs.medium),
        notification_high_channels: JSON.stringify(prefs.high),
        notification_critical_channels: JSON.stringify(prefs.critical),
        updated_at: new Date(),
      });
  }
}
