// ─────────────────────────────────────────────────────────────
// LastMinute — AI Service Configuration Loader
// Validates environment variables on startup per Rule 5.
// ─────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3004),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  RABBITMQ_URL: z.string().url().optional(),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  const errorOutput =
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Invalid environment configuration",
      errors: result.error.format(),
      service: "ai-service",
    }) + "\n";
  process.stderr.write(errorOutput);
  process.exit(1);
}

export const config = {
  env: result.data.NODE_ENV,
  port: result.data.PORT,
  jwtSecret: result.data.JWT_SECRET,
  rabbitmqUrl: result.data.RABBITMQ_URL || null,
};
