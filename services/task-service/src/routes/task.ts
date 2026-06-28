// ─────────────────────────────────────────────────────────────
// LastMinute — Task Routes
// Aligns Express routing and endpoints with Api.md.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { validateQuery } from "../middleware/validateQuery.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskListQuerySchema,
  actionDraftFeedbackSchema,
  bulkPrioritizeSchema,
} from "@lastminute/schemas";
import { TaskRepository } from "../repositories/knex/TaskRepository.js";
import { TaskDependencyRepository } from "../repositories/knex/TaskDependencyRepository.js";
import { TaskStatusHistoryRepository } from "../repositories/knex/TaskStatusHistoryRepository.js";
import { UserRepository } from "../repositories/knex/UserRepository.js";
import { ActionDraftRepository } from "../repositories/knex/ActionDraftRepository.js";
import { TaskPriorityScoreRepository } from "../repositories/knex/TaskPriorityScoreRepository.js";
import { TaskService } from "../services/TaskService.js";
import { TaskController } from "../controllers/TaskController.js";

const router: Router = Router();

// Instantiate components
const taskRepository = new TaskRepository();
const taskDependencyRepository = new TaskDependencyRepository();
const taskStatusHistoryRepository = new TaskStatusHistoryRepository();
const userRepository = new UserRepository();
const actionDraftRepository = new ActionDraftRepository();
const taskPriorityScoreRepository = new TaskPriorityScoreRepository();

const taskService = new TaskService(
  taskRepository,
  taskDependencyRepository,
  taskStatusHistoryRepository,
  userRepository,
  actionDraftRepository,
  taskPriorityScoreRepository
);

const controller = new TaskController(taskService);

// Secure all task endpoints
router.use(authMiddleware);

// Endpoints
router.post("/", validateBody(createTaskSchema), controller.create);
router.get("/", validateQuery(taskListQuerySchema), controller.list);
router.post("/bulk-prioritize", validateBody(bulkPrioritizeSchema), controller.bulkPrioritize);

router.get("/:taskId", controller.get);
router.patch("/:taskId", validateBody(updateTaskSchema), controller.update);
router.delete("/:taskId", controller.delete);

router.post("/:taskId/start", controller.start);
router.post("/:taskId/complete", controller.complete);
router.get("/:taskId/dependencies", controller.getDependencies);

router.get("/:taskId/action", controller.getActionDraft);
router.post(
  "/:taskId/action/feedback",
  validateBody(actionDraftFeedbackSchema),
  controller.submitDraftFeedback
);

export default router;
export { router as taskRouter };
