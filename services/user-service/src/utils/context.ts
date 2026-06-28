// ─────────────────────────────────────────────────────────────
// LastMinute — Request Context Management
// Uses AsyncLocalStorage to propagate request-specific metadata
// like Correlation ID across asynchronous call chains per Rule 8.
// ─────────────────────────────────────────────────────────────

import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  correlationId: string;
}

export const contextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Retrieves the correlation ID from the current async execution context.
 */
export function getCorrelationId(): string | undefined {
  return contextStorage.getStore()?.correlationId;
}
