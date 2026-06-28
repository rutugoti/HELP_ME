// ─────────────────────────────────────────────────────────────
// LastMinute — Goals & Habits API Functions
// /api/v1/goals/*, /api/v1/habits/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type { ApiResponse, GoalWithProgress, Goal, HabitSummary, UUID } from "@lastminute/types";
import type { CreateGoalInput, LogHabitInput } from "@lastminute/schemas";

/** Returns all active goals with progress and projections. */
export async function getGoals(client: KyInstance): Promise<ApiResponse<GoalWithProgress[]>> {
  return client.get("api/v1/goals").json();
}

/** Creates a new goal. System auto-generates weekly milestones. */
export async function createGoal(
  client: KyInstance,
  input: CreateGoalInput
): Promise<ApiResponse<Goal>> {
  return client.post("api/v1/goals", { json: input }).json();
}

/** Returns habit tracking data with streaks and drift alerts. */
export async function getHabits(client: KyInstance): Promise<ApiResponse<HabitSummary[]>> {
  return client.get("api/v1/habits").json();
}

/** Logs a habit completion for today. */
export async function logHabit(
  client: KyInstance,
  habitId: UUID,
  input?: LogHabitInput
): Promise<void> {
  await client.post(`api/v1/habits/${habitId}/log`, {
    json: input ?? {},
  });
}
