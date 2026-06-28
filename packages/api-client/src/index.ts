// ─────────────────────────────────────────────────────────────
// LastMinute — @lastminute/api-client barrel export
// ─────────────────────────────────────────────────────────────

// Core client factory and helpers
export { createApiClient, unwrapResponse, unwrapListResponse, toSearchParams } from "./client.js";
export type { ApiClientConfig } from "./client.js";

// Auth endpoints
export * as authApi from "./auth.js";

// User endpoints
export * as usersApi from "./users.js";

// Task endpoints
export * as tasksApi from "./tasks.js";

// Calendar endpoints
export * as calendarApi from "./calendar.js";

// AI endpoints
export * as aiApi from "./ai.js";

// Notification endpoints
export * as notificationsApi from "./notifications.js";

// Goals & Habits endpoints
export * as goalsApi from "./goals.js";
