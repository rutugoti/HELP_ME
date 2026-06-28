// ─────────────────────────────────────────────────────────────
// LastMinute — User Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { User, UserStats, UserRole } from "@lastminute/types";
import type { IUserRepository } from "../interfaces.js";
import type { Knex } from "knex";

// Helper mapper functions
export function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row["id"] as string,
    email: row["email"] as string,
    passwordHash: row["password_hash"] as string,
    fullName: row["full_name"] as string,
    role: row["role"] as UserRole,
    timezone: row["timezone"] as string,
    isVerified: Boolean(row["is_verified"]),
    isActive: Boolean(row["is_active"]),
    lastLoginAt: row["last_login_at"]
      ? new Date(row["last_login_at"] as string).toISOString()
      : null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
    deletedAt: row["deleted_at"] ? new Date(row["deleted_at"] as string).toISOString() : null,
  };
}

export class UserRepository implements IUserRepository {
  async findById(id: string, trx?: Knex.Transaction): Promise<User | null> {
    const query = trx ? trx("users") : db("users");
    const row = await query.where({ id }).whereNull("deleted_at").first();
    return row ? mapRowToUser(row as unknown as Record<string, unknown>) : null;
  }

  async findByEmail(email: string, trx?: Knex.Transaction): Promise<User | null> {
    const query = trx ? trx("users") : db("users");
    const row = await query
      .whereRaw("LOWER(email) = ?", [email.toLowerCase()])
      .whereNull("deleted_at")
      .first();
    return row ? mapRowToUser(row as unknown as Record<string, unknown>) : null;
  }

  async create(
    user: Omit<User, "createdAt" | "updatedAt" | "deletedAt">,
    trx?: Knex.Transaction
  ): Promise<User> {
    const query = trx ? trx("users") : db("users");
    const [row] = await query
      .insert({
        id: user.id,
        email: user.email.toLowerCase(),
        password_hash: user.passwordHash,
        full_name: user.fullName,
        role: user.role,
        timezone: user.timezone,
        is_verified: user.isVerified,
        is_active: user.isActive,
        last_login_at: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert user");
    }
    return mapRowToUser(row as unknown as Record<string, unknown>);
  }

  async update(
    id: string,
    user: Partial<Omit<User, "id" | "createdAt" | "updatedAt" | "deletedAt">>,
    trx?: Knex.Transaction
  ): Promise<User> {
    const query = trx ? trx("users") : db("users");
    const updateData: Record<string, unknown> = {};

    if (user.email !== undefined) updateData["email"] = user.email.toLowerCase();
    if (user.passwordHash !== undefined) updateData["password_hash"] = user.passwordHash;
    if (user.fullName !== undefined) updateData["full_name"] = user.fullName;
    if (user.role !== undefined) updateData["role"] = user.role;
    if (user.timezone !== undefined) updateData["timezone"] = user.timezone;
    if (user.isVerified !== undefined) updateData["is_verified"] = user.isVerified;
    if (user.isActive !== undefined) updateData["is_active"] = user.isActive;
    if (user.lastLoginAt !== undefined) {
      updateData["last_login_at"] = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
    }

    updateData["updated_at"] = new Date();

    const [row] = await query
      .where({ id })
      .whereNull("deleted_at")
      .update(updateData)
      .returning("*");

    if (!row) {
      throw new Error(`User with ID ${id} not found or deleted.`);
    }

    return mapRowToUser(row as unknown as Record<string, unknown>);
  }

  async softDelete(id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("users") : db("users");
    await query.where({ id }).update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  async updateLastLogin(id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("users") : db("users");
    await query.where({ id }).update({
      last_login_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getUserStats(userId: string): Promise<UserStats> {
    // 1. Productivity Score: Rolling 7-day metric (completed tasks on-time / total completed/due in 7d)
    const rollingStart = new Date();
    rollingStart.setDate(rollingStart.getDate() - 7);

    const scoreRow = await db("tasks")
      .where({ user_id: userId })
      .where("deadline", ">=", rollingStart)
      .select(
        db.raw(
          "count(*) filter (where status = 'completed' and completed_at <= deadline) as on_time"
        ),
        db.raw("count(*) as total")
      )
      .first();

    const onTimeCount = scoreRow ? Number(scoreRow.on_time || 0) : 0;
    const totalCount = scoreRow ? Number(scoreRow.total || 0) : 0;
    const productivityScore = totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 100;

    // 2. Task Completion Rate by Category
    const categoryCompletionRows = await db("tasks")
      .where({ user_id: userId })
      .select("category")
      .select(
        db.raw("count(*) filter (where status = 'completed') as completed"),
        db.raw("count(*) as total")
      )
      .groupBy("category");

    const completionRateByCategory: Record<string, number> = {};
    for (const r of categoryCompletionRows) {
      const completed = Number(r.completed || 0);
      const total = Number(r.total || 0);
      completionRateByCategory[r.category as string] =
        total > 0 ? Number((completed / total).toFixed(2)) : 0;
    }

    // 3. Average Initiation Delay by Category (hours)
    const delayRows = await db("tasks")
      .where({ user_id: userId })
      .whereNotNull("initiated_at")
      .select("category")
      .select(db.raw("avg(extract(epoch from (initiated_at - created_at)) / 3600) as avg_delay"))
      .groupBy("category");

    const averageInitiationDelayByCategory: Record<string, number> = {};
    for (const r of delayRows) {
      averageInitiationDelayByCategory[r.category as string] = r.avg_delay
        ? Number(Number(r.avg_delay).toFixed(2))
        : 0;
    }

    // 4. Streak data per habit category (derived from habit_logs)
    const habitLogs = await db("habit_logs")
      .where({ user_id: userId, is_completed: true })
      .select("habit_category", "log_date")
      .orderBy("log_date", "desc");

    const streaksByCategory: Record<string, number> = {};
    // Group habit logs by category
    const logsByCategory: Record<string, string[]> = {};
    for (const log of habitLogs) {
      const cat = log.habit_category as string;
      if (!logsByCategory[cat]) logsByCategory[cat] = [];
      logsByCategory[cat].push(new Date(log.log_date as string).toISOString().split("T")[0]!);
    }

    for (const [cat, dates] of Object.entries(logsByCategory)) {
      // Find consecutive days streak starting from today or yesterday
      let streak = 0;
      const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));

      const todayStr = new Date().toISOString().split("T")[0]!;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0]!;

      const nextExpected = uniqueDates[0];
      if (nextExpected === todayStr || nextExpected === yesterdayStr) {
        streak = 1;
        let prevDate = new Date(nextExpected);
        for (let i = 1; i < uniqueDates.length; i++) {
          const currDate = new Date(uniqueDates[i]!);
          const diffDays = Math.round(
            (prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24)
          );
          if (diffDays === 1) {
            streak++;
            prevDate = currDate;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
      streaksByCategory[cat] = streak;
    }

    // 5. Override rate on AI priority assignments
    const overrideEventsCount = await db("behavioral_events")
      .where({ user_id: userId, event_type: "priority-overridden" })
      .count({ count: "*" })
      .first();

    const totalPriorityRuns = await db("behavioral_events")
      .where({ user_id: userId })
      .whereIn("event_type", ["task-created", "priority-recalculated"])
      .count({ count: "*" })
      .first();

    const overrides = overrideEventsCount ? Number(overrideEventsCount.count || 0) : 0;
    const runs = totalPriorityRuns ? Number(totalPriorityRuns.count || 0) : 0;
    const overrideRate = runs > 0 ? Number((overrides / runs).toFixed(2)) : 0.0;

    return {
      completionRateByCategory,
      averageInitiationDelayByCategory,
      overrideRate,
      streaksByCategory,
      productivityScore,
    };
  }
}
