// ─────────────────────────────────────────────────────────────
// LastMinute — Task Controller
// Maps HTTP payloads to Service calls and formats standard responses per Rule 2.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import type { TaskService } from "../services/TaskService.js";
import { ForbiddenError } from "../utils/errors.js";
import { z } from "zod";
import { TaskStatus, PriorityTier } from "@lastminute/types";

const completeSchema = z.object({
  actualMinutes: z.number().int().positive().optional(),
});

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const task = await this.taskService.createTask(userId, req.body);
      res.status(201).json({
        status: "success",
        data: task,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;
      const task = await this.taskService.getTask(userId, taskId!);
      res.status(200).json({
        status: "success",
        data: task,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;
      const task = await this.taskService.updateTask(userId, taskId!, req.body);
      res.status(200).json({
        status: "success",
        data: task,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;
      await this.taskService.deleteTask(userId, taskId!);
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

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const limit = Number(req.query["limit"]) || 20;
      const cursor = req.query["cursor"] as string | undefined;

      const filters = {
        status: req.query["status"] as TaskStatus | undefined,
        category: req.query["category"] as string | undefined,
        deadlineBefore: req.query["deadlineBefore"] as string | undefined,
        deadlineAfter: req.query["deadlineAfter"] as string | undefined,
        priorityTier: req.query["priorityTier"] as PriorityTier | undefined,
        limit,
        cursor,
      };

      const result = await this.taskService.listTasks(userId, filters);
      res.status(200).json({
        status: "success",
        data: result.items,
        meta: {
          nextCursor: result.nextCursor,
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  start = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;
      const task = await this.taskService.startTask(userId, taskId!);
      res.status(200).json({
        status: "success",
        data: task,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;

      // Validate body if supplied
      const parsed = completeSchema.safeParse(req.body);
      const actualMinutes = parsed.success ? parsed.data.actualMinutes : undefined;

      const task = await this.taskService.completeTask(userId, taskId!, actualMinutes);
      res.status(200).json({
        status: "success",
        data: task,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getDependencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ForbiddenError();
      }

      const { taskId } = req.params;
      const graph = await this.taskService.getDependencies(userId, taskId!);
      res.status(200).json({
        status: "success",
        data: graph,
        meta: {
          correlationId: req.correlationId,
        },
      });
    } catch (err) {
      next(err);
    }
  };
}
