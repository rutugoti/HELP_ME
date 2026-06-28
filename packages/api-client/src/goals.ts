// ─────────────────────────────────────────────────────────────
// LastMinute — Goals & Habits API Functions
// /api/v1/goals/*, /api/v1/habits/* endpoints
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type {
  ApiResponse,
  GoalWithProgress,
  Goal,
  GoalMilestone,
  HabitSummary,
  UUID,
} from "@lastminute/types";
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
  habitCategory: string,
  input?: LogHabitInput
): Promise<void> {
  await client.post(`api/v1/habits/${habitCategory}/log`, {
    json: input ?? {},
  });
}

/** Updates an existing goal. */
export async function updateGoal(
  client: KyInstance,
  goalId: UUID,
  input: Partial<CreateGoalInput>
): Promise<ApiResponse<Goal>> {
  return client.put(`api/v1/goals/${goalId}`, { json: input }).json();
}

/** Toggles milestone completion status. */
export async function toggleMilestone(
  client: KyInstance,
  milestoneId: UUID,
  isCompleted: boolean
): Promise<void> {
  await client.post(`api/v1/goals/milestones/${milestoneId}/toggle`, {
    json: { isCompleted },
  });
}

/** Deletes a goal. */
export async function deleteGoal(client: KyInstance, goalId: UUID): Promise<void> {
  await client.delete(`api/v1/goals/${goalId}`);
}

/** Fetches milestones for a specific goal. */
export async function getMilestones(
  client: KyInstance,
  goalId: UUID
): Promise<ApiResponse<GoalMilestone[]>> {
  return client.get(`api/v1/goals/${goalId}/milestones`).json();
}
