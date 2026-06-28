// ─────────────────────────────────────────────────────────────
// LastMinute — User Profile Controller
// Handles profile retrieval, updates, preferences, and stats.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { IUserService } from "../services/interfaces.js";
import { UnauthenticatedError } from "../utils/errors.js";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError();
      }

      const result = await this.userService.getProfile(req.user.userId);
      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError();
      }

      const result = await this.userService.updateProfile(req.user.userId, req.body);
      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getPreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError();
      }

      const result = await this.userService.getPreferences(req.user.userId);
      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError();
      }

      const result = await this.userService.updatePreferences(req.user.userId, req.body);
      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError();
      }

      const result = await this.userService.getStats(req.user.userId);
      res.status(200).json({
        status: "success",
        data: result,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
