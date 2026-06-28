// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { NotificationStatus } from "@lastminute/types";
import type { Notification, NotificationChannel, NotificationUrgency } from "@lastminute/types";
import type { INotificationRepository } from "../interfaces.js";
import { randomUUID } from "crypto";

function mapRow(row: Record<string, unknown>): Notification {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    type: row["type"] as string,
    urgency: row["urgency"] as NotificationUrgency,
    title: row["title"] as string,
    body: row["body"] as string,
    relatedTaskId: (row["related_task_id"] as string | undefined) ?? null,
    relatedRecommendationId: (row["related_recommendation_id"] as string | undefined) ?? null,
    channelsSent: (typeof row["channels_sent"] === "string"
      ? JSON.parse(row["channels_sent"] as string)
      : row["channels_sent"]) as NotificationChannel[],
    status: row["status"] as NotificationStatus,
    readAt: row["read_at"] ? new Date(row["read_at"] as string).toISOString() : null,
    actedAt: row["acted_at"] ? new Date(row["acted_at"] as string).toISOString() : null,
    dismissedAt: row["dismissed_at"] ? new Date(row["dismissed_at"] as string).toISOString() : null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class NotificationRepository implements INotificationRepository {
  async listForUser(userId: string): Promise<Notification[]> {
    const rows = await db("notifications").where({ user_id: userId }).orderBy("created_at", "desc");
    return rows.map((r) => mapRow(r as unknown as Record<string, unknown>));
  }

  async findById(id: string, userId: string): Promise<Notification | null> {
    const row = await db("notifications").where({ id, user_id: userId }).first();
    if (!row) return null;
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async create(
    notification: Omit<Notification, "id" | "createdAt" | "updatedAt">
  ): Promise<Notification> {
    const id = randomUUID();
    const now = new Date();

    const [row] = await db("notifications")
      .insert({
        id,
        user_id: notification.userId,
        type: notification.type,
        urgency: notification.urgency,
        title: notification.title,
        body: notification.body,
        related_task_id: notification.relatedTaskId,
        related_recommendation_id: notification.relatedRecommendationId,
        channels_sent: JSON.stringify(notification.channelsSent),
        status: notification.status,
        read_at: notification.readAt ? new Date(notification.readAt) : null,
        acted_at: notification.actedAt ? new Date(notification.actedAt) : null,
        dismissed_at: notification.dismissedAt ? new Date(notification.dismissedAt) : null,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    if (!row) throw new Error("Failed to insert notification.");
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async markRead(id: string, userId: string): Promise<void> {
    await db("notifications").where({ id, user_id: userId }).update({
      status: NotificationStatus.Read,
      read_at: new Date(),
      updated_at: new Date(),
    });
  }

  async markActed(id: string, userId: string): Promise<void> {
    await db("notifications").where({ id, user_id: userId }).update({
      status: NotificationStatus.ActedOn,
      acted_at: new Date(),
      updated_at: new Date(),
    });
  }

  async dismiss(id: string, userId: string): Promise<void> {
    await db("notifications").where({ id, user_id: userId }).update({
      status: NotificationStatus.Dismissed,
      dismissed_at: new Date(),
      updated_at: new Date(),
    });
  }
}
