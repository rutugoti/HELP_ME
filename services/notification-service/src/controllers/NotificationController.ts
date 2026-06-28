// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Controller
// Maps HTTP routes to NotificationService methods per Api.md.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { NotificationService } from "../services/NotificationService.js";

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /**
   * GET /api/v1/notifications
   */
  listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const notifications = await this.service.listNotifications(userId);
      res.status(200).json({ status: "success", data: notifications });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/notifications/:notificationId/read
   */
  markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { notificationId } = req.params;
      await this.service.markRead(notificationId!, userId);
      res.status(200).json({ status: "success", message: "Notification marked as read." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/v1/notifications/:notificationId/acted
   */
  markActed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { notificationId } = req.params;
      await this.service.markActed(notificationId!, userId);
      res.status(200).json({ status: "success", message: "Notification marked as acted-on." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * PUT /api/v1/notifications/preferences
   */
  updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      await this.service.updatePreferences(userId, req.body);
      res.status(200).json({ status: "success", message: "Notification preferences updated." });
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/v1/notifications/preferences
   */
  getPreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const prefs = await this.service.getPreferences(userId);
      res.status(200).json({ status: "success", data: prefs });
    } catch (err) {
      next(err);
    }
  };
}
