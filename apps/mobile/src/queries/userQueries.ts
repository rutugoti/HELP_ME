// ─────────────────────────────────────────────────────────────
// LastMinute — User React Query Definitions
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, unwrapResponse } from "@lastminute/api-client";
import type { UpdateUserInput, UpdatePreferencesInput } from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const userKeys = {
  all: ["user"] as const,
  me: () => [...userKeys.all, "me"] as const,
  preferences: () => [...userKeys.all, "preferences"] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useMeQuery = () =>
  useQuery({
    queryKey: userKeys.me(),
    queryFn: () => unwrapResponse(usersApi.getMe(api)),
  });

export const usePreferencesQuery = () =>
  useQuery({
    queryKey: userKeys.preferences(),
    queryFn: () => unwrapResponse(usersApi.getPreferences(api)),
  });

export const useUserStatsQuery = () =>
  useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => unwrapResponse(usersApi.getStats(api)),
    staleTime: 5 * 60 * 1000,
  });

// ── Mutations ─────────────────────────────────────────────

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateUserInput) => unwrapResponse(usersApi.updateMe(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
};

export const useUpdatePreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) =>
      unwrapResponse(usersApi.updatePreferences(api, input)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.preferences() });
    },
  });
};
