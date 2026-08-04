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
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const RATE_LIMITS = {
  // Auth endpoints — strict
  AUTH_LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 10 },     // 10 per 15 min
  AUTH_REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 5 },   // 5 per hour
  
  // AI endpoints — moderate
  AI_GENERATE: { windowMs: 60 * 1000, maxRequests: 20 },         // 20 per minute
  AI_SCREENSHOT: { windowMs: 60 * 1000, maxRequests: 5 },        // 5 per minute
  
  // Public API — lenient
  PUBLIC_API: { windowMs: 60 * 1000, maxRequests: 60 },          // 60 per minute
  
  // General API
  GENERAL: { windowMs: 60 * 1000, maxRequests: 100 },            // 100 per minute
} as const;

// ============================================================
// RATE LIMIT CHECK
// ============================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = `rl:${identifier}`;
  const existing = store.get(key);

  // No record or expired — create new
  if (!existing || existing.resetAt < now) {
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
      retryAfterSeconds: 0,
    };
  }

  // Within window
  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  // Increment
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
// GET CLIENT IP FROM NEXT REQUEST
// ============================================================

import { NextRequest } from "next/server";

export function getClientIp(request: NextRequest): string {
  // Vercel / Cloudflare headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

// ============================================================
// RATE LIMIT HEADERS
// ============================================================

export function getRateLimitHeaders(result: RateLimitResult, config: RateLimitConfig): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { "Retry-After": String(result.retryAfterSeconds) }),
  };
}
