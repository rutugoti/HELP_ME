// ─────────────────────────────────────────────────────────────
// LastMinute — useHabits Hook
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@lastminute/api-client";
import { api } from "../services/api";
import { LogHabitInput } from "@lastminute/schemas";

export const useHabits = () => {
  const queryClient = useQueryClient();

  // List habits query
  const {
    data: habitsRes,
    isLoading: isLoadingHabits,
    refetch: refetchHabits,
    error: habitsError,
  } = useQuery({
    queryKey: ["habits"],
    queryFn: () => goalsApi.getHabits(api),
  });

  const habits = habitsRes?.status === "success" ? habitsRes.data : [];

  // Log habit completion mutation
  const logHabitMutation = useMutation({
    mutationFn: ({ habitCategory, input }: { habitCategory: string; input?: LogHabitInput }) =>
      goalsApi.logHabit(api, habitCategory, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  return {
    habits,
    isLoadingHabits,
    habitsError,
    refetchHabits,
    logHabit: async (habitCategory: string, input?: LogHabitInput) => {
      await logHabitMutation.mutateAsync({ habitCategory, input });
    },
    isLoggingHabit: logHabitMutation.isPending,
  };
};
