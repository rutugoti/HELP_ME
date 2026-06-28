// ─────────────────────────────────────────────────────────────
// LastMinute — Goal Knex Repository
// Handles database logic for user goals, mapping formats per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { Knex } from "knex";
import type { Goal } from "@lastminute/types";
import { GoalStatus } from "@lastminute/types";
import type { IGoalRepository } from "../interfaces.js";
import { randomUUID } from "crypto";

function mapRow(row: Record<string, unknown>): Goal {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    title: row["title"] as string,
    description: (row["description"] as string) || null,
    targetDate: row["target_date"] as string,
    status: row["status"] as GoalStatus,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
    deletedAt: row["deleted_at"] ? new Date(row["deleted_at"] as string).toISOString() : null,
  };
}

export class GoalRepository implements IGoalRepository {
  async listForUser(userId: string, trx?: Knex.Transaction): Promise<Goal[]> {
    const query = trx ? trx("goals") : db("goals");
    const rows = await query
      .where({ user_id: userId })
      .whereNull("deleted_at")
      .orderBy("created_at", "desc");
    return rows.map((r) => mapRow(r as unknown as Record<string, unknown>));
  }

  async findById(id: string, userId: string, trx?: Knex.Transaction): Promise<Goal | null> {
    const query = trx ? trx("goals") : db("goals");
    const row = await query.where({ id, user_id: userId }).whereNull("deleted_at").first();
    if (!row) return null;
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async create(
    goal: Omit<Goal, "id" | "status" | "createdAt" | "updatedAt" | "deletedAt">,
    trx?: Knex.Transaction
  ): Promise<Goal> {
    const query = trx ? trx("goals") : db("goals");
    const id = randomUUID();
    const now = new Date();

    const [row] = await query
      .insert({
        id,
        user_id: goal.userId,
        title: goal.title,
        description: goal.description || null,
        target_date: goal.targetDate,
        status: GoalStatus.Active,
        created_at: now,
        updated_at: now,
      })
      .returning("*");

    if (!row) throw new Error("Failed to create goal.");
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async update(
    id: string,
    userId: string,
    goal: Partial<Omit<Goal, "id" | "userId" | "createdAt" | "updatedAt" | "deletedAt">>,
    trx?: Knex.Transaction
  ): Promise<Goal> {
    const query = trx ? trx("goals") : db("goals");
    const now = new Date();
    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    if (goal.title !== undefined) updateData["title"] = goal.title;
    if (goal.description !== undefined) updateData["description"] = goal.description;
    if (goal.targetDate !== undefined) updateData["target_date"] = goal.targetDate;
    if (goal.status !== undefined) updateData["status"] = goal.status;

    const [row] = await query
      .where({ id, user_id: userId })
      .whereNull("deleted_at")
      .update(updateData)
      .returning("*");

    if (!row) throw new Error("Goal not found or failed to update.");
    return mapRow(row as unknown as Record<string, unknown>);
  }

  async softDelete(id: string, userId: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("goals") : db("goals");
    await query.where({ id, user_id: userId }).update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }
}
