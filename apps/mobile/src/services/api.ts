// ─────────────────────────────────────────────────────────────
// LastMinute — API Client Instance for Mobile
// ─────────────────────────────────────────────────────────────

import { createApiClient } from "@lastminute/api-client";
import { useAuthStore } from "../store/authStore";
import { config } from "../constants/config";
import * as authApi from "@lastminute/api-client/src/auth"; // Import individual auth methods

export const api = createApiClient({
  baseUrl: config.apiBaseUrl,
  getAccessToken: async () => {
    return useAuthStore.getState().accessToken;
  },
  onUnauthorized: async () => {
    const { refreshToken, logout, setAuth } = useAuthStore.getState();
    if (!refreshToken) {
      await logout();
      return;
    }

    try {
      // Create a temporary client without auth headers to call refresh endpoint
      const tempClient = createApiClient({
        baseUrl: config.apiBaseUrl,
        getAccessToken: async () => null,
      });

      const response = await authApi.refreshToken(tempClient, refreshToken);
      if (response.status === "success") {
        const tokens = response.data;
        // In a real app we might fetch the user profile here, but we will seed user info from existing store user.
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          await setAuth(
            currentUser,
            tokens.accessToken,
            tokens.refreshToken,
            tokens.onboardingRequired
          );
        } else {
          await logout();
        }
      } else {
        await logout();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API token refresh failed:", error);
      await logout();
    }
  },
});
export default api;
