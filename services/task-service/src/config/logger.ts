// ─────────────────────────────────────────────────────────────
// LastMinute — Task Service Structured Logger
// Formats and outputs structured JSON logs directly to stdout/stderr (Rule 8 compliant).
// ─────────────────────────────────────────────────────────────

import { contextStorage } from "../utils/context.js";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const store = contextStorage.getStore();
  const correlationId = store?.correlationId;

  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...context,
  };

  const output = JSON.stringify(payload) + "\n";

  // Use process.stdout/stderr directly to bypass banned console methods (Rule 8)
  if (level === "error") {
    process.stderr.write(output);
  } else {
    process.stdout.write(output);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
};

export default logger;
