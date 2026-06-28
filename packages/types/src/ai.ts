import type { BaseEntity, ISODateTimeString, UUID } from "./common.js";
import type { DraftType, FeedbackType, RecommendationSeverity } from "./enums.js";

/** AI-generated action draft for a task. */
export interface ActionDraft extends BaseEntity {
  readonly taskId: UUID;
  readonly userId: UUID;
  readonly draftType: DraftType;
  readonly content: string;
  readonly isActive: boolean;
  readonly modelVersion: string;
  readonly promptVersion: string;
  readonly generatedAt: ISODateTimeString;
}

/** User feedback on an action draft. */
export interface ActionDraftFeedback {
  readonly id: UUID;
  readonly draftId: UUID;
  readonly userId: UUID;
  readonly feedbackType: FeedbackType;
  readonly notes: string | null;
  readonly submittedAt: ISODateTimeString;
}

/** Input for submitting action draft feedback. */
export interface SubmitDraftFeedbackInput {
  readonly feedbackType: FeedbackType;
  readonly notes?: string;
}

/** AI-generated advisory recommendation. */
export interface AIRecommendation extends BaseEntity {
  readonly userId: UUID;
  readonly recommendationType: string;
  readonly content: string;
  readonly reasoning: string;
  readonly isDismissed: boolean;
  readonly dismissedAt: ISODateTimeString | null;
  readonly relatedTaskId: UUID | null;
  readonly severity: RecommendationSeverity;
  readonly generatedAt: ISODateTimeString;
  readonly expiresAt: ISODateTimeString | null;
}

/** Raw behavioral event consumed by the Context Engine. Append-only. */
export interface BehavioralEvent {
  readonly id: UUID;
  readonly userId: UUID;
  readonly eventType: BehavioralEventType;
  readonly taskId: UUID | null;
  readonly taskCategory: string | null;
  readonly daysBeforeDeadline: number | null;
  readonly eventMetadata: Record<string, unknown> | null;
  readonly occurredAt: ISODateTimeString;
}

/** Known behavioral event types. */
export type BehavioralEventType =
  | "task-initiated"
  | "task-completed"
  | "recommendation-dismissed"
  | "action-draft-used"
  | "priority-overridden";

/** Behavioral insights from the Context Engine. */
export interface BehavioralInsights {
  readonly procrastinationPatterns: CategoryPattern[];
  readonly optimalFocusWindows: FocusWindowAnalysis[];
  readonly categoryTrends: CategoryTrend[];
}

export interface CategoryPattern {
  readonly category: string;
  readonly averageInitiationDelay: number;
  readonly onTimeRate: number;
}

export interface FocusWindowAnalysis {
  readonly hour: number;
  readonly dayOfWeek: number;
  readonly productivityScore: number;
}

export interface CategoryTrend {
  readonly category: string;
  readonly completionRate30d: number;
  readonly completionRate90d: number;
  readonly trend: "improving" | "declining" | "stable";
}

/** Input for AI simulation endpoint. */
export interface SimulateTaskInput {
  readonly title: string;
  readonly description?: string;
  readonly deadline: ISODateTimeString;
  readonly estimatedMinutes?: number;
  readonly category: string;
  readonly consequenceSeverity?: string;
}

/** Result from AI simulation endpoint. */
export interface SimulationResult {
  readonly predictedScore: number;
  readonly predictedTier: string;
  readonly riskAssessment: string;
  readonly conflictsWithExisting: boolean;
  readonly affectedTaskIds: UUID[];
}
