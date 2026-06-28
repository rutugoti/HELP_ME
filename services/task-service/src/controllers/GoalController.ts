// ─────────────────────────────────────────────────────────────
// LastMinute — Goal and Habit Controller
// Routes REST requests to GoalService and HabitService per Api.md.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { GoalService } from "../services/GoalService.js";
import type { HabitService } from "../services/HabitService.js";

export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly habitService: HabitService
  ) {}

  /**
   * GET /api/v1/goals
   */
  listGoals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const goals = await this.goalService.listGoals(userId);
      res.status(200).json({ status: "success", data: goals });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/goals
   */
  createGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const goal = await this.goalService.createGoal(userId, req.body);
      res.status(201).json({ status: "success", data: goal });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/v1/goals/:goalId
   */
  updateGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { goalId } = req.params;
      const goal = await this.goalService.updateGoal(goalId!, userId, req.body);
      res.status(200).json({ status: "success", data: goal });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/goals/:goalId/milestones
   */
  getMilestones = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { goalId } = req.params;
      const milestones = await this.goalService.listMilestones(goalId!, userId);
      res.status(200).json({ status: "success", data: milestones });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/goals/milestones/:milestoneId/toggle
   */
  toggleMilestone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { milestoneId } = req.params;
      const { isCompleted } = req.body;
      await this.goalService.updateMilestone(milestoneId!, userId, Boolean(isCompleted));
      res.status(200).json({ status: "success", message: "Milestone status updated." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/v1/goals/:goalId
   */
  deleteGoal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { goalId } = req.params;
      await this.goalService.deleteGoal(goalId!, userId);
      res.status(200).json({ status: "success", message: "Goal deleted successfully." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/habits
   */
  listHabits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const habits = await this.habitService.listHabits(userId);
      res.status(200).json({ status: "success", data: habits });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/habits/:habitCategory/log
   */
  logHabit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { habitCategory } = req.params;
      const log = await this.habitService.logHabit(userId, habitCategory!, req.body);
      res.status(201).json({ status: "success", data: log });
    } catch (err) {
      next(err);
    }
  };
}
