// ─────────────────────────────────────────────────────────────
// LastMinute — Calendar Service Configuration Loader
// Validates environment variables on startup per Rule 5.
// ─────────────────────────────────────────────────────────────

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3003),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  const errorOutput =
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message: "Invalid environment configuration",
      errors: result.error.format(),
      service: "calendar-service",
    }) + "\n";
  process.stderr.write(errorOutput);
  process.exit(1);
}

export const config = {
  env: result.data.NODE_ENV,
  port: result.data.PORT,
  jwtSecret: result.data.JWT_SECRET,
};
