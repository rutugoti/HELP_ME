// ─────────────────────────────────────────────────────────────
// LastMinute — Notification React Query Definitions
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@lastminute/api-client";
import type { UUID } from "@lastminute/types";
import type { UpdateNotificationPreferencesInput } from "@lastminute/schemas";
import { api } from "../services/api";

// ── Query Keys ────────────────────────────────────────────

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

// ── Queries ───────────────────────────────────────────────

export const useNotificationsListQuery = () =>
  useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const res = await notificationsApi.getNotifications(api);
      if (res.status === "success") return res.data;
      throw new Error("Failed to fetch notifications");
    },
    refetchInterval: 30_000, // Poll every 30 seconds
  });

// ── Mutations ─────────────────────────────────────────────

export const useMarkReadMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: UUID) => notificationsApi.markRead(api, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

export const useMarkActedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: UUID) => notificationsApi.markActed(api, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      notificationsApi.updateNotificationPreferences(api, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.preferences() });
    },
  });
};
