// ─────────────────────────────────────────────────────────────
// LastMinute — CalendarEvent Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { CalendarEvent } from "@lastminute/types";
import type { ICalendarEventRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row["id"] as string,
    providerId: row["provider_id"] as string,
    userId: row["user_id"] as string,
    externalEventId: row["external_event_id"] as string,
    title: (row["title"] as string | undefined) ?? null,
    startsAt: new Date(row["starts_at"] as string).toISOString(),
    endsAt: new Date(row["ends_at"] as string).toISOString(),
    isAllDay: Boolean(row["is_all_day"]),
    isBusy: Boolean(row["is_busy"]),
    syncedAt: new Date(row["synced_at"] as string).toISOString(),
  };
}

export class CalendarEventRepository implements ICalendarEventRepository {
  async findEventsForUserInPeriod(
    userId: string,
    startsAt: Date,
    endsAt: Date,
    trx?: Knex.Transaction
  ): Promise<CalendarEvent[]> {
    const query = trx ? trx("calendar_events") : db("calendar_events");
    const rows = await query
      .where({ user_id: userId })
      .andWhere("ends_at", ">=", startsAt)
      .andWhere("starts_at", "<=", endsAt)
      .orderBy("starts_at", "asc");

    return rows.map((r) => mapRowToEvent(r as unknown as Record<string, unknown>));
  }

  async rebuildEventsForProvider(
    providerId: string,
    userId: string,
    events: Omit<CalendarEvent, "id" | "providerId" | "userId" | "syncedAt">[],
    trx?: Knex.Transaction
  ): Promise<void> {
    const execute = async (t: Knex.Transaction) => {
      // Clear cache for this provider
      await t("calendar_events").where({ provider_id: providerId }).delete();

      if (events.length === 0) return;

      const rows = events.map((e) => ({
        id: randomUUID(),
        provider_id: providerId,
        user_id: userId,
        external_event_id: e.externalEventId,
        title: e.title,
        starts_at: new Date(e.startsAt),
        ends_at: new Date(e.endsAt),
        is_all_day: e.isAllDay,
        is_busy: e.isBusy,
        synced_at: new Date(),
      }));

      // Batch insert in chunks of 100
      await t.batchInsert("calendar_events", rows, 100);
    };

    if (trx) {
      await execute(trx);
    } else {
      await db.transaction(execute);
    }
  }
}
