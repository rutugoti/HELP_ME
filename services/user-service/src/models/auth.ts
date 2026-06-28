// ─────────────────────────────────────────────────────────────
// LastMinute — User Service Auth Models
// ─────────────────────────────────────────────────────────────

import { UserRole } from "@lastminute/types";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenPayload {
  tokenId: string;
  userId: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
  onboardingRequired: boolean;
}
