// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Routes
// Aligns Express routing and endpoints with Api.md.
// ─────────────────────────────────────────────────────────────

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { validateQuery } from "../middleware/validateQuery.js";
import {
  connectProviderSchema,
  availabilityQuerySchema,
  createFocusBlockSchema,
} from "@lastminute/schemas";
import { CalendarProviderRepository } from "../repositories/knex/CalendarProviderRepository.js";
import { CalendarEventRepository } from "../repositories/knex/CalendarEventRepository.js";
import { FocusBlockRepository } from "../repositories/knex/FocusBlockRepository.js";
import { UserPreferencesRepository } from "../repositories/knex/UserPreferencesRepository.js";
import { CalendarService } from "../services/CalendarService.js";
import { CalendarController } from "../controllers/CalendarController.js";

const router: Router = Router();

// Instantiate components
const providerRepo = new CalendarProviderRepository();
const eventRepo = new CalendarEventRepository();
const focusBlockRepo = new FocusBlockRepository();
const preferencesRepo = new UserPreferencesRepository();

const calendarService = new CalendarService(
  providerRepo,
  eventRepo,
  focusBlockRepo,
  preferencesRepo
);

const controller = new CalendarController(calendarService);

// ─────────────────────────────────────────────────────────────
// Public / Integration Routes (No JWT authentication required)
// ─────────────────────────────────────────────────────────────
router.get("/providers/callback", controller.handleOAuthCallback);
router.post("/webhooks/:provider", controller.handleWebhook);

// ─────────────────────────────────────────────────────────────
// Authenticated Routes (Requires Bearer Token)
// ─────────────────────────────────────────────────────────────
router.use(authMiddleware);

router.get("/providers", controller.listProviders);
router.post("/providers/connect", validateBody(connectProviderSchema), controller.connectProvider);
router.delete("/providers/:providerId", controller.disconnectProvider);

router.get("/availability", validateQuery(availabilityQuerySchema), controller.getAvailability);

router.post("/focus-blocks", validateBody(createFocusBlockSchema), controller.scheduleFocusBlock);
router.delete("/focus-blocks/:blockId", controller.cancelFocusBlock);

export default router;
export { router as calendarRouter };
