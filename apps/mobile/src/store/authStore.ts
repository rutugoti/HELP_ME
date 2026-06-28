// ─────────────────────────────────────────────────────────────
// LastMinute — Auth Zustand Store
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { UserPublic } from "@lastminute/types";
import { config } from "../constants/config";

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  onboardingRequired: boolean;

  // Actions
  setAuth: (
    user: UserPublic,
    accessToken: string,
    refreshToken: string,
    onboardingRequired: boolean
  ) => Promise<void>;
  updateUser: (user: Partial<UserPublic>) => void;
  logout: () => Promise<void>;
  setOnboardingRequired: (required: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isInitialized: false,
  onboardingRequired: false,

  setAuth: async (user, accessToken, refreshToken, onboardingRequired) => {
    set({ isLoading: true });
    try {
      await SecureStore.setItemAsync(config.tokenStorageKey, accessToken);
      await SecureStore.setItemAsync(config.refreshTokenStorageKey, refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        onboardingRequired,
        isLoading: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save auth credentials securely:", error);
      set({ isLoading: false });
    }
  },

  updateUser: (updatedFields) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updatedFields } : null,
    }));
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync(config.tokenStorageKey);
      await SecureStore.deleteItemAsync(config.refreshTokenStorageKey);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        onboardingRequired: false,
        isLoading: false,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to clear secure auth credentials:", error);
      set({ isLoading: false });
    }
  },

  setOnboardingRequired: (required) => {
    set({ onboardingRequired: required });
  },

  initialize: async () => {
    if (get().isInitialized) return;
    try {
      const accessToken = await SecureStore.getItemAsync(config.tokenStorageKey);
      const refreshToken = await SecureStore.getItemAsync(config.refreshTokenStorageKey);

      if (accessToken && refreshToken) {
        // In a real app we might verify this token or fetch the user profile from GET /api/v1/users/me.
        // For now, we seed a default/parsed state or fetch from local storage if needed.
        // We will seed a mock user or empty user shell which gets refreshed by the app.
        // Let's set loading to false but keep user details.
        // We can fetch user profile inside useAuth hook or an init effect.
        set({ accessToken, refreshToken, isInitialized: true, isLoading: false });
      } else {
        set({ isInitialized: true, isLoading: false });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to initialize auth store:", error);
      set({ isInitialized: true, isLoading: false });
    }
  },
}));
