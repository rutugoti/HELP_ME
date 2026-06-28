// ─────────────────────────────────────────────────────────────
// LastMinute — useNotifications Hook
// ─────────────────────────────────────────────────────────────

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "../store/notificationStore";
import { notificationsApi } from "@lastminute/api-client";
import { api } from "../services/api";
import { UpdateNotificationPreferencesInput } from "@lastminute/types";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAsActed,
    getUnreadCount,
  } = useNotificationStore();

  // Mutation to update notification channel preferences
  const updatePrefsMutation = useMutation({
    mutationFn: (input: UpdateNotificationPreferencesInput) =>
      notificationsApi.updateNotificationPreferences(api, input),
    onSuccess: () => {
      // Invalidate user preferences queries if any
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
    },
  });

  return {
    notifications,
    isLoading,
    error,
    unreadCount: getUnreadCount(),
    fetchNotifications,
    markAsRead,
    markAsActed,
    updatePreferences: async (input: UpdateNotificationPreferencesInput) => {
      await updatePrefsMutation.mutateAsync(input);
    },
    isUpdatingPreferences: updatePrefsMutation.isPending,
  };
};
