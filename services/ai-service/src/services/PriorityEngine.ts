// ─────────────────────────────────────────────────────────────
// LastMinute — Priority Engine Service
// Computes tasks scores and logs historical priority changes.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import { PriorityTier } from "@lastminute/types";
import type { TaskPriorityScoreInput } from "../repositories/interfaces.js";

export class PriorityEngine {
  /**
   * Traverses downstream dependencies using BFS to find total transitive blocked task count.
   */
  async getTransitiveBlockedCount(taskId: string, trx = db): Promise<number> {
    const dependencies = await trx("task_dependencies").select(
      "dependent_task_id",
      "required_task_id"
    );

    const visited = new Set<string>();
    const queue = [taskId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const childIds = dependencies
        .filter((d) => d.required_task_id === current)
        .map((d) => d.dependent_task_id as string);

      for (const cid of childIds) {
        if (!visited.has(cid)) {
          visited.add(cid);
          queue.push(cid);
        }
      }
    }

    return visited.size;
  }

  /**
   * Calculates raw score metrics for a given task.
   */
  async calculateTaskScore(
    userId: string,
    task: {
      id: string;
      deadline: string | Date;
      effective_deadline?: string | Date | null;
      estimated_minutes?: number | null;
      consequence_severity?: string | null;
    },
    trx = db
  ): Promise<Omit<TaskPriorityScoreInput, "scoredAt">> {
    const now = new Date();
    const deadline = task.effective_deadline
      ? new Date(task.effective_deadline)
      : new Date(task.deadline);

    // 1. Deadline Proximity Score
    const timeRemainingMinutes = (deadline.getTime() - now.getTime()) / 60000;
    const estimatedMinutes = task.estimated_minutes || 60;

    let proximityScore = 0;
    if (timeRemainingMinutes <= 0 || estimatedMinutes >= timeRemainingMinutes) {
      proximityScore = 100;
    } else {
      proximityScore = Math.min(100, Math.round((estimatedMinutes / timeRemainingMinutes) * 100));
    }

    // 2. Dependency Impact Score (transitive child tasks count * 15, capped at 100)
    const blockedCount = await this.getTransitiveBlockedCount(task.id, trx);
    const dependencyImpactScore = Math.min(100, blockedCount * 15);

    // 3. Consequence Severity Score
    let consequenceSeverityScore = 50;
    if (task.consequence_severity === "low") consequenceSeverityScore = 25;
    else if (task.consequence_severity === "high") consequenceSeverityScore = 75;
    else if (task.consequence_severity === "critical") consequenceSeverityScore = 100;

    // 4. Weighted Priority Score Calculation
    let totalScore =
      proximityScore * 0.4 + dependencyImpactScore * 0.3 + consequenceSeverityScore * 0.3;
    if (proximityScore === 100) {
      totalScore = 100; // Critical override if deadline is immediate
    }

    let priorityTier = PriorityTier.Medium;
    if (totalScore >= 80) priorityTier = PriorityTier.Critical;
    else if (totalScore >= 60) priorityTier = PriorityTier.High;
    else if (totalScore >= 30) priorityTier = PriorityTier.Medium;
    else priorityTier = PriorityTier.Low;

    return {
      taskId: task.id,
      userId,
      totalScore,
      deadlineProximityScore: proximityScore,
      dependencyImpactScore,
      consequenceSeverityScore,
      priorityTier,
      scoringVersion: "v1.2.0",
    };
  }
}
