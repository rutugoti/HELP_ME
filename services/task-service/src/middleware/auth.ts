// ─────────────────────────────────────────────────────────────
// LastMinute — Authentication Middleware
// Verifies JWT token and injects the user details into request.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { UnauthenticatedError } from "../utils/errors.js";
import type { UserRole } from "@lastminute/types";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization");

  if (!authHeader) {
    throw new UnauthenticatedError("Authorization header is missing.");
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") {
    throw new UnauthenticatedError("Authorization format must be 'Bearer <token>'.");
  }

  const token = parts[1]!;

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AccessTokenPayload;

    // Inject user identity
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch {
    throw new UnauthenticatedError("Token is invalid or has expired.");
  }
}
