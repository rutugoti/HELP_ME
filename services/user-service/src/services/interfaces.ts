// ─────────────────────────────────────────────────────────────
// LastMinute — User Service Interfaces
// Decouples controllers from concrete business logic implementations per Rule 2.
// ─────────────────────────────────────────────────────────────

import type {
  AuthTokens,
  CreateUserInput,
  UpdatePreferencesInput,
  UpdateUserInput,
  UserPreferences,
  UserPublic,
  UserStats,
} from "@lastminute/types";

export interface IAuthService {
  register(input: CreateUserInput): Promise<AuthTokens>;
  login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthTokens>;
  refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthTokens>;
  logout(refreshToken: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

export interface IUserService {
  getProfile(userId: string): Promise<UserPublic>;
  updateProfile(userId: string, input: UpdateUserInput): Promise<UserPublic>;
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, input: UpdatePreferencesInput): Promise<UserPreferences>;
  getStats(userId: string): Promise<UserStats>;
}
