// ─────────────────────────────────────────────────────────────
// LastMinute — Goal Service
// Manages goal lifecycle and auto-generation of weekly milestones.
// ─────────────────────────────────────────────────────────────

import type { Goal, GoalWithProgress, CreateGoalInput } from "@lastminute/types";
import { GoalStatus } from "@lastminute/types";
import type { IGoalRepository, IGoalMilestoneRepository } from "../repositories/interfaces.js";
import { db } from "@lastminute/database";
import { NotFoundError } from "../utils/errors.js";
import { logger } from "../config/logger.js";

export class GoalService {
  constructor(
    private readonly goalRepo: IGoalRepository,
    private readonly milestoneRepo: IGoalMilestoneRepository
  ) {}

  /**
   * Lists user goals enriched with milestone progress metrics and projections.
   */
  async listGoals(userId: string): Promise<GoalWithProgress[]> {
    const goals = await this.goalRepo.listForUser(userId);
    const result: GoalWithProgress[] = [];

    for (const goal of goals) {
      const milestones = await this.milestoneRepo.listForGoal(goal.id, userId);
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter((m) => m.isCompleted).length;

      // Project completion date based on velocity
      let projectedCompletionDate: string | null = null;
      if (totalMilestones > 0 && completedMilestones > 0) {
        const timeElapsed = Date.now() - new Date(goal.createdAt).getTime();
        const progressRate = completedMilestones / totalMilestones;
        const totalEstimatedTime = timeElapsed / progressRate;
        const projectedTime = new Date(goal.createdAt).getTime() + totalEstimatedTime;
        projectedCompletionDate = new Date(projectedTime).toISOString().split("T")[0]!;
      }

      result.push({
        ...goal,
        completedMilestones,
        totalMilestones,
        projectedCompletionDate,
      });
    }

    return result;
  }

  /**
   * Creates a goal and generates weekly milestones up to the target date.
   */
  async createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
    const trx = await db.transaction();
    try {
      const goal = await this.goalRepo.create(
        {
          userId,
          title: input.title,
          description: input.description ?? null,
          targetDate: input.targetDate,
        },
        trx
      );

      // Auto-generate weekly milestones
      const start = new Date();
      const target = new Date(input.targetDate);
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const diffMs = target.getTime() - start.getTime();

      const numWeeks = Math.max(1, Math.floor(diffMs / msPerWeek));
      const milestones = [];

      for (let i = 1; i <= numWeeks; i++) {
        const dueDate = new Date(start.getTime() + i * msPerWeek);
        // Ensure we don't shoot past target date
        const finalDueDate = dueDate > target ? target : dueDate;

        milestones.push({
          goalId: goal.id,
          userId,
          title: `Milestone ${i}: Weekly progression toward ${goal.title}`,
          dueDate: finalDueDate.toISOString().split("T")[0]!,
        });

        if (dueDate > target) break;
      }

      await this.milestoneRepo.createMilestones(milestones, trx);
      await trx.commit();

      logger.info("Goal created with auto-generated milestones", {
        goalId: goal.id,
        userId,
        milestonesCreated: milestones.length,
      });

      return goal;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  /**
   * Updates a goal.
   */
  async updateGoal(
    id: string,
    userId: string,
    input: Partial<CreateGoalInput & { status: GoalStatus }>
  ): Promise<Goal> {
    const goal = await this.goalRepo.findById(id, userId);
    if (!goal) {
      throw new NotFoundError("Goal not found.");
    }
    const updated = await this.goalRepo.update(id, userId, {
      title: input.title,
      description: input.description,
      targetDate: input.targetDate,
      status: input.status,
    });
    logger.info("Goal updated", { goalId: id, userId });
    return updated;
  }

  /**
   * Marks a milestone as completed or incomplete.
   */
  async updateMilestone(milestoneId: string, userId: string, isCompleted: boolean): Promise<void> {
    await this.milestoneRepo.updateMilestone(milestoneId, userId, isCompleted);
    logger.info("Goal milestone status updated", { milestoneId, userId, isCompleted });
  }

  /**
   * Soft deletes a goal and deletes its associated milestones.
   */
  async deleteGoal(id: string, userId: string): Promise<void> {
    const goal = await this.goalRepo.findById(id, userId);
    if (!goal) {
      throw new NotFoundError("Goal not found.");
    }

    const trx = await db.transaction();
    try {
      await this.goalRepo.softDelete(id, userId, trx);
      await this.milestoneRepo.deleteForGoal(id, trx);
      await trx.commit();
      logger.info("Goal soft deleted", { goalId: id, userId });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }
}
