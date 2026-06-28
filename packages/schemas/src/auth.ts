// ─────────────────────────────────────────────────────────────
// LastMinute — Auth Schemas
// Validation for: register, login, refresh, logout,
// password reset request, password reset
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import { UserRole } from "@lastminute/types";

/** POST /api/v1/auth/register */
export const registerSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (p) => /[a-zA-Z]/.test(p) && /\d/.test(p),
      "Password must contain at least one letter and one number"
    ),
  fullName: z.string().min(1, "Full name is required").max(255),
  role: z.nativeEnum(UserRole, { message: "Must be a valid role" }),
  timezone: z.string().min(1, "Timezone is required").max(100),
  organizationId: z.string().uuid().optional(),
});

/** POST /api/v1/auth/login */
export const loginSchema = z.object({
  email: z.string().email("Must be a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/** POST /api/v1/auth/refresh */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/** POST /api/v1/auth/password/reset-request */
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Must be a valid email address"),
});

/** POST /api/v1/auth/password/reset */
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine(
      (p) => /[a-zA-Z]/.test(p) && /\d/.test(p),
      "Password must contain at least one letter and one number"
    ),
});

/** Auth tokens response (register + login). */
export const authTokensResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  userId: z.string().uuid(),
  onboardingRequired: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
