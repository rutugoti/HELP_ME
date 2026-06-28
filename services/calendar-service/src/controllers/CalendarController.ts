// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Controller
// Maps HTTP payloads to Service calls and formats standard responses per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { CalendarService } from "../services/CalendarService.js";
import { ForbiddenError } from "../utils/errors.js";
import { db } from "@lastminute/database";
import { logger } from "../config/logger.js";

export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  listProviders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const providers = await this.calendarService.listProviders(userId);
      res.status(200).json({
        status: "success",
        data: providers,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  connectProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { provider } = req.body;
      const result = await this.calendarService.connectProvider(userId, provider);
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

  disconnectProvider = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { providerId } = req.params;
      await this.calendarService.disconnectProvider(userId, providerId!);
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

  handleOAuthCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.query["code"] as string;
      const state = req.query["state"] as string;

      await this.calendarService.handleOAuthCallback(code, state);

      // Respond to client indicating successful authorization flow
      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h2>Authorization Successful!</h2>
            <p>Your calendar connection has been activated. You may close this window.</p>
            <script>setTimeout(() => window.close(), 3000);</script>
          </body>
        </html>
      `);
    } catch (err) {
      next(err);
    }
  };

  getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const startDate = req.query["startDate"] as string;
      const endDate = req.query["endDate"] as string;
      const minimumMinutes = req.query["minimumMinutes"]
        ? Number(req.query["minimumMinutes"])
        : undefined;

      const windows = await this.calendarService.getAvailability(
        userId,
        startDate,
        endDate,
        minimumMinutes
      );

      res.status(200).json({
        status: "success",
        data: windows,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  scheduleFocusBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const block = await this.calendarService.scheduleFocusBlock(userId, req.body);
      res.status(201).json({
        status: "success",
        data: block,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  cancelFocusBlock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { blockId } = req.params;
      await this.calendarService.cancelFocusBlock(userId, blockId!);

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

  handleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { provider } = req.params;

      // Microsoft validation token handshake
      const validationToken = req.query["validationToken"] as string | undefined;
      if (validationToken) {
        res.setHeader("Content-Type", "text/plain");
        res.status(200).send(validationToken);
        return;
      }

      logger.info(`Received calendar webhook for provider: ${provider}`);

      // Query active connections for this provider and update cached events
      const activeProviders = await db("calendar_providers").where({
        provider,
        sync_status: "active",
      });

      for (const p of activeProviders) {
        this.calendarService.syncCalendarEvents(p.id).catch((err) => {
          logger.error(`Async webhook sync failure for provider connection ${p.id}`, {
            error: err.message,
          });
        });
      }

      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };
}
