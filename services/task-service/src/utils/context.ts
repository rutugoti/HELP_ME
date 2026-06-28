// ─────────────────────────────────────────────────────────────
// LastMinute — AsyncLocalStorage Correlation Context
// Binds request-scoped metadata for logging and audits per Rule 8.
// ─────────────────────────────────────────────────────────────

import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  correlationId: string;
}

export const contextStorage = new AsyncLocalStorage<RequestContext>();

export default contextStorage;
