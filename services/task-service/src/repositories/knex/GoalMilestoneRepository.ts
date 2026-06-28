// ─────────────────────────────────────────────────────────────
// LastMinute — GoalMilestone Knex Repository
// Handles database logic for weekly goal milestones per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import type { Knex } from "knex";
import type { GoalMilestone } from "@lastminute/types";
import type { IGoalMilestoneRepository } from "../interfaces.js";
import { randomUUID } from "crypto";

function mapRow(row: Record<string, unknown>): GoalMilestone {
  return {
    id: row["id"] as string,
    goalId: row["goal_id"] as string,
    userId: row["user_id"] as string,
    title: row["title"] as string,
    dueDate: row["due_date"] as string,
    isCompleted: Boolean(row["is_completed"]),
    completedAt: row["completed_at"] ? new Date(row["completed_at"] as string).toISOString() : null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
  };
}

export class GoalMilestoneRepository implements IGoalMilestoneRepository {
  async listForGoal(
    goalId: string,
    userId: string,
    trx?: Knex.Transaction
  ): Promise<GoalMilestone[]> {
    const query = trx ? trx("goal_milestones") : db("goal_milestones");
    const rows = await query.where({ goal_id: goalId, user_id: userId }).orderBy("due_date", "asc");
    return rows.map((r) => mapRow(r as unknown as Record<string, unknown>));
  }

  async listForUser(userId: string, trx?: Knex.Transaction): Promise<GoalMilestone[]> {
    const query = trx ? trx("goal_milestones") : db("goal_milestones");
    const rows = await query.where({ user_id: userId }).orderBy("due_date", "asc");
    return rows.map((r) => mapRow(r as unknown as Record<string, unknown>));
  }

  async createMilestones(
    milestones: Omit<
      GoalMilestone,
      "id" | "isCompleted" | "completedAt" | "createdAt" | "updatedAt"
    >[],
    trx?: Knex.Transaction
  ): Promise<void> {
    if (milestones.length === 0) return;

    const query = trx ? trx("goal_milestones") : db("goal_milestones");
    const now = new Date();
    const rows = milestones.map((m) => ({
      id: randomUUID(),
      goal_id: m.goalId,
      user_id: m.userId,
      title: m.title,
      due_date: m.dueDate,
      is_completed: false,
      completed_at: null,
      created_at: now,
      updated_at: now,
    }));

    await query.insert(rows);
  }

  async updateMilestone(
    id: string,
    userId: string,
    isCompleted: boolean,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("goal_milestones") : db("goal_milestones");
    const now = new Date();
    await query.where({ id, user_id: userId }).update({
      is_completed: isCompleted,
      completed_at: isCompleted ? now : null,
      updated_at: now,
    });
  }

  async deleteForGoal(goalId: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("goal_milestones") : db("goal_milestones");
    await query.where({ goal_id: goalId }).delete();
  }
}
