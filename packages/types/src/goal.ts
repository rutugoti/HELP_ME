import type { BaseEntity, ISODateString, ISODateTimeString, SoftDeletableEntity, UUID } from "./common.js";
import type { GoalStatus } from "./enums.js";

/** User-defined long-horizon goal. */
export interface Goal extends SoftDeletableEntity {
  readonly userId: UUID;
  readonly title: string;
  readonly description: string | null;
  readonly targetDate: ISODateString;
  readonly status: GoalStatus;
}

/** Input for creating a goal. */
export interface CreateGoalInput {
  readonly title: string;
  readonly description?: string;
  readonly targetDate: ISODateString;
  readonly habitCategories?: string[];
}

/** Weekly milestone auto-generated for a goal. */
export interface GoalMilestone extends BaseEntity {
  readonly goalId: UUID;
  readonly userId: UUID;
  readonly title: string;
  readonly dueDate: ISODateString;
  readonly isCompleted: boolean;
  readonly completedAt: ISODateTimeString | null;
}

/** Daily habit log entry. One per user per habit per day. */
export interface HabitLog {
  readonly id: UUID;
  readonly userId: UUID;
  readonly habitCategory: string;
  readonly logDate: ISODateString;
  readonly isCompleted: boolean;
  readonly effortRating: number | null;
  readonly notes: string | null;
  readonly loggedAt: ISODateTimeString;
}

/** Input for logging a habit completion. */
export interface LogHabitInput {
  readonly notes?: string;
  readonly effortRating?: number;
}

/** Goal with progress info for list endpoints. */
export interface GoalWithProgress extends Goal {
  readonly completedMilestones: number;
  readonly totalMilestones: number;
  readonly projectedCompletionDate: ISODateString | null;
}

/** Habit tracking summary. */
export interface HabitSummary {
  readonly habitCategory: string;
  readonly currentStreak: number;
  readonly longestStreak: number;
  readonly completionRateByDay: Record<number, number>;
  readonly hasBehavioralDrift: boolean;
}
