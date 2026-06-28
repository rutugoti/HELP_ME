// ─────────────────────────────────────────────────────────────
// LastMinute — AsyncLocalStorage Request Tracing Context
// Manages thread-local correlation context per Rule 8.
// ─────────────────────────────────────────────────────────────

import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  correlationId: string;
}

export const contextStore = new AsyncLocalStorage<RequestContext>();

export function getCorrelationId(): string | undefined {
  const store = contextStore.getStore();
  return store?.correlationId;
}
