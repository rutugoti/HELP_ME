// ─────────────────────────────────────────────────────────────
// LastMinute — Task API Functions
// /api/v1/tasks/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type {
  ApiResponse,
  Task,
  TaskListItem,
  ActionDraft,
  DependencyGraph,
  UUID,
} from "@lastminute/types";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListQuery,
  ActionDraftFeedbackInput,
} from "@lastminute/schemas";
import { toSearchParams } from "./client.js";

/** Returns tasks sorted by AI priority score descending. */
export async function listTasks(
  client: KyInstance,
  query?: TaskListQuery
): Promise<ApiResponse<TaskListItem[]>> {
  return client
    .get("api/v1/tasks", { searchParams: toSearchParams(query as Record<string, string | number | boolean | undefined>) })
    .json();
}

/** Creates a new task. Returns the task with preliminary scores. */
export async function createTask(
  client: KyInstance,
  input: CreateTaskInput
): Promise<ApiResponse<Task>> {
  return client.post("api/v1/tasks", { json: input }).json();
}

/** Returns a single task with full detail. */
export async function getTask(
  client: KyInstance,
  taskId: UUID
): Promise<ApiResponse<Task>> {
  return client.get(`api/v1/tasks/${taskId}`).json();
}

/** Updates a task (partial). */
export async function updateTask(
  client: KyInstance,
  taskId: UUID,
  input: UpdateTaskInput
): Promise<ApiResponse<Task>> {
  return client.patch(`api/v1/tasks/${taskId}`, { json: input }).json();
}

/** Soft-deletes a task. */
export async function deleteTask(
  client: KyInstance,
  taskId: UUID
): Promise<void> {
  await client.delete(`api/v1/tasks/${taskId}`);
}

/** Marks a task as in-progress. */
export async function startTask(
  client: KyInstance,
  taskId: UUID
): Promise<ApiResponse<Task>> {
  return client.post(`api/v1/tasks/${taskId}/start`).json();
}

/** Marks a task as complete. */
export async function completeTask(
  client: KyInstance,
  taskId: UUID
): Promise<ApiResponse<Task>> {
  return client.post(`api/v1/tasks/${taskId}/complete`).json();
}

/** Returns the AI-generated action draft. 202 if not ready yet. */
export async function getActionDraft(
  client: KyInstance,
  taskId: UUID
): Promise<ApiResponse<ActionDraft>> {
  return client.get(`api/v1/tasks/${taskId}/action`).json();
}

/** Submits feedback on an action draft. */
export async function submitActionFeedback(
  client: KyInstance,
  taskId: UUID,
  input: ActionDraftFeedbackInput
): Promise<void> {
  await client.post(`api/v1/tasks/${taskId}/action/feedback`, {
    json: input,
  });
}

/** Returns the dependency graph for a task. */
export async function getTaskDependencies(
  client: KyInstance,
  taskId: UUID
): Promise<ApiResponse<DependencyGraph>> {
  return client.get(`api/v1/tasks/${taskId}/dependencies`).json();
}

/** Bulk-prioritizes tasks by ID. Returns ranked by AI score. */
export async function bulkPrioritize(
  client: KyInstance,
  taskIds: UUID[]
): Promise<ApiResponse<TaskListItem[]>> {
  return client
    .post("api/v1/tasks/bulk-prioritize", { json: { taskIds } })
    .json();
}
