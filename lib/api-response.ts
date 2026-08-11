// ============================================================
// lib/api-response.ts
// Standardized API response helpers for TournaOps
// ============================================================

import { NextResponse } from "next/server";

// ============================================================
// SUCCESS RESPONSES
// ============================================================

export function apiSuccess<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

export function apiCreated<T>(data: T): NextResponse {
  return apiSuccess(data, 201);
}

// ============================================================
// ERROR RESPONSES
// ============================================================

export function apiError(
  message: string,
  status: number = 400,
  details?: string[]
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && details.length > 0 ? { details } : {}),
    },
    { status }
  );
}

export function apiUnauthorized(message: string = "Authentication required"): NextResponse {
  return apiError(message, 401);
}

export function apiForbidden(message: string = "Access denied"): NextResponse {
  return apiError(message, 403);
}

export function apiNotFound(resource: string = "Resource"): NextResponse {
  return apiError(`${resource} not found`, 404);
}

export function apiValidationError(errors: string[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      details: errors,
    },
    { status: 422 }
  );
}

export function apiRateLimited(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: retryAfterSeconds,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    }
  );
}

export function apiServerError(context: string = "operation"): NextResponse {
  return apiError(`An error occurred during ${context}. Please try again.`, 500);
}

// ============================================================
// PARSE REQUEST BODY SAFELY
// ============================================================

export async function parseRequestBody<T = Record<string, unknown>>(
  request: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return { data: null, error: "Content-Type must be application/json" };
    }

    const data = await request.json() as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Invalid JSON in request body" };
  }
}
