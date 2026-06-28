// ─────────────────────────────────────────────────────────────
// LastMinute — Goal & Habit Schemas
// Validation for: create goal, log habit, responses
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { GoalStatus } from "@lastminute/types";
import { isoDateSchema } from "./common.js";

/** POST /api/v1/goals */
export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(2000).optional(),
  targetDate: isoDateSchema,
  habitCategories: z.array(z.string().max(100)).max(10).optional(),
});

/** POST /api/v1/habits/:habitId/log */
export const logHabitSchema = z.object({
  notes: z.string().max(1000).optional(),
  effortRating: z.number().int().min(1).max(5).optional(),
});

/** Goal response. */
export const goalResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  targetDate: z.string(),
  status: z.nativeEnum(GoalStatus),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Goal with progress response. */
export const goalWithProgressSchema = goalResponseSchema.extend({
  completedMilestones: z.number(),
  totalMilestones: z.number(),
  projectedCompletionDate: z.string().nullable(),
});

/** Milestone response. */
export const milestoneResponseSchema = z.object({
  id: z.string().uuid(),
  goalId: z.string().uuid(),
  title: z.string(),
  dueDate: z.string(),
  isCompleted: z.boolean(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});

/** Habit summary response. */
export const habitSummarySchema = z.object({
  habitCategory: z.string(),
  currentStreak: z.number(),
  longestStreak: z.number(),
  completionRateByDay: z.record(z.string(), z.number()),
  hasBehavioralDrift: z.boolean(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type LogHabitInput = z.infer<typeof logHabitSchema>;
