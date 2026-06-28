// ─────────────────────────────────────────────────────────────
// LastMinute — AI Orchestrator Service
// Coordinates Priority, Context, and Action Engines.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { PriorityTier, RecommendationSeverity } from "@lastminute/types";
import { PriorityEngine } from "./PriorityEngine.js";
import { ContextEngine } from "./ContextEngine.js";
import { ActionEngine } from "./ActionEngine.js";
import { logger } from "../config/logger.js";
import { randomUUID } from "crypto";

export class AIOrchestrator {
  private readonly priorityEngine = new PriorityEngine();
  private readonly contextEngine = new ContextEngine();
  private readonly actionEngine = new ActionEngine();

  /**
   * Orchestrates the prioritization of all open tasks for a user.
   * Can be triggered by events (e.g. task created/updated, calendar updates).
   */
  async orchestrateUserPrioritization(userId: string, triggerEvent: string): Promise<string> {
    const jobId = randomUUID();

    // Fire-and-forget background job execution to prevent blocking Express request loops
    this.runPrioritizationJob(userId, triggerEvent, jobId).catch((err) => {
      logger.error("Orchestrated prioritization background run failed", {
        userId,
        jobId,
        error: err.message,
        stack: err.stack,
      });
    });

    return jobId;
  }

  /**
   * Orchestrator job runner.
   */
  private async runPrioritizationJob(
    userId: string,
    triggerEvent: string,
    jobId: string
  ): Promise<void> {
    logger.info("Orchestrator prioritization job started", { userId, jobId, triggerEvent });

    const trx = await db.transaction();
    try {
      // 1. Fetch all open tasks
      const openTasks = await trx("tasks")
        .where({ user_id: userId })
        .whereIn("status", ["open", "in-progress", "overdue"]);

      if (openTasks.length === 0) {
        logger.info("No open tasks to orchestrate scoring for", { userId });
        await trx.commit();
        return;
      }

      const now = new Date();

      for (const task of openTasks) {
        // A. Invoke Context Engine: calculate behavioral effective deadline
        const baseDeadline = new Date(task.deadline);
        const adjustedDeadline = await this.contextEngine.calculateEffectiveDeadline(
          userId,
          task.category || "General",
          baseDeadline
        );

        // Update task with effective_deadline if changed
        if (task.effective_deadline !== adjustedDeadline.toISOString()) {
          await trx("tasks").where({ id: task.id }).update({
            effective_deadline: adjustedDeadline,
            updated_at: now,
          });
          task.effective_deadline = adjustedDeadline;
        }

        // B. Invoke Priority Engine: calculate weighted scores
        const scoreInput = await this.priorityEngine.calculateTaskScore(userId, task, trx);

        // C. Persist Priority Score & append-only History log
        await trx("task_priority_scores")
          .insert({
            id: randomUUID(),
            task_id: task.id,
            user_id: userId,
            total_score: scoreInput.totalScore,
            deadline_proximity_score: scoreInput.deadlineProximityScore,
            dependency_impact_score: scoreInput.dependencyImpactScore,
            consequence_severity_score: scoreInput.consequenceSeverityScore,
            priority_tier: scoreInput.priorityTier,
            scoring_version: scoreInput.scoringVersion,
            scored_at: now,
            created_at: now,
            updated_at: now,
          })
          .onConflict(["task_id", "user_id"])
          .merge({
            total_score: scoreInput.totalScore,
            deadline_proximity_score: scoreInput.deadlineProximityScore,
            dependency_impact_score: scoreInput.dependencyImpactScore,
            consequence_severity_score: scoreInput.consequenceSeverityScore,
            priority_tier: scoreInput.priorityTier,
            scoring_version: scoreInput.scoringVersion,
            scored_at: now,
            updated_at: now,
          });

        await trx("task_score_history").insert({
          id: randomUUID(),
          task_id: task.id,
          user_id: userId,
          total_score: scoreInput.totalScore,
          priority_tier: scoreInput.priorityTier,
          trigger_event: triggerEvent,
          scored_at: now,
          created_at: now,
        });

        // D. Invoke Action Engine: auto-generate first step draft for high risk items
        if (
          scoreInput.priorityTier === PriorityTier.Critical ||
          scoreInput.priorityTier === PriorityTier.High
        ) {
          const activeDraft = await trx("action_drafts")
            .where({ task_id: task.id, is_active: true })
            .first();

          if (!activeDraft) {
            await this.actionEngine.generateActionDraft(userId, task.id, trx);
            logger.info("Action Engine auto-generated action draft skeleton", {
              taskId: task.id,
              userId,
            });
          }
        }
      }

      // E. Generate behavioral AI recommendations
      await this.generateBehavioralRecommendations(userId, trx);

      await trx.commit();
      logger.info("Orchestrator prioritization job completed successfully", { userId, jobId });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  /**
   * Generates context-aware smart recommendations based on current user behavior trends.
   */
  private async generateBehavioralRecommendations(userId: string, trx = db): Promise<void> {
    const overdueTasks = await trx("tasks").where({ user_id: userId, status: "overdue" });
    if (overdueTasks.length > 2) {
      // Find if we have an active recommendation for this already
      const active = await trx("ai_recommendations")
        .where({
          user_id: userId,
          recommendation_type: "procrastination-alert",
          is_dismissed: false,
        })
        .first();

      if (!active) {
        await trx("ai_recommendations").insert({
          id: randomUUID(),
          user_id: userId,
          recommendation_type: "procrastination-alert",
          content: `You have ${overdueTasks.length} overdue tasks. Consider scheduling a dedicated focus block today.`,
          reasoning: "Overdue tasks list exceeds limits, indicating high task initiation delay.",
          is_dismissed: false,
          severity: RecommendationSeverity.Warning,
          generated_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        });

        logger.info("Generated procrastination warning recommendation", { userId });
      }
    }
  }
}
