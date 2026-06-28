// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Routes
// Aligns Express routing and endpoints with Api.md notifications section.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { updateNotificationPreferencesSchema } from "@lastminute/schemas";
import { NotificationRepository } from "../repositories/knex/NotificationRepository.js";
import { NotificationPreferencesRepository } from "../repositories/knex/NotificationPreferencesRepository.js";
import { NotificationService } from "../services/NotificationService.js";
import { NotificationController } from "../controllers/NotificationController.js";

const router: Router = Router();

// Instantiate components
const notifRepo = new NotificationRepository();
const prefsRepo = new NotificationPreferencesRepository();
const service = new NotificationService(notifRepo, prefsRepo);
const controller = new NotificationController(service);

// ─────────────────────────────────────────────────────────────
// Authenticated Routes (Requires Bearer Token)
// ─────────────────────────────────────────────────────────────
router.use(authMiddleware);

router.get("/", controller.listNotifications);
router.post("/:notificationId/read", controller.markRead);
router.post("/:notificationId/acted", controller.markActed);
router.get("/preferences", controller.getPreferences);
router.put(
  "/preferences",
  validateBody(updateNotificationPreferencesSchema),
  controller.updatePreferences
);

export default router;
export { router as notificationRouter };
