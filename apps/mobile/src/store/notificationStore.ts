// ─────────────────────────────────────────────────────────────
// LastMinute — Notification Zustand Store
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { Notification, NotificationStatus, UUID } from "@lastminute/types";
import { api } from "../services/api";
import { notificationsApi } from "@lastminute/api-client";

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: UUID) => Promise<void>;
  markAsActed: (notificationId: UUID) => Promise<void>;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationsApi.getNotifications(api);
      if (response.status === "success") {
        set({ notifications: response.data, isLoading: false });
      } else {
        set({
          error: (response.data as unknown as string) || "Failed to fetch notifications",
          isLoading: false,
        });
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An error occurred while fetching notifications";
      set({ error: errMsg, isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await notificationsApi.markRead(api, notificationId);
      const updated = get().notifications.map((n) =>
        n.id === notificationId
          ? ({
              ...n,
              status: NotificationStatus.Read,
              readAt: new Date().toISOString(),
            } as Notification)
          : n
      );
      set({ notifications: updated });
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An error occurred while marking notification as read";
      set({ error: errMsg });
    }
  },

  markAsActed: async (notificationId) => {
    try {
      await notificationsApi.markActed(api, notificationId);
      const updated = get().notifications.map((n) =>
        n.id === notificationId
          ? ({
              ...n,
              status: NotificationStatus.ActedOn,
              actedAt: new Date().toISOString(),
            } as Notification)
          : n
      );
      set({ notifications: updated });
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "An error occurred while marking notification as acted";
      set({ error: errMsg });
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => n.status === NotificationStatus.Delivered).length;
  },
}));
