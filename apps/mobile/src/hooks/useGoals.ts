// ─────────────────────────────────────────────────────────────
// LastMinute — useGoals Hook
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@lastminute/api-client";
import { api } from "../services/api";
import { UUID, GoalMilestone, GoalStatus, Goal, ApiResponse } from "@lastminute/types";
import { CreateGoalInput } from "@lastminute/schemas";

export const useGoals = () => {
  const queryClient = useQueryClient();

  // List goals query
  const {
    data: goalsRes,
    isLoading: isLoadingGoals,
    refetch: refetchGoals,
    error: goalsError,
  } = useQuery({
    queryKey: ["goals"],
    queryFn: () => goalsApi.getGoals(api),
  });

  const goals = goalsRes?.status === "success" ? goalsRes.data : [];

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsApi.createGoal(api, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation<
    ApiResponse<Goal>,
    Error,
    { goalId: UUID; input: Partial<CreateGoalInput & { status: GoalStatus }> }
  >({
    mutationFn: ({ goalId, input }) => goalsApi.updateGoal(api, goalId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: UUID) => goalsApi.deleteGoal(api, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  // Toggle milestone status mutation
  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, isCompleted }: { milestoneId: UUID; isCompleted: boolean }) =>
      goalsApi.toggleMilestone(api, milestoneId, isCompleted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["milestones"] });
    },
  });

  // Manual milestone fetch or reactive query helper
  const fetchMilestones = async (goalId: UUID): Promise<GoalMilestone[]> => {
    const res = await goalsApi.getMilestones(api, goalId);
    if (res.status === "success") {
      return res.data;
    }
    throw new Error("Failed to fetch milestones");
  };

  return {
    goals,
    isLoadingGoals,
    goalsError,
    refetchGoals,
    createGoal: async (input: CreateGoalInput) => {
      const res = await createGoalMutation.mutateAsync(input);
      if (res.status === "success") {
        return res.data;
      }
      throw new Error("Failed to create goal");
    },
    isCreatingGoal: createGoalMutation.isPending,
    updateGoal: async (goalId: UUID, input: Partial<CreateGoalInput & { status: GoalStatus }>) => {
      const res = await updateGoalMutation.mutateAsync({ goalId, input });
      if (res.status === "success") {
        return res.data;
      }
      throw new Error("Failed to update goal");
    },
    isUpdatingGoal: updateGoalMutation.isPending,
    deleteGoal: async (goalId: UUID) => {
      await deleteGoalMutation.mutateAsync(goalId);
    },
    isDeletingGoal: deleteGoalMutation.isPending,
    toggleMilestone: async (milestoneId: UUID, isCompleted: boolean) => {
      await toggleMilestoneMutation.mutateAsync({ milestoneId, isCompleted });
    },
    isTogglingMilestone: toggleMilestoneMutation.isPending,
    getMilestones: fetchMilestones,
  };
};
