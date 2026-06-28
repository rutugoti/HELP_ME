// ─────────────────────────────────────────────────────────────
// LastMinute — Task Repositories Interfaces
// Enforces decoupling of data access from business services per Rule 2.
// ─────────────────────────────────────────────────────────────

import type {
  Task,
  TaskListItem,
  TaskListFilters,
  TaskDependencyNode,
  TaskStatusHistory,
  ActionDraft,
  ActionDraftFeedback,
  TaskPriorityScore,
} from "@lastminute/types";
import type { Knex } from "knex";

export interface ITaskRepository {
  findById(id: string, trx?: Knex.Transaction): Promise<Task | null>;
  findByIdEnriched(id: string, trx?: Knex.Transaction): Promise<TaskListItem | null>;
  findByIdsEnriched(ids: string[], userId: string, trx?: Knex.Transaction): Promise<TaskListItem[]>;
  create(
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
  ): Promise<Task>;
  update(
    id: string,
    task: Partial<Omit<Task, "id" | "userId" | "createdAt" | "updatedAt" | "deletedAt">>,
    trx?: Knex.Transaction
  ): Promise<Task>;
  softDelete(id: string, trx?: Knex.Transaction): Promise<void>;
  list(
    userId: string,
    filters: TaskListFilters & { limit: number; cursor?: string },
    trx?: Knex.Transaction
  ): Promise<{ items: TaskListItem[]; nextCursor: string | null }>;
}

export interface ITaskDependencyRepository {
  addDependency(
    dependentTaskId: string,
    requiredTaskId: string,
    trx?: Knex.Transaction
  ): Promise<void>;
  removeDependency(
    dependentTaskId: string,
    requiredTaskId: string,
    trx?: Knex.Transaction
  ): Promise<void>;
  getUpstream(taskId: string, trx?: Knex.Transaction): Promise<TaskDependencyNode[]>;
  getDownstream(taskId: string, trx?: Knex.Transaction): Promise<TaskDependencyNode[]>;
  getTransitiveUpstreamIds(taskId: string, trx?: Knex.Transaction): Promise<Set<string>>;
  removeAllForTask(taskId: string, trx?: Knex.Transaction): Promise<void>;
}

export interface ITaskStatusHistoryRepository {
  logTransition(
    history: Omit<TaskStatusHistory, "id" | "transitionedAt">,
    trx?: Knex.Transaction
  ): Promise<void>;
  getByTaskId(taskId: string, trx?: Knex.Transaction): Promise<TaskStatusHistory[]>;
}

export interface IActionDraftRepository {
  findActiveByTaskId(taskId: string, trx?: Knex.Transaction): Promise<ActionDraft | null>;
  createFeedback(
    feedback: Omit<ActionDraftFeedback, "id" | "submittedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraftFeedback>;
  createDraft(
    draft: Omit<ActionDraft, "id" | "createdAt" | "updatedAt" | "isActive" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraft>;
}

export interface ITaskPriorityScoreRepository {
  updateScoreAndLogHistory(
    score: Omit<TaskPriorityScore, "id" | "createdAt" | "updatedAt">,
    triggerEvent: string,
    trx?: Knex.Transaction
  ): Promise<void>;
  getByTaskId(taskId: string, trx?: Knex.Transaction): Promise<TaskPriorityScore | null>;
}
