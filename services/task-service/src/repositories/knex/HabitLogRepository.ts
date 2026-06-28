// ─────────────────────────────────────────────────────────────
// LastMinute — HabitLog Knex Repository
// Handles database operations and history logs for habits per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { Knex } from "knex";
import type { HabitLog } from "@lastminute/types";
import type { IHabitLogRepository } from "../interfaces.js";
import { randomUUID } from "crypto";

function mapRow(row: Record<string, unknown>): HabitLog {
  let logDateStr = row["log_date"] as string;
  if (row["log_date"] instanceof Date) {
    logDateStr = row["log_date"].toISOString().split("T")[0]!;
  }
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    habitCategory: row["habit_category"] as string,
    logDate: logDateStr,
    isCompleted: Boolean(row["is_completed"]),
    effortRating: row["effort_rating"] !== null ? Number(row["effort_rating"]) : null,
    notes: (row["notes"] as string) || null,
    loggedAt: new Date(row["logged_at"] as string).toISOString(),
  };
}

export class HabitLogRepository implements IHabitLogRepository {
  async listForUser(userId: string, trx?: Knex.Transaction): Promise<HabitLog[]> {
    const query = trx ? trx("habit_logs") : db("habit_logs");
    const rows = await query.where({ user_id: userId }).orderBy("log_date", "desc");
    return rows.map((r) => mapRow(r as unknown as Record<string, unknown>));
  }

  async findByKey(
    userId: string,
    habitCategory: string,
    logDate: string,
    trx?: Knex.Transaction
  ): Promise<HabitLog | null> {
    const query = trx ? trx("habit_logs") : db("habit_logs");
    const row = await query
      .where({ user_id: userId, habit_category: habitCategory, log_date: logDate })
      .first();
    if (!row) return null;
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async upsert(log: Omit<HabitLog, "id" | "loggedAt">, trx?: Knex.Transaction): Promise<HabitLog> {
    const query = trx ? trx("habit_logs") : db("habit_logs");
    const id = randomUUID();
    const now = new Date();

    const [row] = await query
      .insert({
        id,
        user_id: log.userId,
        habit_category: log.habitCategory,
        log_date: log.logDate,
        is_completed: log.isCompleted,
        effort_rating: log.effortRating ?? null,
        notes: log.notes ?? null,
        logged_at: now,
      })
      .onConflict(["user_id", "habit_category", "log_date"])
      .merge({
        is_completed: log.isCompleted,
        effort_rating: log.effortRating ?? null,
        notes: log.notes ?? null,
        logged_at: now,
      })
      .returning("*");

    if (!row) throw new Error("Failed to upsert habit log.");
    return mapRow(row as unknown as Record<string, unknown>);
  }
}
