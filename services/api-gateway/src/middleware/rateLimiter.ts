// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Rate Limiter Middleware
// In-memory sliding window rate limiter per Rule 8.
// Limits are defined in configuration and are not hardcoded.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60000);

/**
 * Per-IP rate limiter using a fixed window algorithm.
 * Window size and max requests are configurable via environment variables.
 */
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const identifier = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    entry = {
      count: 1,
      resetAt: now + config.rateLimit.windowMs,
    };
    store.set(identifier, entry);
  } else {
    entry.count++;
  }

  // Set standard rate limit response headers
  const remaining = Math.max(0, config.rateLimit.maxRequests - entry.count);
  res.setHeader("X-RateLimit-Limit", config.rateLimit.maxRequests);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

  if (entry.count > config.rateLimit.maxRequests) {
    logger.warn("Rate limit exceeded", {
      identifier,
      count: entry.count,
      limit: config.rateLimit.maxRequests,
      path: req.path,
    });

    res.status(429).json({
      status: "error",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
        details: null,
      },
    });
    return;
  }

  next();
}
