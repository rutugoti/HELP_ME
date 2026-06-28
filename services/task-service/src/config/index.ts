// ─────────────────────────────────────────────────────────────
// LastMinute — Task Service Config
// Validates environment variables at application startup per Rule 5.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
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
