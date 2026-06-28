// ─────────────────────────────────────────────────────────────
// LastMinute — TaskPriorityScore Knex Repository Implementation
// Maps snake_case database columns to camelCase domain models per Rule 6.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { PriorityTier } from "@lastminute/types";
import type { TaskPriorityScoreInput, ITaskPriorityScoreRepository } from "../interfaces.js";
import type { Knex } from "knex";
import { randomUUID } from "crypto";

export function mapRowToPriorityScoreInput(row: Record<string, unknown>): TaskPriorityScoreInput {
  return {
    taskId: row["task_id"] as string,
    userId: row["user_id"] as string,
    totalScore: Number(row["total_score"]),
    deadlineProximityScore: Number(row["deadline_proximity_score"]),
    dependencyImpactScore: Number(row["dependency_impact_score"]),
    consequenceSeverityScore: Number(row["consequence_severity_score"]),
    priorityTier: row["priority_tier"] as PriorityTier,
    scoringVersion: row["scoring_version"] as string,
    scoredAt: new Date(row["scored_at"] as string).toISOString(),
  };
}

export class TaskPriorityScoreRepository implements ITaskPriorityScoreRepository {
  async updateScoreAndLogHistory(
    score: TaskPriorityScoreInput,
    triggerEvent: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const scoreQuery = trx ? trx("task_priority_scores") : db("task_priority_scores");
    const historyQuery = trx ? trx("task_score_history") : db("task_score_history");

    const existing = await scoreQuery.where({ task_id: score.taskId }).first();
    const scoredAt = new Date(score.scoredAt);

    if (existing) {
      await scoreQuery.where({ task_id: score.taskId }).update({
        total_score: score.totalScore,
        deadline_proximity_score: score.deadlineProximityScore,
        dependency_impact_score: score.dependencyImpactScore,
        consequence_severity_score: score.consequenceSeverityScore,
        priority_tier: score.priorityTier,
        scoring_version: score.scoringVersion,
        scored_at: scoredAt,
        updated_at: new Date(),
      });
    } else {
      await scoreQuery.insert({
        id: randomUUID(),
        task_id: score.taskId,
        user_id: score.userId,
        total_score: score.totalScore,
        deadline_proximity_score: score.deadlineProximityScore,
        dependency_impact_score: score.dependencyImpactScore,
        consequence_severity_score: score.consequenceSeverityScore,
        priority_tier: score.priorityTier,
        scoring_version: score.scoringVersion,
        scored_at: scoredAt,
      });
    }

    await historyQuery.insert({
      id: randomUUID(),
      task_id: score.taskId,
      user_id: score.userId,
      total_score: score.totalScore,
      priority_tier: score.priorityTier,
      trigger_event: triggerEvent,
      scored_at: scoredAt,
    });
  }

  async listActiveScoresForUser(
    userId: string,
    trx?: Knex.Transaction
  ): Promise<TaskPriorityScoreInput[]> {
    const query = trx ? trx("task_priority_scores") : db("task_priority_scores");
    const rows = await query.where({ user_id: userId });
    return rows.map((r) => mapRowToPriorityScoreInput(r as unknown as Record<string, unknown>));
  }
}
