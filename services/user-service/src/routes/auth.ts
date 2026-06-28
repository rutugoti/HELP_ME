// ─────────────────────────────────────────────────────────────
// LastMinute — Authentication Routes
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { AuthService } from "../services/AuthService.js";
import { UserRepository } from "../repositories/knex/UserRepository.js";
import { UserPreferencesRepository } from "../repositories/knex/UserPreferencesRepository.js";
import { RefreshTokenRepository } from "../repositories/knex/RefreshTokenRepository.js";
import { validateBody } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@lastminute/schemas";

const router = Router();

// Wire up dependencies per Rule 2 (decoupling and injection)
const userRepository = new UserRepository();
const userPreferencesRepository = new UserPreferencesRepository();
const refreshTokenRepository = new RefreshTokenRepository();

const authService = new AuthService(
  userRepository,
  userPreferencesRepository,
  refreshTokenRepository
);
const authController = new AuthController(authService);

// Routes definition
router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/refresh", validateBody(refreshTokenSchema), authController.refresh);
router.post("/logout", validateBody(refreshTokenSchema), authController.logout);
router.post(
  "/password/reset-request",
  validateBody(passwordResetRequestSchema),
  authController.requestPasswordReset
);
router.post("/password/reset", validateBody(passwordResetSchema), authController.resetPassword);

export const authRouter: Router = router;
export default authRouter;
