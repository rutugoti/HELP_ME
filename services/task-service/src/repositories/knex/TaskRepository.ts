// ─────────────────────────────────────────────────────────────
// LastMinute — Task Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { ConsequenceSeverity, TaskStatus, PriorityTier } from "@lastminute/types";
import type { Task, TaskListItem, TaskListFilters } from "@lastminute/types";
import type { ITaskRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { ValidationError } from "../../utils/errors.js";

// Helper mapper for basic Task
export function mapRowToTask(row: Record<string, unknown>): Task {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    title: row["title"] as string,
    description: (row["description"] as string | undefined) ?? null,
    category: row["category"] as string,
    status: row["status"] as TaskStatus,
    deadline: new Date(row["deadline"] as string).toISOString(),
    effectiveDeadline: row["effective_deadline"]
      ? new Date(row["effective_deadline"] as string).toISOString()
      : null,
    estimatedMinutes: row["estimated_minutes"] ? Number(row["estimated_minutes"]) : null,
    actualMinutes: row["actual_minutes"] ? Number(row["actual_minutes"]) : null,
    consequenceSeverity: row["consequence_severity"] as ConsequenceSeverity,
    initiatedAt: row["initiated_at"] ? new Date(row["initiated_at"] as string).toISOString() : null,
    completedAt: row["completed_at"] ? new Date(row["completed_at"] as string).toISOString() : null,
    createdAt: new Date(row["created_at"] as string).toISOString(),
    updatedAt: new Date(row["updated_at"] as string).toISOString(),
    deletedAt: row["deleted_at"] ? new Date(row["deleted_at"] as string).toISOString() : null,
  };
}

// Helper mapper for enriched TaskListItem
export function mapRowToTaskListItem(row: Record<string, unknown>): TaskListItem {
  const task = mapRowToTask(row);
  return {
    ...task,
    priorityScore: Number(row["total_score"] ?? 0),
    scoreComponents: {
      deadlineProximity: Number(row["deadline_proximity_score"] ?? 0),
      dependencyImpact: Number(row["dependency_impact_score"] ?? 0),
      consequenceSeverity: Number(row["consequence_severity_score"] ?? 0),
    },
    priorityTier: (row["priority_tier"] as PriorityTier | undefined) ?? PriorityTier.Low,
    hasActionDraft: Boolean(row["has_action_draft"]),
  };
}

// Cursor encoders/decoders
export function encodeCursor(score: number, id: string): string {
  return Buffer.from(JSON.stringify([score, id])).toString("base64");
}

export function decodeCursor(cursor: string): [number, string] {
  try {
    const [score, id] = JSON.parse(Buffer.from(cursor, "base64").toString("utf-8"));
    return [Number(score), String(id)];
  } catch {
    throw new ValidationError("Invalid pagination cursor.");
  }
}

export class TaskRepository implements ITaskRepository {
  async findById(id: string, trx?: Knex.Transaction): Promise<Task | null> {
    const query = trx ? trx("tasks") : db("tasks");
    const row = await query.where({ id }).whereNull("deleted_at").first();
    return row ? mapRowToTask(row as unknown as Record<string, unknown>) : null;
  }

  async findByIdEnriched(id: string, trx?: Knex.Transaction): Promise<TaskListItem | null> {
    const query = trx ? trx("tasks") : db("tasks");
    const row = await query
      .leftJoin("task_priority_scores", "task_priority_scores.task_id", "tasks.id")
      .select([
        "tasks.*",
        db.raw("COALESCE(task_priority_scores.total_score, 0.0) as total_score"),
        db.raw(
          "COALESCE(task_priority_scores.deadline_proximity_score, 0.0) as deadline_proximity_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.dependency_impact_score, 0.0) as dependency_impact_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.consequence_severity_score, 0.0) as consequence_severity_score"
        ),
        db.raw("COALESCE(task_priority_scores.priority_tier, 'low') as priority_tier"),
        db.raw(
          "EXISTS(SELECT 1 FROM action_drafts ad WHERE ad.task_id = tasks.id AND ad.is_active = true) as has_action_draft"
        ),
      ])
      .where("tasks.id", id)
      .whereNull("tasks.deleted_at")
      .first();

    return row ? mapRowToTaskListItem(row as unknown as Record<string, unknown>) : null;
  }

  async findByIdsEnriched(
    ids: string[],
    userId: string,
    trx?: Knex.Transaction
  ): Promise<TaskListItem[]> {
    const query = trx ? trx("tasks") : db("tasks");
    const rows = await query
      .leftJoin("task_priority_scores", "task_priority_scores.task_id", "tasks.id")
      .select([
        "tasks.*",
        db.raw("COALESCE(task_priority_scores.total_score, 0.0) as total_score"),
        db.raw(
          "COALESCE(task_priority_scores.deadline_proximity_score, 0.0) as deadline_proximity_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.dependency_impact_score, 0.0) as dependency_impact_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.consequence_severity_score, 0.0) as consequence_severity_score"
        ),
        db.raw("COALESCE(task_priority_scores.priority_tier, 'low') as priority_tier"),
        db.raw(
          "EXISTS(SELECT 1 FROM action_drafts ad WHERE ad.task_id = tasks.id AND ad.is_active = true) as has_action_draft"
        ),
      ])
      .whereIn("tasks.id", ids)
      .where("tasks.user_id", userId)
      .whereNull("tasks.deleted_at");

    return rows.map((r) => mapRowToTaskListItem(r as unknown as Record<string, unknown>));
  }

  async create(
    task: Omit<
      Task,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "effectiveDeadline"
      | "actualMinutes"
      | "initiatedAt"
      | "completedAt"
    >,
    trx?: Knex.Transaction
  ): Promise<Task> {
    const query = trx ? trx("tasks") : db("tasks");
    const [row] = await query
      .insert({
        id: task.id,
        user_id: task.userId,
        title: task.title,
        description: task.description,
        category: task.category,
        status: task.status,
        deadline: new Date(task.deadline),
        consequence_severity: task.consequenceSeverity,
        estimated_minutes: task.estimatedMinutes,
      })
      .returning("*");

    if (!row) {
      throw new Error("Failed to insert task");
    }
    return mapRowToTask(row as unknown as Record<string, unknown>);
  }

  async update(
    id: string,
    task: Partial<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt" | "deletedAt">>,
    trx?: Knex.Transaction
  ): Promise<Task> {
    const query = trx ? trx("tasks") : db("tasks");
    const updateData: Record<string, unknown> = {};

    if (task.title !== undefined) updateData["title"] = task.title;
    if (task.description !== undefined) updateData["description"] = task.description;
    if (task.category !== undefined) updateData["category"] = task.category;
    if (task.status !== undefined) updateData["status"] = task.status;
    if (task.deadline !== undefined) updateData["deadline"] = new Date(task.deadline);
    if (task.effectiveDeadline !== undefined) {
      updateData["effective_deadline"] = task.effectiveDeadline
        ? new Date(task.effectiveDeadline)
        : null;
    }
    if (task.estimatedMinutes !== undefined)
      updateData["estimated_minutes"] = task.estimatedMinutes;
    if (task.actualMinutes !== undefined) updateData["actual_minutes"] = task.actualMinutes;
    if (task.consequenceSeverity !== undefined)
      updateData["consequence_severity"] = task.consequenceSeverity;
    if (task.initiatedAt !== undefined) {
      updateData["initiated_at"] = task.initiatedAt ? new Date(task.initiatedAt) : null;
    }
    if (task.completedAt !== undefined) {
      updateData["completed_at"] = task.completedAt ? new Date(task.completedAt) : null;
    }

    updateData["updated_at"] = new Date();

    const [row] = await query
      .where({ id })
      .whereNull("deleted_at")
      .update(updateData)
      .returning("*");

    if (!row) {
      throw new Error(`Task with ID ${id} not found or deleted.`);
    }

    return mapRowToTask(row as unknown as Record<string, unknown>);
  }

  async softDelete(id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ? trx("tasks") : db("tasks");
    await query.where({ id }).update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });
  }

  async list(
    userId: string,
    filters: TaskListFilters & { limit: number; cursor?: string },
    trx?: Knex.Transaction
  ): Promise<{ items: TaskListItem[]; nextCursor: string | null }> {
    const query = trx ? trx("tasks") : db("tasks");
    const limit = filters.limit;

    const baseQuery = query
      .leftJoin("task_priority_scores", "task_priority_scores.task_id", "tasks.id")
      .select([
        "tasks.*",
        db.raw("COALESCE(task_priority_scores.total_score, 0.0) as total_score"),
        db.raw(
          "COALESCE(task_priority_scores.deadline_proximity_score, 0.0) as deadline_proximity_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.dependency_impact_score, 0.0) as dependency_impact_score"
        ),
        db.raw(
          "COALESCE(task_priority_scores.consequence_severity_score, 0.0) as consequence_severity_score"
        ),
        db.raw("COALESCE(task_priority_scores.priority_tier, 'low') as priority_tier"),
        db.raw(
          "EXISTS(SELECT 1 FROM action_drafts ad WHERE ad.task_id = tasks.id AND ad.is_active = true) as has_action_draft"
        ),
      ])
      .where("tasks.user_id", userId)
      .whereNull("tasks.deleted_at");

    // Apply filters
    if (filters.status) {
      baseQuery.where("tasks.status", filters.status);
    }
    if (filters.category) {
      baseQuery.where("tasks.category", filters.category);
    }
    if (filters.deadlineBefore) {
      baseQuery.where("tasks.deadline", "<=", new Date(filters.deadlineBefore));
    }
    if (filters.deadlineAfter) {
      baseQuery.where("tasks.deadline", ">=", new Date(filters.deadlineAfter));
    }
    if (filters.priorityTier) {
      baseQuery.where("task_priority_scores.priority_tier", filters.priorityTier);
    }

    // Apply cursor pagination
    if (filters.cursor) {
      const [cursorScore, cursorId] = decodeCursor(filters.cursor);
      baseQuery.where(function () {
        this.whereRaw("COALESCE(task_priority_scores.total_score, 0.0) < ?", [cursorScore]).orWhere(
          function () {
            this.whereRaw("COALESCE(task_priority_scores.total_score, 0.0) = ?", [
              cursorScore,
            ]).andWhere("tasks.id", ">", cursorId);
          }
        );
      });
    }

    // Sort: total_score DESC, tasks.id ASC
    baseQuery
      .orderByRaw("COALESCE(task_priority_scores.total_score, 0.0) DESC")
      .orderBy("tasks.id", "asc")
      .limit(limit + 1);

    const rows = await baseQuery;
    const items = rows
      .slice(0, limit)
      .map((r) => mapRowToTaskListItem(r as unknown as Record<string, unknown>));

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const lastItem = items[items.length - 1];
      if (lastItem) {
        nextCursor = encodeCursor(lastItem.priorityScore, lastItem.id);
      }
    }

    return { items, nextCursor };
  }
}
