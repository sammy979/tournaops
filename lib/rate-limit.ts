import { NextRequest } from "next/server";

// ============================================================
// lib/rate-limit.ts
// In-memory rate limiting for TournaOps API routes
// NOTE: For multi-instance production, replace with Redis
// ============================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store (works for single Vercel function instance)
const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================================
// RATE LIMIT CONFIG
// ============================================================

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  AUTH_LOGIN:    { windowMs: 15 * 60 * 1000, maxRequests: 10 },
  AUTH_REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 5  },
  AI_GENERATE:   { windowMs: 60 * 1000,      maxRequests: 20 },
  AI_SCREENSHOT: { windowMs: 60 * 1000,      maxRequests: 5  },
  PUBLIC_API:    { windowMs: 60 * 1000,      maxRequests: 60 },
  GENERAL:       { windowMs: 60 * 1000,      maxRequests: 100 },
} as const;

// ============================================================
// RATE LIMIT RESULT
// ============================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

// ============================================================
// RATE LIMIT CHECK
// ============================================================

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `rl:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt, retryAfterSeconds: 0 };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count++;
  store.set(key, existing);
  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
    retryAfterSeconds: 0,
  };
}

// ============================================================
// GET CLIENT IP — uses Vercel trusted header to prevent spoofing
// ============================================================

export function getClientIp(request: NextRequest): string {
  // x-vercel-forwarded-for is set by Vercel infrastructure — cannot be spoofed by clients
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  // Local dev fallback — use last entry (set by proxy, not client)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    return parts[parts.length - 1].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

// ============================================================
// RATE LIMIT RESPONSE HEADERS
// ============================================================

export function getRateLimitHeaders(
  result: RateLimitResult,
  config: RateLimitConfig
): Record<string, string> {
  return {
    "X-RateLimit-Limit":     String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset":     String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}
