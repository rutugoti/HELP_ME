// ─────────────────────────────────────────────────────────────
// LastMinute — Mobile App Config Constants
// ─────────────────────────────────────────────────────────────

import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const config = {
  apiBaseUrl: (extra.apiBaseUrl as string) || "http://localhost:3000",
  wsUrl: (extra.wsUrl as string) || "ws://localhost:3000",
  requestTimeoutMs: 15000,
  tokenStorageKey: "lastminute_auth_token",
  refreshTokenStorageKey: "lastminute_refresh_token",
  preferencesStorageKey: "lastminute_user_preferences",
  offlineQueueStorageKey: "lastminute_offline_queue",
} as const;

export type AppConfig = typeof config;
