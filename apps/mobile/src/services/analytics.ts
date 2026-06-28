// ─────────────────────────────────────────────────────────────
// LastMinute — Analytics / Telemetry Service
// Lightweight analytics layer for tracking user events,
// screen views, and performance metrics. Provider-agnostic.
// ─────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────

export type AnalyticsEventName =
  | "screen_view"
  | "task_created"
  | "task_completed"
  | "task_started"
  | "goal_created"
  | "habit_logged"
  | "voice_input_started"
  | "voice_input_completed"
  | "focus_block_created"
  | "notification_opened"
  | "ai_recommendation_acted"
  | "ai_recommendation_dismissed"
  | "offline_queue_replayed"
  | "app_opened"
  | "app_backgrounded"
  | "error_occurred";

export interface AnalyticsEvent {
  readonly name: AnalyticsEventName;
  readonly properties?: Record<string, string | number | boolean>;
  readonly timestamp: string;
}

type AnalyticsProvider = (event: AnalyticsEvent) => void;

// ── State ─────────────────────────────────────────────────

const providers: AnalyticsProvider[] = [];
let userId: string | null = null;
let isEnabled = true;

// ── Configuration ─────────────────────────────────────────

/** Registers an analytics provider (e.g. Mixpanel, Amplitude, Sentry). */
export function registerProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}

/** Associates a user identity with future events. */
export function identify(id: string): void {
  userId = id;
}

/** Clears the user identity (on logout). */
export function resetIdentity(): void {
  userId = null;
}

/** Enables or disables analytics tracking globally. */
export function setEnabled(enabled: boolean): void {
  isEnabled = enabled;
}

// ── Tracking API ──────────────────────────────────────────

/** Tracks a named event with optional properties. */
export function track(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean>
): void {
  if (!isEnabled) return;

  const event: AnalyticsEvent = {
    name,
    properties: {
      ...properties,
      ...(userId ? { userId } : {}),
    },
    timestamp: new Date().toISOString(),
  };

  providers.forEach((provider) => {
    try {
      provider(event);
    } catch {
      // Swallow analytics errors — they must never crash the app
    }
  });
}

/** Tracks a screen view. */
export function trackScreenView(screenName: string): void {
  track("screen_view", { screen: screenName });
}

/** Tracks an error occurrence. */
export function trackError(errorMessage: string, context?: string): void {
  track("error_occurred", {
    message: errorMessage,
    ...(context ? { context } : {}),
  });
}

// ── Console Provider (development) ────────────────────────

/** A simple console-based provider for development debugging. */
export const consoleProvider: AnalyticsProvider = (event) => {
  // eslint-disable-next-line no-console
  console.debug(`[Analytics] ${event.name}`, event.properties ?? {});
};
