// ─────────────────────────────────────────────────────────────
// LastMinute — User Service Logger
// Structured logging to process.stdout/stderr per Rule 8.
// Direct console.log/console.error calls are banned.
// ─────────────────────────────────────────────────────────────

import { getCorrelationId } from "../utils/context.js";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}

function writeLog(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId: getCorrelationId(),
    context,
  };

  const output = JSON.stringify(payload) + "\n";

  if (level === "error" || level === "warn") {
    process.stderr.write(output);
  } else {
    process.stdout.write(output);
  }
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    writeLog("debug", message, context);
  },
  info(message: string, context?: Record<string, unknown>) {
    writeLog("info", message, context);
  },
  warn(message: string, context?: Record<string, unknown>) {
    writeLog("warn", message, context);
  },
  error(message: string, context?: Record<string, unknown>) {
    writeLog("error", message, context);
  },
};

export default logger;
