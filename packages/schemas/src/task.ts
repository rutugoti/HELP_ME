// ─────────────────────────────────────────────────────────────
// LastMinute — Task Schemas
// Validation for: create, update, list filters, action draft
// feedback, bulk prioritize
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import {
  ConsequenceSeverity,
  FeedbackType,
  PriorityTier,
  TaskStatus,
} from "@lastminute/types";
import { isoDateTimeSchema, paginationQuerySchema, uuidSchema } from "./common.js";

/** POST /api/v1/tasks — create a new task. */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  deadline: isoDateTimeSchema,
  estimatedMinutes: z
    .number()
    .int()
    .positive()
    .max(10080, "Maximum 1 week (10080 minutes)")
    .optional(),
  category: z.string().min(1, "Category is required").max(100),
  dependsOn: z.array(uuidSchema).max(50).optional(),
  consequenceSeverityOverride: z.nativeEnum(ConsequenceSeverity).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

/** PATCH /api/v1/tasks/:taskId — update an existing task. */
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).nullable().optional(),
  deadline: isoDateTimeSchema.optional(),
  estimatedMinutes: z.number().int().positive().max(10080).nullable().optional(),
  category: z.string().min(1).max(100).optional(),
  consequenceSeverity: z.nativeEnum(ConsequenceSeverity).optional(),
});

/** GET /api/v1/tasks — query parameters for task list. */
export const taskListQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
  category: z.string().optional(),
  deadlineBefore: isoDateTimeSchema.optional(),
  deadlineAfter: isoDateTimeSchema.optional(),
  priorityTier: z.nativeEnum(PriorityTier).optional(),
});

/** POST /api/v1/tasks/:taskId/action/feedback */
export const actionDraftFeedbackSchema = z.object({
  feedbackType: z.nativeEnum(FeedbackType, {
    message: "Must be a valid feedback type",
  }),
  notes: z.string().max(2000).optional(),
});

/** POST /api/v1/tasks/bulk-prioritize */
export const bulkPrioritizeSchema = z.object({
  taskIds: z
    .array(uuidSchema)
    .min(1, "At least one task ID required")
    .max(100, "Maximum 100 tasks per request"),
});

/** Task response schema (from API). */
export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string(),
  status: z.nativeEnum(TaskStatus),
  deadline: z.string(),
  effectiveDeadline: z.string().nullable(),
  estimatedMinutes: z.number().nullable(),
  actualMinutes: z.number().nullable(),
  consequenceSeverity: z.nativeEnum(ConsequenceSeverity),
  initiatedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Priority score components in task list responses. */
export const scoreComponentsSchema = z.object({
  deadlineProximity: z.number(),
  dependencyImpact: z.number(),
  consequenceSeverity: z.number(),
});

/** Enriched task list item response. */
export const taskListItemSchema = taskResponseSchema.extend({
  priorityScore: z.number(),
  scoreComponents: scoreComponentsSchema,
  priorityTier: z.nativeEnum(PriorityTier),
  hasActionDraft: z.boolean(),
});

/** Action draft response. */
export const actionDraftResponseSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid(),
  draftType: z.string(),
  content: z.string(),
  isActive: z.boolean(),
  modelVersion: z.string(),
  promptVersion: z.string(),
  generatedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Dependency node in the graph response. */
export const dependencyNodeSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string(),
  status: z.nativeEnum(TaskStatus),
  deadline: z.string(),
});

/** Dependency graph response. */
export const dependencyGraphSchema = z.object({
  upstream: z.array(dependencyNodeSchema),
  downstream: z.array(dependencyNodeSchema),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
export type ActionDraftFeedbackInput = z.infer<typeof actionDraftFeedbackSchema>;
export type BulkPrioritizeInput = z.infer<typeof bulkPrioritizeSchema>;
