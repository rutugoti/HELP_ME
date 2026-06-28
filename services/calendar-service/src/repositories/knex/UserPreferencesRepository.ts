// ─────────────────────────────────────────────────────────────
// LastMinute — UserPreferences Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { UserPreferences } from "../interfaces.js";
import type { IUserPreferencesRepository } from "../interfaces.js";
import type { Knex } from "knex";

export function mapRowToUserPreferences(row: Record<string, unknown>): UserPreferences {
  let workingDays: number[] = [1, 2, 3, 4, 5]; // Default Mon-Fri
  if (row["working_days"]) {
    if (typeof row["working_days"] === "string") {
      try {
        workingDays = JSON.parse(row["working_days"]) as number[];
      } catch {
        // Fallback to default
      }
    } else if (Array.isArray(row["working_days"])) {
      workingDays = row["working_days"] as number[];
    }
  }

  return {
    userId: row["user_id"] as string,
    workingHoursStart: (row["working_hours_start"] as string) || "09:00",
    workingHoursEnd: (row["working_hours_end"] as string) || "18:00",
    workingDays,
    autonomousSchedulingEnabled: Boolean(row["autonomous_scheduling_enabled"]),
  };
}

export class UserPreferencesRepository implements IUserPreferencesRepository {
  async findByUserId(userId: string, trx?: Knex.Transaction): Promise<UserPreferences | null> {
    const query = trx ? trx("user_preferences") : db("user_preferences");
    const row = await query.where({ user_id: userId }).first();
    return row ? mapRowToUserPreferences(row as unknown as Record<string, unknown>) : null;
  }
}
