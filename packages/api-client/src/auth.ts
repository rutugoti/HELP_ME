// ─────────────────────────────────────────────────────────────
// LastMinute — Auth API Functions
// POST /api/v1/auth/*
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type { ApiResponse, AuthTokens } from "@lastminute/types";
import type { RegisterInput, LoginInput, PasswordResetInput } from "@lastminute/schemas";

/** Registers a new user account. Returns JWT tokens. */
export async function register(
  client: KyInstance,
  input: RegisterInput
): Promise<ApiResponse<AuthTokens>> {
  return client.post("api/v1/auth/register", { json: input }).json();
}

/** Authenticates an existing user. Returns new JWT tokens. */
export async function login(
  client: KyInstance,
  input: LoginInput
): Promise<ApiResponse<AuthTokens>> {
  return client.post("api/v1/auth/login", { json: input }).json();
}

/** Issues a new access token using a valid refresh token. */
export async function refreshToken(
  client: KyInstance,
  token: string
): Promise<ApiResponse<AuthTokens>> {
  return client.post("api/v1/auth/refresh", { json: { refreshToken: token } }).json();
}

/** Invalidates the current refresh token. */
export async function logout(client: KyInstance): Promise<void> {
  await client.post("api/v1/auth/logout");
}

/** Sends a password reset link to the provided email. */
export async function requestPasswordReset(client: KyInstance, email: string): Promise<void> {
  await client.post("api/v1/auth/password/reset-request", {
    json: { email },
  });
}

/** Resets password using a reset token. */
export async function resetPassword(client: KyInstance, input: PasswordResetInput): Promise<void> {
  await client.post("api/v1/auth/password/reset", { json: input });
}
