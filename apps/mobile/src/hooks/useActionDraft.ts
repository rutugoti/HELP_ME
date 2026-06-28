// ─────────────────────────────────────────────────────────────
// LastMinute — useActionDraft Custom Hook
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@lastminute/api-client";
import { api } from "../services/api";
import { UUID, FeedbackType } from "@lastminute/types";

export const useActionDraft = (taskId: UUID) => {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["actionDraft", taskId],
    queryFn: async () => {
      const res = await tasksApi.getActionDraft(api, taskId);
      return res;
    },
    // If the API returns 202 (e.g. generating or empty data), poll every 3 seconds
    refetchInterval: (query) => {
      const res = query.state.data;
      if (res && res.status === "success" && !res.data) {
        // If data is null or is pending creation, poll
        return 3000;
      }
      return false;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (input: { feedbackType: FeedbackType; notes?: string }) =>
      tasksApi.submitActionFeedback(api, taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionDraft", taskId] });
    },
  });

  const isGenerating = response?.status === "success" && !response.data;
  const draft = response?.status === "success" ? response.data : null;

  return {
    draft,
    isLoading,
    isGenerating,
    error,
    refetch,
    submitFeedback: feedbackMutation.mutateAsync,
    isSubmittingFeedback: feedbackMutation.isPending,
  };
};
