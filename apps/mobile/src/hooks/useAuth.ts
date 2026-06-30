// ─────────────────────────────────────────────────────────────
// LastMinute — useAuth Custom Hook
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { api } from "../services/api";
import * as authApi from "@lastminute/api-client/src/auth";
import * as usersApi from "@lastminute/api-client/src/users";
import { LoginInput, RegisterInput, UpdatePreferencesInput } from "@lastminute/schemas";

export const useAuth = () => {
  const {
    user,
    accessToken,
    isLoading,
    onboardingRequired,
    setAuth,
    logout: storeLogout,
    setOnboardingRequired,
    updateUser,
  } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async (input: LoginInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await authApi.login(api, input);
      if (response.status === "success") {
        const tokens = response.data;
        // Temporarily set tokens in store so getMe request can read them
        useAuthStore.setState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        try {
          // Fetch current user details after logging in
          const userResponse = await usersApi.getMe(api);
          if (userResponse.status === "success") {
            await setAuth(
              userResponse.data,
              tokens.accessToken,
              tokens.refreshToken,
              tokens.onboardingRequired
            );
          } else {
            useAuthStore.setState({ accessToken: null, refreshToken: null });
            setError("Failed to load user profile details.");
          }
        } catch (fetchErr) {
          useAuthStore.setState({ accessToken: null, refreshToken: null });
          throw fetchErr;
        }
      } else {
        setError((response.data as unknown as string) || "Invalid credentials");
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to authenticate. Please try again.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (input: RegisterInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await authApi.register(api, input);
      if (response.status === "success") {
        const tokens = response.data;
        // Temporarily set tokens in store so getMe request can read them
        useAuthStore.setState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });

        try {
          // Fetch user info for recently created account
          const userResponse = await usersApi.getMe(api);
          if (userResponse.status === "success") {
            await setAuth(
              userResponse.data,
              tokens.accessToken,
              tokens.refreshToken,
              tokens.onboardingRequired
            );
          } else {
            useAuthStore.setState({ accessToken: null, refreshToken: null });
            setError("Account created, but failed to fetch user details.");
          }
        } catch (fetchErr) {
          useAuthStore.setState({ accessToken: null, refreshToken: null });
          throw fetchErr;
        }
      } else {
        setError((response.data as unknown as string) || "Registration failed");
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    setIsSubmitting(true);
    try {
      await authApi.logout(api).catch(() => {}); // Try calling API logout but proceed anyway
    } finally {
      await storeLogout();
      setIsSubmitting(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await authApi.requestPasswordReset(api, email);
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Password reset request failed.";
      setError(errMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async (preferences: UpdatePreferencesInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await usersApi.updatePreferences(api, preferences);
      if (response.status === "success") {
        setOnboardingRequired(false);
        return true;
      } else {
        setError((response.data as unknown as string) || "Failed to save preferences.");
        return false;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update preferences.";
      setError(errMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProfile = (profileData: { fullName?: string; timezone?: string }) => {
    updateUser(profileData);
  };

  return {
    user,
    accessToken,
    isLoading: isLoading || isSubmitting,
    isAuthenticated: !!accessToken,
    onboardingRequired,
    error,
    login,
    register,
    logout,
    requestPasswordReset,
    completeOnboarding,
    updateProfile,
    setError,
  };
};
