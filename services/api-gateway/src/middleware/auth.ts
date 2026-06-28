// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway JWT Authentication Middleware
// Establishes correlation ID and verifies JWT on every request per Architecture.md.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * JWT authentication middleware for the API Gateway.
 * Public paths (health, webhooks) should be excluded before this middleware.
 */
export function gatewayAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or malformed Authorization header.",
        details: null,
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Bearer token is empty.",
        details: null,
      },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    // Forward user identity to downstream services
    req.headers["x-user-id"] = payload.userId;
    req.headers["x-user-email"] = payload.email;
    next();
  } catch {
    logger.warn("JWT verification failed at gateway", { path: req.path });
    res.status(401).json({
      status: "error",
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired access token.",
        details: null,
      },
    });
  }
}
