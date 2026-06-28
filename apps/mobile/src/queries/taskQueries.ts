// ─────────────────────────────────────────────────────────────
// LastMinute — Task React Query Definitions
// Centralised query keys, query functions, and mutations
// for the Tasks domain.
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, unwrapResponse } from "@lastminute/api-client";
import type { UUID } from "@lastminute/types";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskListQuery,
  ActionDraftFeedbackInput,
} from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (query?: TaskListQuery) => [...taskKeys.lists(), query] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: UUID) => [...taskKeys.details(), id] as const,
  actionDraft: (id: UUID) => [...taskKeys.all, "action", id] as const,
  dependencies: (id: UUID) => [...taskKeys.all, "dependencies", id] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useTaskListQuery = (query?: TaskListQuery) =>
  useQuery({
    queryKey: taskKeys.list(query),
    queryFn: () => unwrapResponse(tasksApi.listTasks(api, query)),
  });

export const useTaskDetailQuery = (taskId: UUID) =>
  useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => unwrapResponse(tasksApi.getTask(api, taskId)),
    enabled: !!taskId,
  });

export const useActionDraftQuery = (taskId: UUID) =>
  useQuery({
    queryKey: taskKeys.actionDraft(taskId),
    queryFn: () => unwrapResponse(tasksApi.getActionDraft(api, taskId)),
    enabled: !!taskId,
  });

export const useTaskDependenciesQuery = (taskId: UUID) =>
  useQuery({
    queryKey: taskKeys.dependencies(taskId),
    queryFn: () => unwrapResponse(tasksApi.getTaskDependencies(api, taskId)),
    enabled: !!taskId,
  });

// ── Mutations ─────────────────────────────────────────────

export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => unwrapResponse(tasksApi.createTask(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: UUID; input: UpdateTaskInput }) =>
      unwrapResponse(tasksApi.updateTask(api, taskId, input)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useStartTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: UUID) => unwrapResponse(tasksApi.startTask(api, taskId)),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: UUID) => unwrapResponse(tasksApi.completeTask(api, taskId)),
    onSuccess: (_data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: UUID) => tasksApi.deleteTask(api, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};

export const useSubmitActionFeedbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, input }: { taskId: UUID; input: ActionDraftFeedbackInput }) =>
      tasksApi.submitActionFeedback(api, taskId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.actionDraft(variables.taskId) });
    },
  });
};

export const useBulkPrioritizeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskIds: UUID[]) => unwrapResponse(tasksApi.bulkPrioritize(api, taskIds)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
};
