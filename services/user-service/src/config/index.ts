// ─────────────────────────────────────────────────────────────
// LastMinute — User Service Config
// Validates environment variables at application startup per Rule 5.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Banned console.log: Rule 8 says console.log, console.error are banned.
  // Wait! Rule 8 allows throwing errors or writing to a structured logger.
  // Since we haven't loaded the logger yet and this is application startup validation,
  // we will throw a fatal error.
  throw new Error(
    `Configuration validation failed:\n${JSON.stringify(
      parsed.error.flatten().fieldErrors,
      null,
      2
    )}`
  );
}

export const config = {
  port: parsed.data.PORT,
  env: parsed.data.NODE_ENV,
  jwt: {
    secret: parsed.data.JWT_SECRET,
    refreshSecret: parsed.data.JWT_REFRESH_SECRET,
    accessExpiry: "15m", // Access tokens expire in 15 minutes
    refreshExpiry: "30d", // Refresh tokens expire in 30 days
  },
  db: {
    host: parsed.data.DB_HOST,
    port: parsed.data.DB_PORT,
    database: parsed.data.DB_NAME,
    user: parsed.data.DB_USER,
    password: parsed.data.DB_PASSWORD,
  },
};

export default config;
