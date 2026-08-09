// lib/api-middleware.ts
// ============================================================
// Shared request validation helpers for API routes
// Use these instead of duplicating validation logic in routes
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import type { SessionPayload } from "@/lib/auth/session";

export interface AuthResult {
  session: SessionPayload;
  error?: never;
}

export interface AuthError {
  session?: never;
  error: NextResponse;
}

// ── requireAuth ──────────────────────────────────────────────
// Returns the session or a 401 response
export async function requireAuth(
  req: NextRequest
): Promise<AuthResult | AuthError> {
  const session = await getSession();
  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { session };
}

// ── parseBody ────────────────────────────────────────────────
// Returns parsed body or a 400 response
export async function parseBody<T = Record<string, unknown>>(
  req: NextRequest
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const data = await req.json();
    return { data };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      ),
    };
  }
}

// ── requireField ─────────────────────────────────────────────
// Validates a required string field
export function requireField(
  value: unknown,
  name: string,
  options: { minLength?: number; maxLength?: number } = {}
): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  if (options.minLength && trimmed.length < options.minLength) return null;
  if (options.maxLength && trimmed.length > options.maxLength) return null;
  return trimmed;
}

// ── validateId ───────────────────────────────────────────────
// Prevents malformed IDs from hitting the database
export function validateId(id: unknown): boolean {
  if (typeof id !== "string") return false;
  return /^[a-zA-Z0-9_-]{8,}$/.test(id);
}

// ── errorResponse ────────────────────────────────────────────
// Standard error response factory
export function errorResponse(
  message: string,
  status: number,
  details?: string[]
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      ...(details && details.length > 0 ? { details } : {}),
    },
    { status }
  );
}

// ── successResponse ──────────────────────────────────────────
export function successResponse(data: Record<string, unknown>): NextResponse {
  return NextResponse.json(data);
}