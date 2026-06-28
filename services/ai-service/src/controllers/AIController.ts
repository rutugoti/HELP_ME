// ─────────────────────────────────────────────────────────────
// LastMinute — AI Engine Controller
// Maps HTTP payloads to Service calls and formats standard responses per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { AIService } from "../services/AIService.js";
import { ForbiddenError } from "../utils/errors.js";

export class AIController {
  constructor(private readonly aiService: AIService) {}

  prioritize = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const triggerEvent = (req.body.triggerEvent as string) || "manual_refresh";
      const jobId = await this.aiService.prioritizeUserTasks(userId, triggerEvent);

      res.status(202).json({
        status: "success",
        data: {
          jobId,
          status: "queued",
        },
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  simulate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const result = await this.aiService.simulateTaskPriority(userId, req.body);
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

  listRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const recommendations = await this.aiService.listRecommendations(userId);
      res.status(200).json({
        status: "success",
        data: recommendations,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  dismissRecommendation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { recommendationId } = req.params;
      await this.aiService.dismissRecommendation(userId, recommendationId!);

      res.status(200).json({
        status: "success",
        data: null,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  listInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const insights = await this.aiService.listInsights(userId);
      res.status(200).json({
        status: "success",
        data: insights,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  submitDraftFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { draftId } = req.params;
      await this.aiService.submitDraftFeedback(draftId!, userId, req.body);

      res.status(200).json({
        status: "success",
        data: null,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
