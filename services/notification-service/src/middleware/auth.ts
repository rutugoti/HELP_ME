// ─────────────────────────────────────────────────────────────
// LastMinute — Authentication JWT Middleware
// Verifies bearer JWT token against environment config.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { UnauthorizedError } from "../utils/errors.js";

interface TokenPayload {
  userId: string;
  email: string;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new UnauthorizedError("Missing or malformed Authorization header."));
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    next(new UnauthorizedError("Bearer token is empty."));
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token."));
  }
}
