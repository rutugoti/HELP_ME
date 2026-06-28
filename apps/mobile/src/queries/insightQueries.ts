// ─────────────────────────────────────────────────────────────
// LastMinute — Insight / AI React Query Definitions
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi, unwrapResponse } from "@lastminute/api-client";
import type { UUID } from "@lastminute/types";
import type { SimulateTaskInput } from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const insightKeys = {
  all: ["insights"] as const,
  behavioralInsights: () => [...insightKeys.all, "behavioral"] as const,
  recommendations: () => [...insightKeys.all, "recommendations"] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useBehavioralInsightsQuery = () =>
  useQuery({
    queryKey: insightKeys.behavioralInsights(),
    queryFn: () => unwrapResponse(aiApi.getInsights(api)),
    staleTime: 5 * 60 * 1000, // Consider stale after 5 minutes
  });

export const useRecommendationsQuery = () =>
  useQuery({
    queryKey: insightKeys.recommendations(),
    queryFn: () => unwrapResponse(aiApi.getRecommendations(api)),
    staleTime: 2 * 60 * 1000,
  });

// ── Mutations ─────────────────────────────────────────────

export const useTriggerPrioritizeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrapResponse(aiApi.triggerPrioritize(api)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
  });
};

export const useDismissRecommendationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recommendationId: UUID) => aiApi.dismissRecommendation(api, recommendationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightKeys.recommendations() });
    },
  });
};

export const useSimulateTaskMutation = () =>
  useMutation({
    mutationFn: (input: SimulateTaskInput) => unwrapResponse(aiApi.simulateTask(api, input)),
  });
