// ─────────────────────────────────────────────────────────────
// LastMinute — API Gateway Rate Limiter Middleware
// Redis-backed rate limiting with fallback to in-memory sliding window.
// ─────────────────────────────────────────────────────────────

import type { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Fallback Store
// ─────────────────────────────────────────────────────────────
const memoryStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) {
      memoryStore.delete(key);
    }
  }
}, 60000);

// ─────────────────────────────────────────────────────────────
// Redis Client Setup
// ─────────────────────────────────────────────────────────────
let redisClient: Redis | null = null;

if (config.redisUrl) {
  try {
    logger.info("Initializing Redis for Rate Limiter...", { url: config.redisUrl });
    redisClient = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });
    redisClient.on("error", (err) => {
      logger.error("Redis Connection Error, rate limiter falling back to memory mode", {
        error: err.message,
      });
    });
  } catch (err) {
    logger.error("Failed to construct Redis client", { error: (err as Error).message });
  }
}

/**
 * Per-IP rate limiter using either a shared Redis instance or local memory.
 */
export async function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  const identifier = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();

  let count = 0;
  let resetAt = 0;
  let isRedisLimiting = false;

  if (redisClient && redisClient.status === "ready") {
    try {
      const key = `ratelimit:${identifier}`;
      const results = await redisClient.multi().incr(key).ttl(key).exec();

      if (results && results[0] && results[1]) {
        const [incrErr, incrResult] = results[0];
        const [ttlErr, ttlResult] = results[1];

        if (!incrErr && !ttlErr) {
          count = Number(incrResult);
          const ttl = Number(ttlResult);

          if (count === 1 || ttl === -1) {
            // Set expiration on first hit or if expired key had no TTL
            const expireSec = Math.ceil(config.rateLimit.windowMs / 1000);
            await redisClient.expire(key, expireSec);
            resetAt = now + config.rateLimit.windowMs;
          } else {
            resetAt = now + ttl * 1000;
          }
          isRedisLimiting = true;
        }
      }
    } catch (err) {
      logger.warn("Redis Rate Limiter failed, using memory fallback", {
        error: (err as Error).message,
      });
    }
  }

  // Local memory fallback if Redis is not configured, is down, or failed
  if (!isRedisLimiting) {
    let entry = memoryStore.get(identifier);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 1,
        resetAt: now + config.rateLimit.windowMs,
      };
      memoryStore.set(identifier, entry);
    } else {
      entry.count++;
    }

    count = entry.count;
    resetAt = entry.resetAt;
  }

  // Set standard rate limit response headers
  const remaining = Math.max(0, config.rateLimit.maxRequests - count);
  res.setHeader("X-RateLimit-Limit", config.rateLimit.maxRequests);
  res.setHeader("X-RateLimit-Remaining", remaining);
  res.setHeader("X-RateLimit-Reset", Math.ceil(resetAt / 1000));

  if (count > config.rateLimit.maxRequests) {
    logger.warn("Rate limit exceeded", {
      identifier,
      count,
      limit: config.rateLimit.maxRequests,
      path: req.path,
      mode: isRedisLimiting ? "redis" : "memory",
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

/**
 * Closes Redis connection gracefully on gateway exit.
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    logger.info("Closing Redis rate limiter connection...");
    await redisClient.quit();
  }
}
