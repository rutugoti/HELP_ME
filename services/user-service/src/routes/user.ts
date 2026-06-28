// ─────────────────────────────────────────────────────────────
// LastMinute — User Profile & Preferences Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { UserRepository } from "../repositories/knex/UserRepository.js";
import { UserPreferencesRepository } from "../repositories/knex/UserPreferencesRepository.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { updateUserSchema, updatePreferencesSchema } from "@lastminute/schemas";

const router = Router();

// Wire up dependencies per Rule 2 (decoupling and injection)
const userRepository = new UserRepository();
const userPreferencesRepository = new UserPreferencesRepository();

const userService = new UserService(userRepository, userPreferencesRepository);
const userController = new UserController(userService);

// Protect all user profile and preference routes
router.use(authMiddleware);

// Routes definition
router.get("/me", userController.getProfile);
router.patch("/me", validateBody(updateUserSchema), userController.updateProfile);
router.get("/me/preferences", userController.getPreferences);
router.put(
  "/me/preferences",
  validateBody(updatePreferencesSchema),
  userController.updatePreferences
);
router.get("/me/stats", userController.getStats);

export const userRouter: Router = router;
export default userRouter;
