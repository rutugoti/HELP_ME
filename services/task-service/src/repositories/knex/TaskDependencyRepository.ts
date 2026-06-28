// ─────────────────────────────────────────────────────────────
// LastMinute — TaskDependency Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { TaskStatus } from "@lastminute/types";
import type { TaskDependencyNode } from "@lastminute/types";
import type { ITaskDependencyRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToNode(row: Record<string, unknown>): TaskDependencyNode {
  return {
    taskId: row["task_id"] as string,
    title: row["title"] as string,
    status: row["status"] as TaskStatus,
    deadline: new Date(row["deadline"] as string).toISOString(),
  };
}

export class TaskDependencyRepository implements ITaskDependencyRepository {
  async addDependency(
    dependentTaskId: string,
    requiredTaskId: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("task_dependencies") : db("task_dependencies");
    await query.insert({
      id: randomUUID(),
      dependent_task_id: dependentTaskId,
      required_task_id: requiredTaskId,
    });
  }

  async removeDependency(
    dependentTaskId: string,
    requiredTaskId: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ? trx("task_dependencies") : db("task_dependencies");
    await query
      .where({
        dependent_task_id: dependentTaskId,
        required_task_id: requiredTaskId,
      })
      .delete();
  }

  async getUpstream(taskId: string, trx?: Knex.Transaction): Promise<TaskDependencyNode[]> {
    const query = trx ? trx.raw : db.raw;
    const result = await query(
      `SELECT t.id as task_id, t.title, t.status, t.deadline
       FROM task_dependencies td
       JOIN tasks t ON t.id = td.required_task_id
       WHERE td.dependent_task_id = ? AND t.deleted_at IS NULL`,
      [taskId]
    );

    const rows = (result.rows || []) as Record<string, unknown>[];
    return rows.map((r) => mapRowToNode(r));
  }

  async getDownstream(taskId: string, trx?: Knex.Transaction): Promise<TaskDependencyNode[]> {
    const query = trx ? trx.raw : db.raw;
    const result = await query(
      `SELECT t.id as task_id, t.title, t.status, t.deadline
       FROM task_dependencies td
       JOIN tasks t ON t.id = td.dependent_task_id
       WHERE td.required_task_id = ? AND t.deleted_at IS NULL`,
      [taskId]
    );

    const rows = (result.rows || []) as Record<string, unknown>[];
    return rows.map((r) => mapRowToNode(r));
  }

  async getTransitiveUpstreamIds(taskId: string, trx?: Knex.Transaction): Promise<Set<string>> {
    const query = trx ? trx.raw : db.raw;
    const result = await query(
      `WITH RECURSIVE upstream_tasks AS (
         SELECT required_task_id 
         FROM task_dependencies 
         WHERE dependent_task_id = ?
         
         UNION
         
         SELECT td.required_task_id 
         FROM task_dependencies td
         JOIN upstream_tasks ut ON td.dependent_task_id = ut.required_task_id
       )
       SELECT required_task_id FROM upstream_tasks`,
      [taskId]
    );

    const rows = result.rows || [];
    const ids = new Set<string>();
    for (const row of rows) {
      ids.add(row.required_task_id as string);
    }
    return ids;
  }

  async removeAllForTask(taskId: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("task_dependencies") : db("task_dependencies");
    // Remove where the task is either dependent or required
    await query.where("dependent_task_id", taskId).orWhere("required_task_id", taskId).delete();
  }
}
