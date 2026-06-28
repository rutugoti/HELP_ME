// ─────────────────────────────────────────────────────────────
// LastMinute — Goal & Habit Routes
// Mounts Goal and Habit routes to the Task Service host.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { createGoalSchema, logHabitSchema } from "@lastminute/schemas";
import { GoalRepository } from "../repositories/knex/GoalRepository.js";
import { GoalMilestoneRepository } from "../repositories/knex/GoalMilestoneRepository.js";
import { HabitLogRepository } from "../repositories/knex/HabitLogRepository.js";
import { GoalService } from "../services/GoalService.js";
import { HabitService } from "../services/HabitService.js";
import { GoalController } from "../controllers/GoalController.js";

const goalRouter: Router = Router();
const habitRouter: Router = Router();

// Instantiate repositories
const goalRepo = new GoalRepository();
const milestoneRepo = new GoalMilestoneRepository();
const habitRepo = new HabitLogRepository();

// Instantiate services
const goalService = new GoalService(goalRepo, milestoneRepo);
const habitService = new HabitService(habitRepo);

// Instantiate controller
const controller = new GoalController(goalService, habitService);

// ─────────────────────────────────────────────────────────────
// Secure endpoints with auth middleware
// ─────────────────────────────────────────────────────────────
goalRouter.use(authMiddleware);
habitRouter.use(authMiddleware);

// Goal Routes (mounted at /api/v1/goals)
goalRouter.get("/", controller.listGoals);
goalRouter.post("/", validateBody(createGoalSchema), controller.createGoal);
goalRouter.get("/:goalId/milestones", controller.getMilestones);
goalRouter.put("/:goalId", controller.updateGoal);
goalRouter.post("/milestones/:milestoneId/toggle", controller.toggleMilestone);
goalRouter.delete("/:goalId", controller.deleteGoal);

// Habit Routes (mounted at /api/v1/habits)
habitRouter.get("/", controller.listHabits);
habitRouter.post("/:habitCategory/log", validateBody(logHabitSchema), controller.logHabit);

export { goalRouter, habitRouter };
