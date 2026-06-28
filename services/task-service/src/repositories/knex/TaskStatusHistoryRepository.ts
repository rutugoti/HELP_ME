// ─────────────────────────────────────────────────────────────
// LastMinute — TaskStatusHistory Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { TaskStatus, StatusTransitionInitiator } from "@lastminute/types";
import type { TaskStatusHistory } from "@lastminute/types";
import type { ITaskStatusHistoryRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToHistory(row: Record<string, unknown>): TaskStatusHistory {
  return {
    id: row["id"] as string,
    taskId: row["task_id"] as string,
    userId: row["user_id"] as string,
    fromStatus: (row["from_status"] as TaskStatus | undefined) || null,
    toStatus: row["to_status"] as TaskStatus,
    transitionedAt: new Date(row["transitioned_at"] as string).toISOString(),
    initiatedBy: row["initiated_by"] as StatusTransitionInitiator,
  };
}

export class TaskStatusHistoryRepository implements ITaskStatusHistoryRepository {
  async logTransition(
    history: Omit<TaskStatusHistory, "id" | "transitionedAt">,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("task_status_history") : db("task_status_history");
    await query.insert({
      id: randomUUID(),
      task_id: history.taskId,
      user_id: history.userId,
      from_status: history.fromStatus,
      to_status: history.toStatus,
      transitioned_at: new Date(),
      initiated_by: history.initiatedBy,
    });
  }

  async getByTaskId(taskId: string, trx?: Knex.Transaction): Promise<TaskStatusHistory[]> {
    const query = trx ? trx("task_status_history") : db("task_status_history");
    const rows = await query.where({ task_id: taskId }).orderBy("transitioned_at", "asc");

    return rows.map((r) => mapRowToHistory(r as unknown as Record<string, unknown>));
  }
}
