// ─────────────────────────────────────────────────────────────
// LastMinute — Task Domain Types
// Derived from Db.md: tasks, task_priority_scores,
// task_score_history, task_dependencies, task_status_history
// ─────────────────────────────────────────────────────────────

import type { BaseEntity, ISODateTimeString, SoftDeletableEntity, UUID } from "./common.js";
import type {
  ConsequenceSeverity,
  PriorityTier,
  StatusTransitionInitiator,
  TaskStatus,
} from "./enums.js";

// ── tasks table ─────────────────────────────────────────────

/** Core task record. */
export interface Task extends SoftDeletableEntity {
  /** Foreign key to users.id. */
  readonly userId: UUID;
  /** Task title (max 500 chars). */
  readonly title: string;
  /** Optional detailed description. */
  readonly description: string | null;
  /** Task category — validated against controlled vocabulary. */
  readonly category: string;
  /** Current lifecycle status. */
  readonly status: TaskStatus;
  /** User-set deadline. */
  readonly deadline: ISODateTimeString;
  /** Context Engine adjusted deadline. Null if no behavioral adjustment applied. */
  readonly effectiveDeadline: ISODateTimeString | null;
  /** User-estimated effort in minutes. */
  readonly estimatedMinutes: number | null;
  /** Actual effort in minutes, populated on completion. */
  readonly actualMinutes: number | null;
  /** Consequence severity — initialized from role defaults. */
  readonly consequenceSeverity: ConsequenceSeverity;
  /** Timestamp when task was started (status → in-progress). */
  readonly initiatedAt: ISODateTimeString | null;
  /** Timestamp when task was completed. */
  readonly completedAt: ISODateTimeString | null;
}

/** Fields accepted when creating a new task. */
export interface CreateTaskInput {
  readonly title: string;
  readonly description?: string;
  readonly deadline: ISODateTimeString;
  readonly estimatedMinutes?: number;
  readonly category: string;
  readonly dependsOn?: UUID[];
  readonly consequenceSeverityOverride?: ConsequenceSeverity;
  readonly tags?: string[];
}

/** Fields accepted when updating an existing task. */
export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string | null;
  readonly deadline?: ISODateTimeString;
  readonly estimatedMinutes?: number | null;
  readonly category?: string;
  readonly consequenceSeverity?: ConsequenceSeverity;
}

/** Filters for the task list endpoint. */
export interface TaskListFilters {
  readonly status?: TaskStatus;
  readonly category?: string;
  readonly deadlineBefore?: ISODateTimeString;
  readonly deadlineAfter?: ISODateTimeString;
  readonly priorityTier?: PriorityTier;
}

// ── task_priority_scores table ──────────────────────────────

/** Most recent computed priority score for a task. */
export interface TaskPriorityScore extends BaseEntity {
  /** Foreign key to tasks.id. One score per task. */
  readonly taskId: UUID;
  /** Foreign key to users.id. */
  readonly userId: UUID;
  /** Composite priority score. */
  readonly totalScore: number;
  /** Score component: ratio of time remaining to estimated effort. */
  readonly deadlineProximityScore: number;
  /** Score component: count of downstream blocked tasks/people. */
  readonly dependencyImpactScore: number;
  /** Score component: derived from role profile and task category. */
  readonly consequenceSeverityScore: number;
  /** Computed tier based on total score thresholds. */
  readonly priorityTier: PriorityTier;
  /** Version of the scoring algorithm that produced this result. */
  readonly scoringVersion: string;
  /** When this score was computed. */
  readonly scoredAt: ISODateTimeString;
}

/** Score breakdown returned in API responses alongside task data. */
export interface ScoreComponents {
  readonly deadlineProximity: number;
  readonly dependencyImpact: number;
  readonly consequenceSeverity: number;
}

// ── task_score_history table ────────────────────────────────

/** Append-only historical priority score entry for trend analysis. */
export interface TaskScoreHistory {
  readonly id: UUID;
  readonly taskId: UUID;
  readonly userId: UUID;
  readonly totalScore: number;
  readonly priorityTier: PriorityTier;
  /** What event triggered this scoring run (e.g., "task-created", "deadline-threshold"). */
  readonly triggerEvent: string;
  readonly scoredAt: ISODateTimeString;
}

// ── task_dependencies table ─────────────────────────────────

/** Directed edge in the task dependency graph. */
export interface TaskDependency extends BaseEntity {
  /** The task that is blocked (depends on the required task). */
  readonly dependentTaskId: UUID;
  /** The task that must be completed first. */
  readonly requiredTaskId: UUID;
}

/** Dependency graph returned by the dependencies endpoint. */
export interface DependencyGraph {
  /** Tasks that this task depends on (must be completed first). */
  readonly upstream: TaskDependencyNode[];
  /** Tasks that depend on this task (blocked until this is done). */
  readonly downstream: TaskDependencyNode[];
}

/** Node in the dependency graph with minimal task info. */
export interface TaskDependencyNode {
  readonly taskId: UUID;
  readonly title: string;
  readonly status: TaskStatus;
  readonly deadline: ISODateTimeString;
}

// ── task_status_history table ───────────────────────────────

/** Append-only audit record of task status transitions. */
export interface TaskStatusHistory {
  readonly id: UUID;
  readonly taskId: UUID;
  readonly userId: UUID;
  /** Previous status. Null for the first entry (creation). */
  readonly fromStatus: TaskStatus | null;
  /** New status after transition. */
  readonly toStatus: TaskStatus;
  /** When the transition occurred. */
  readonly transitionedAt: ISODateTimeString;
  /** Whether this was a user action or an automated system transition. */
  readonly initiatedBy: StatusTransitionInitiator;
}

// ── Task list item (enriched) ───────────────────────────────

/** Task with priority score and action availability — returned by list endpoints. */
export interface TaskListItem extends Task {
  /** Current AI priority score. */
  readonly priorityScore: number;
  /** Score breakdown by component. */
  readonly scoreComponents: ScoreComponents;
  /** Priority tier label. */
  readonly priorityTier: PriorityTier;
  /** Whether an action draft is available for review. */
  readonly hasActionDraft: boolean;
}
