// ─────────────────────────────────────────────────────────────
// LastMinute — AI Engine Routes
// Aligns Express routing and endpoints with Api.md.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { simulateTaskSchema, actionDraftFeedbackSchema } from "@lastminute/schemas";
import { TaskPriorityScoreRepository } from "../repositories/knex/TaskPriorityScoreRepository.js";
import { ActionDraftRepository } from "../repositories/knex/ActionDraftRepository.js";
import { RecommendationRepository } from "../repositories/knex/RecommendationRepository.js";
import { AIService } from "../services/AIService.js";
import { AIController } from "../controllers/AIController.js";

const router: Router = Router();

// Instantiate components
const scoreRepo = new TaskPriorityScoreRepository();
const draftRepo = new ActionDraftRepository();
const recRepo = new RecommendationRepository();

const aiService = new AIService(scoreRepo, draftRepo, recRepo);
const controller = new AIController(aiService);

// ─────────────────────────────────────────────────────────────
// Authenticated Routes (Requires Bearer Token)
// ─────────────────────────────────────────────────────────────
router.use(authMiddleware);

router.post("/prioritize", controller.prioritize);
router.post("/simulate", validateBody(simulateTaskSchema), controller.simulate);
router.get("/recommendations", controller.listRecommendations);
router.post("/recommendations/:recommendationId/dismiss", controller.dismissRecommendation);
router.get("/insights", controller.listInsights);
router.post(
  "/drafts/:draftId/feedback",
  validateBody(actionDraftFeedbackSchema),
  controller.submitDraftFeedback
);

export default router;
export { router as aiRouter };
