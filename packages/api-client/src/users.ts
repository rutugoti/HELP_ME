// ─────────────────────────────────────────────────────────────
// LastMinute — User API Functions
// GET/PATCH /api/v1/users/me, preferences, stats
// ─────────────────────────────────────────────────────────────

import type { KyInstance } from "ky";
import type {
  ApiResponse,
  UserPublic,
  UserPreferences,
  UserStats,
} from "@lastminute/types";
import type { UpdateUserInput, UpdatePreferencesInput } from "@lastminute/schemas";

/** Returns the authenticated user's profile. */
export async function getMe(
  client: KyInstance
): Promise<ApiResponse<UserPublic>> {
  return client.get("api/v1/users/me").json();
}

/** Updates user profile fields (partial). */
export async function updateMe(
  client: KyInstance,
  input: UpdateUserInput
): Promise<ApiResponse<UserPublic>> {
  return client.patch("api/v1/users/me", { json: input }).json();
}

/** Returns the full preference object. */
export async function getPreferences(
  client: KyInstance
): Promise<ApiResponse<UserPreferences>> {
  return client.get("api/v1/users/me/preferences").json();
}

/** Replaces the full preference object (not a merge). */
export async function updatePreferences(
  client: KyInstance,
  input: UpdatePreferencesInput
): Promise<ApiResponse<UserPreferences>> {
  return client.put("api/v1/users/me/preferences", { json: input }).json();
}

/** Returns aggregated productivity statistics. */
export async function getStats(
  client: KyInstance
): Promise<ApiResponse<UserStats>> {
  return client.get("api/v1/users/me/stats").json();
}
