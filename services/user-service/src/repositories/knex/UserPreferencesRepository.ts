// ─────────────────────────────────────────────────────────────
// LastMinute — UserPreferences Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { UserPreferences, NotificationChannel, EscalationThreshold } from "@lastminute/types";
import type { IUserPreferencesRepository } from "../interfaces.js";
import type { Knex } from "knex";

export function mapRowToPreferences(row: Record<string, unknown>): UserPreferences {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    notificationLowChannels: (typeof row["notification_low_channels"] === "string"
      ? JSON.parse(row["notification_low_channels"])
      : row["notification_low_channels"]) as NotificationChannel[],
    notificationMediumChannels: (typeof row["notification_medium_channels"] === "string"
      ? JSON.parse(row["notification_medium_channels"])
      : row["notification_medium_channels"]) as NotificationChannel[],
    notificationHighChannels: (typeof row["notification_high_channels"] === "string"
      ? JSON.parse(row["notification_high_channels"])
      : row["notification_high_channels"]) as NotificationChannel[],
    notificationCriticalChannels: (typeof row["notification_critical_channels"] === "string"
      ? JSON.parse(row["notification_critical_channels"])
      : row["notification_critical_channels"]) as NotificationChannel[],
    workingHoursStart: row["working_hours_start"] as string,
    workingHoursEnd: row["working_hours_end"] as string,
    workingDays: (typeof row["working_days"] === "string"
      ? JSON.parse(row["working_days"])
      : row["working_days"]) as number[],
    voiceEnabled: Boolean(row["voice_enabled"]),
    autonomousSchedulingEnabled: Boolean(row["autonomous_scheduling_enabled"]),
    contentPrivacyMode: Boolean(row["content_privacy_mode"]),
    escalationContactEmail: (row["escalation_contact_email"] as string | undefined) ?? null,
    escalationContactName: (row["escalation_contact_name"] as string | undefined) ?? null,
    escalationThreshold: (row["escalation_threshold"] as EscalationThreshold | undefined) ?? null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class UserPreferencesRepository implements IUserPreferencesRepository {
  async findByUserId(userId: string, trx?: Knex.Transaction): Promise<UserPreferences | null> {
    const query = trx ? trx("user_preferences") : db("user_preferences");
    const row = await query.where({ user_id: userId }).first();
    return row ? mapRowToPreferences(row as unknown as Record<string, unknown>) : null;
  }

  async create(
    prefs: Omit<UserPreferences, "createdAt" | "updatedAt">,
    trx?: Knex.Transaction
  ): Promise<UserPreferences> {
    const query = trx ? trx("user_preferences") : db("user_preferences");
    const [row] = await query
      .insert({
        id: prefs.id,
        user_id: prefs.userId,
        notification_low_channels: JSON.stringify(prefs.notificationLowChannels),
        notification_medium_channels: JSON.stringify(prefs.notificationMediumChannels),
        notification_high_channels: JSON.stringify(prefs.notificationHighChannels),
        notification_critical_channels: JSON.stringify(prefs.notificationCriticalChannels),
        working_hours_start: prefs.workingHoursStart,
        working_hours_end: prefs.workingHoursEnd,
        working_days: JSON.stringify(prefs.workingDays),
        voice_enabled: prefs.voiceEnabled,
        autonomous_scheduling_enabled: prefs.autonomousSchedulingEnabled,
        content_privacy_mode: prefs.contentPrivacyMode,
        escalation_contact_email: prefs.escalationContactEmail,
        escalation_contact_name: prefs.escalationContactName,
        escalation_threshold: prefs.escalationThreshold,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert user preferences");
    }

    return mapRowToPreferences(row as unknown as Record<string, unknown>);
  }

  async update(
    userId: string,
    prefs: Partial<Omit<UserPreferences, "id" | "userId" | "createdAt" | "updatedAt">>,
    trx?: Knex.Transaction
  ): Promise<UserPreferences> {
    const query = trx ? trx("user_preferences") : db("user_preferences");
    const updateData: Record<string, unknown> = {};

    if (prefs.notificationLowChannels !== undefined) {
      updateData["notification_low_channels"] = JSON.stringify(prefs.notificationLowChannels);
    }
    if (prefs.notificationMediumChannels !== undefined) {
      updateData["notification_medium_channels"] = JSON.stringify(prefs.notificationMediumChannels);
    }
    if (prefs.notificationHighChannels !== undefined) {
      updateData["notification_high_channels"] = JSON.stringify(prefs.notificationHighChannels);
    }
    if (prefs.notificationCriticalChannels !== undefined) {
      updateData["notification_critical_channels"] = JSON.stringify(
        prefs.notificationCriticalChannels
      );
    }
    if (prefs.workingHoursStart !== undefined) {
      updateData["working_hours_start"] = prefs.workingHoursStart;
    }
    if (prefs.workingHoursEnd !== undefined) {
      updateData["working_hours_end"] = prefs.workingHoursEnd;
    }
    if (prefs.workingDays !== undefined) {
      updateData["working_days"] = JSON.stringify(prefs.workingDays);
    }
    if (prefs.voiceEnabled !== undefined) {
      updateData["voice_enabled"] = prefs.voiceEnabled;
    }
    if (prefs.autonomousSchedulingEnabled !== undefined) {
      updateData["autonomous_scheduling_enabled"] = prefs.autonomousSchedulingEnabled;
    }
    if (prefs.contentPrivacyMode !== undefined) {
      updateData["content_privacy_mode"] = prefs.contentPrivacyMode;
    }
    if (prefs.escalationContactEmail !== undefined) {
      updateData["escalation_contact_email"] = prefs.escalationContactEmail;
    }
    if (prefs.escalationContactName !== undefined) {
      updateData["escalation_contact_name"] = prefs.escalationContactName;
    }
    if (prefs.escalationThreshold !== undefined) {
      updateData["escalation_threshold"] = prefs.escalationThreshold;
    }

    updateData["updated_at"] = new Date();

    const [row] = await query.where({ user_id: userId }).update(updateData).returning("*");

    if (!row) {
      throw new Error(`Preferences for user ${userId} not found.`);
    }

    return mapRowToPreferences(row as unknown as Record<string, unknown>);
  }
}
