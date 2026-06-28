// ─────────────────────────────────────────────────────────────
// LastMinute — Task Service Implementation
// Implements core task business logic and lifecycle rules per Rule 2.
// ─────────────────────────────────────────────────────────────

import { db } from "@lastminute/database";
import {
  UserRole,
  ConsequenceSeverity,
  TaskStatus,
  StatusTransitionInitiator,
} from "@lastminute/types";
import type {
  Task,
  TaskListItem,
  TaskListFilters,
  CreateTaskInput,
  UpdateTaskInput,
  DependencyGraph,
  ActionDraft,
  ActionDraftFeedback,
  SubmitDraftFeedbackInput,
  TaskPriorityScore,
} from "@lastminute/types";
import { ConflictError, NotFoundError } from "../utils/errors.js";
import type {
  ITaskRepository,
  ITaskDependencyRepository,
  ITaskStatusHistoryRepository,
  IActionDraftRepository,
  ITaskPriorityScoreRepository,
} from "../repositories/interfaces.js";
import { UserRepository } from "../repositories/knex/UserRepository.js";
import { randomUUID } from "crypto";
import { logger } from "../config/logger.js";

// Mapping of role defaults to consequence severity (Db.md specification)
export const ROLE_DEFAULT_SEVERITY: Record<UserRole, ConsequenceSeverity> = {
  [UserRole.Executive]: ConsequenceSeverity.High,
  [UserRole.Medical]: ConsequenceSeverity.Critical,
  [UserRole.Legal]: ConsequenceSeverity.High,
  [UserRole.Developer]: ConsequenceSeverity.Medium,
  [UserRole.Manager]: ConsequenceSeverity.High,
  [UserRole.Student]: ConsequenceSeverity.Low,
  [UserRole.Professional]: ConsequenceSeverity.Medium,
};

export class TaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly taskDependencyRepository: ITaskDependencyRepository,
    private readonly taskStatusHistoryRepository: ITaskStatusHistoryRepository,
    private readonly userRepository: UserRepository,
    private readonly actionDraftRepository: IActionDraftRepository,
    private readonly taskPriorityScoreRepository: ITaskPriorityScoreRepository
  ) {}

  async createTask(userId: string, input: CreateTaskInput): Promise<TaskListItem> {
    const trx = await db.transaction();

    try {
      // 1. Resolve user role to determine default consequence severity
      const role = await this.userRepository.findRoleByUserId(userId, trx);
      if (!role) {
        throw new NotFoundError("User account not found.");
      }

      const defaultSeverity = ROLE_DEFAULT_SEVERITY[role] || ConsequenceSeverity.Medium;
      const consequenceSeverity = input.consequenceSeverityOverride || defaultSeverity;

      const taskId = randomUUID();

      // 2. Create the task record
      const newTask: Omit<
        Task,
        | "createdAt"
        | "updatedAt"
        | "deletedAt"
        | "effectiveDeadline"
        | "actualMinutes"
        | "initiatedAt"
        | "completedAt"
      > = {
        id: taskId,
        userId,
        title: input.title,
        description: input.description || null,
        category: input.category,
        status: TaskStatus.Open,
        deadline: new Date(input.deadline).toISOString(),
        consequenceSeverity,
        estimatedMinutes: input.estimatedMinutes || null,
      };

      await this.taskRepository.create(newTask, trx);

      // 3. Log task creation status transition
      await this.taskStatusHistoryRepository.logTransition(
        {
          taskId,
          userId,
          fromStatus: null,
          toStatus: TaskStatus.Open,
          initiatedBy: StatusTransitionInitiator.User,
        },
        trx
      );

      // 4. Handle dependencies if specified
      if (input.dependsOn && input.dependsOn.length > 0) {
        // Remove duplicate dependencies from request
        const uniqueDependsOn = Array.from(new Set(input.dependsOn));

        for (const reqTaskId of uniqueDependsOn) {
          // Verify required task exists and belongs to the same user
          const reqTask = await this.taskRepository.findById(reqTaskId, trx);
          if (!reqTask || reqTask.userId !== userId) {
            throw new NotFoundError(`Dependent task with ID ${reqTaskId} not found.`);
          }

          // Cycle detection: check if reqTaskId transitively depends on taskId
          // (i.e. reqTaskId is downstream of taskId, or reqTaskId depends on taskId recursively)
          const upstreamIds = await this.taskDependencyRepository.getTransitiveUpstreamIds(
            reqTaskId,
            trx
          );
          if (upstreamIds.has(taskId) || reqTaskId === taskId) {
            throw new ConflictError(
              `Circular dependency detected: task cannot depend on itself or block itself.`
            );
          }

          await this.taskDependencyRepository.addDependency(taskId, reqTaskId, trx);
        }
      }

      await trx.commit();

      const enriched = await this.taskRepository.findByIdEnriched(taskId);
      if (!enriched) {
        throw new Error("Failed to retrieve created task.");
      }

      logger.info("Task created successfully", { taskId, userId });
      return enriched;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async getTask(userId: string, taskId: string): Promise<TaskListItem> {
    const enriched = await this.taskRepository.findByIdEnriched(taskId);
    if (!enriched || enriched.userId !== userId) {
      throw new NotFoundError("Task not found.");
    }
    return enriched;
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<TaskListItem> {
    const trx = await db.transaction();

    try {
      const task = await this.taskRepository.findById(taskId, trx);
      if (!task || task.userId !== userId) {
        throw new NotFoundError("Task not found.");
      }

      // Handle updating fields
      await this.taskRepository.update(
        taskId,
        {
          title: input.title,
          description: input.description,
          category: input.category,
          deadline: input.deadline ? new Date(input.deadline).toISOString() : undefined,
          estimatedMinutes: input.estimatedMinutes,
          consequenceSeverity: input.consequenceSeverity,
        },
        trx
      );

      // Log deadline changes for audit or priority calculation triggers
      if (input.deadline && task.deadline !== new Date(input.deadline).toISOString()) {
        logger.info("Task deadline updated, triggering priority recalculation", {
          taskId,
          userId,
          oldDeadline: task.deadline,
          newDeadline: input.deadline,
        });
      }

      await trx.commit();

      const enriched = await this.taskRepository.findByIdEnriched(taskId);
      if (!enriched) {
        throw new Error("Failed to retrieve updated task.");
      }

      return enriched;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    const trx = await db.transaction();

    try {
      const task = await this.taskRepository.findById(taskId, trx);
      if (!task || task.userId !== userId) {
        throw new NotFoundError("Task not found.");
      }

      // Soft delete task
      await this.taskRepository.softDelete(taskId, trx);

      // Clean up all dependency references to avoid blocking other tasks
      await this.taskDependencyRepository.removeAllForTask(taskId, trx);

      await trx.commit();
      logger.info("Task soft deleted successfully", { taskId, userId });
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async listTasks(
    userId: string,
    filters: TaskListFilters & { limit: number; cursor?: string }
  ): Promise<{ items: TaskListItem[]; nextCursor: string | null }> {
    return this.taskRepository.list(userId, filters);
  }

  async startTask(userId: string, taskId: string): Promise<TaskListItem> {
    const trx = await db.transaction();

    try {
      const task = await this.taskRepository.findById(taskId, trx);
      if (!task || task.userId !== userId) {
        throw new NotFoundError("Task not found.");
      }

      if (task.status !== TaskStatus.Open) {
        throw new ConflictError(`Task cannot be started because its status is '${task.status}'.`);
      }

      await this.taskRepository.update(
        taskId,
        {
          status: TaskStatus.InProgress,
          initiatedAt: new Date().toISOString(),
        },
        trx
      );

      await this.taskStatusHistoryRepository.logTransition(
        {
          taskId,
          userId,
          fromStatus: TaskStatus.Open,
          toStatus: TaskStatus.InProgress,
          initiatedBy: StatusTransitionInitiator.User,
        },
        trx
      );

      await trx.commit();

      const enriched = await this.taskRepository.findByIdEnriched(taskId);
      if (!enriched) {
        throw new Error("Failed to retrieve started task.");
      }

      return enriched;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async completeTask(
    userId: string,
    taskId: string,
    actualMinutes?: number
  ): Promise<TaskListItem> {
    const trx = await db.transaction();

    try {
      const task = await this.taskRepository.findById(taskId, trx);
      if (!task || task.userId !== userId) {
        throw new NotFoundError("Task not found.");
      }

      if (task.status === TaskStatus.Completed) {
        throw new ConflictError("Task is already completed.");
      }

      await this.taskRepository.update(
        taskId,
        {
          status: TaskStatus.Completed,
          completedAt: new Date().toISOString(),
          actualMinutes: actualMinutes || null,
        },
        trx
      );

      await this.taskStatusHistoryRepository.logTransition(
        {
          taskId,
          userId,
          fromStatus: task.status,
          toStatus: TaskStatus.Completed,
          initiatedBy: StatusTransitionInitiator.User,
        },
        trx
      );

      await trx.commit();

      const enriched = await this.taskRepository.findByIdEnriched(taskId);
      if (!enriched) {
        throw new Error("Failed to retrieve completed task.");
      }

      return enriched;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async getDependencies(userId: string, taskId: string): Promise<DependencyGraph> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundError("Task not found.");
    }

    const upstream = await this.taskDependencyRepository.getUpstream(taskId);
    const downstream = await this.taskDependencyRepository.getDownstream(taskId);

    return { upstream, downstream };
  }

  async bulkPrioritize(userId: string, taskIds: string[]): Promise<TaskListItem[]> {
    const tasks = await this.taskRepository.findByIdsEnriched(taskIds, userId);
    return tasks.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return a.id.localeCompare(b.id);
    });
  }

  async getActionDraft(userId: string, taskId: string): Promise<ActionDraft | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundError("Task not found.");
    }
    return this.actionDraftRepository.findActiveByTaskId(taskId);
  }

  async submitDraftFeedback(
    userId: string,
    taskId: string,
    feedback: SubmitDraftFeedbackInput
  ): Promise<ActionDraftFeedback> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundError("Task not found.");
    }

    const draft = await this.actionDraftRepository.findActiveByTaskId(taskId);
    if (!draft) {
      throw new NotFoundError("No active action draft found for this task.");
    }

    return this.actionDraftRepository.createFeedback({
      draftId: draft.id,
      userId,
      feedbackType: feedback.feedbackType,
      notes: feedback.notes ?? null,
    });
  }

  async updatePriorityScore(
    userId: string,
    taskId: string,
    scoreInput: Omit<TaskPriorityScore, "id" | "userId" | "taskId" | "createdAt" | "updatedAt">,
    triggerEvent: string
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new NotFoundError("Task not found.");
    }

    await this.taskPriorityScoreRepository.updateScoreAndLogHistory(
      {
        taskId,
        userId,
        totalScore: scoreInput.totalScore,
        deadlineProximityScore: scoreInput.deadlineProximityScore,
        dependencyImpactScore: scoreInput.dependencyImpactScore,
        consequenceSeverityScore: scoreInput.consequenceSeverityScore,
        priorityTier: scoreInput.priorityTier,
        scoringVersion: scoreInput.scoringVersion,
        scoredAt: scoreInput.scoredAt,
      },
      triggerEvent
    );
  }
}
