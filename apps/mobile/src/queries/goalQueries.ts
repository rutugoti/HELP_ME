// ─────────────────────────────────────────────────────────────
// LastMinute — Goal & Habit React Query Definitions
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi, unwrapResponse } from "@lastminute/api-client";
import type { UUID } from "@lastminute/types";
import type { CreateGoalInput, LogHabitInput } from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const goalKeys = {
  all: ["goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
  detail: (id: UUID) => [...goalKeys.all, "detail", id] as const,
  milestones: (id: UUID) => [...goalKeys.all, "milestones", id] as const,
  habits: () => ["habits"] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useGoalsListQuery = () =>
  useQuery({
    queryKey: goalKeys.lists(),
    queryFn: () => unwrapResponse(goalsApi.getGoals(api)),
  });

export const useMilestonesQuery = (goalId: UUID) =>
  useQuery({
    queryKey: goalKeys.milestones(goalId),
    queryFn: () => unwrapResponse(goalsApi.getMilestones(api, goalId)),
    enabled: !!goalId,
  });

export const useHabitsQuery = () =>
  useQuery({
    queryKey: goalKeys.habits(),
    queryFn: () => unwrapResponse(goalsApi.getHabits(api)),
  });

// ── Mutations ─────────────────────────────────────────────

export const useCreateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) => unwrapResponse(goalsApi.createGoal(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

export const useUpdateGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, input }: { goalId: UUID; input: Partial<CreateGoalInput> }) =>
      unwrapResponse(goalsApi.updateGoal(api, goalId, input)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(variables.goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

export const useDeleteGoalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: UUID) => goalsApi.deleteGoal(api, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

export const useToggleMilestoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ milestoneId, isCompleted }: { milestoneId: UUID; isCompleted: boolean }) =>
      goalsApi.toggleMilestone(api, milestoneId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
};

export const useLogHabitMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, input }: { category: string; input?: LogHabitInput }) =>
      goalsApi.logHabit(api, category, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.habits() });
    },
  });
};
