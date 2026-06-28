// ─────────────────────────────────────────────────────────────
// LastMinute — UI Zustand Store
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";

interface UIState {
  notificationOverlayVisible: boolean;
  globalLoading: boolean;
  showNotificationOverlay: (visible: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  notificationOverlayVisible: false,
  globalLoading: false,

  showNotificationOverlay: (visible) => set({ notificationOverlayVisible: visible }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
