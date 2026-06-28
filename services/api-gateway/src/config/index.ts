// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Configuration Loader
// Validates environment variables on startup per Rule 5.
// ─────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),

  // Downstream service URLs
  USER_SERVICE_URL: z.string().url().default("http://localhost:3001"),
  TASK_SERVICE_URL: z.string().url().default("http://localhost:3002"),
  CALENDAR_SERVICE_URL: z.string().url().default("http://localhost:3003"),
  AI_SERVICE_URL: z.string().url().default("http://localhost:3004"),
  NOTIFICATION_SERVICE_URL: z.string().url().default("http://localhost:3005"),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  REDIS_URL: z.string().url().optional(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  const errorOutput =
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Invalid environment configuration",
      errors: result.error.format(),
      service: "api-gateway",
    }) + "\n";
  process.stderr.write(errorOutput);
  process.exit(1);
}

export const config = {
  env: result.data.NODE_ENV,
  port: result.data.PORT,
  jwtSecret: result.data.JWT_SECRET,
  services: {
    userService: result.data.USER_SERVICE_URL,
    taskService: result.data.TASK_SERVICE_URL,
    calendarService: result.data.CALENDAR_SERVICE_URL,
    aiService: result.data.AI_SERVICE_URL,
    notificationService: result.data.NOTIFICATION_SERVICE_URL,
  },
  rateLimit: {
    windowMs: result.data.RATE_LIMIT_WINDOW_MS,
    maxRequests: result.data.RATE_LIMIT_MAX_REQUESTS,
  },
  redisUrl: result.data.REDIS_URL || null,
};
