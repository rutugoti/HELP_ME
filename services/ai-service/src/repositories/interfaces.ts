// ─────────────────────────────────────────────────────────────
// LastMinute — AI Service Repositories Interfaces
// Enforces decoupling of data access from business services per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { ActionDraft, SubmitDraftFeedbackInput, AIRecommendation } from "@lastminute/types";
import { PriorityTier } from "@lastminute/types";
import type { Knex } from "knex";

export interface TaskPriorityScoreInput {
  taskId: string;
  userId: string;
  totalScore: number;
  deadlineProximityScore: number;
  dependencyImpactScore: number;
  consequenceSeverityScore: number;
  priorityTier: PriorityTier;
  scoringVersion: string;
  scoredAt: string;
}

export interface ITaskPriorityScoreRepository {
  updateScoreAndLogHistory(
    score: TaskPriorityScoreInput,
    triggerEvent: string,
    trx?: Knex.Transaction
  ): Promise<void>;
  listActiveScoresForUser(
    userId: string,
    trx?: Knex.Transaction
  ): Promise<TaskPriorityScoreInput[]>;
}

export interface IActionDraftRepository {
  createDraft(
    draft: Omit<ActionDraft, "id" | "createdAt" | "updatedAt" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<ActionDraft>;
  findActiveByTaskId(taskId: string, trx?: Knex.Transaction): Promise<ActionDraft | null>;
  submitFeedback(
    draftId: string,
    userId: string,
    input: SubmitDraftFeedbackInput,
    trx?: Knex.Transaction
  ): Promise<void>;
}

export interface IRecommendationRepository {
  listActiveForUser(userId: string, trx?: Knex.Transaction): Promise<AIRecommendation[]>;
  createRecommendation(
    rec: Omit<AIRecommendation, "id" | "createdAt" | "updatedAt" | "generatedAt">,
    trx?: Knex.Transaction
  ): Promise<AIRecommendation>;
  dismiss(id: string, userId: string, trx?: Knex.Transaction): Promise<void>;
}
