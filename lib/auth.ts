// lib/auth.ts
// Central auth re-export file.
// Re-exports from lib/auth/session and lib/auth/rbac so all existing
// imports from "@/lib/auth" continue to work without changing every file.

export {
  getSession,
  setSessionCookie,
  clearSession,
  signSession,
  verifySession,
  COOKIE_NAME,
} from "@/lib/auth/session";

export type { SessionPayload } from "@/lib/auth/session";

export {
  requireSuperAdmin,
  requireOrganizer,
  requirePro,
  getAuthUser,
} from "@/lib/auth/rbac";

// Legacy JWT utilities — kept for any routes still using them
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "USER" | "SUPER_ADMIN" | "ORGANIZER";
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_COOKIE_NAME = "tournaops_session";
const TOKEN_HEADER_NAME = "authorization";

export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get(TOKEN_HEADER_NAME);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookieToken = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;
  return null;
}

export function validateToken(token: string): AuthResult {
  if (!JWT_SECRET) {
    return { user: null, error: "Server configuration error" };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return { user: null, error: "Token expired" };
    }
    return { user: decoded, error: null };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { user: null, error: "Token expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { user: null, error: "Invalid token" };
    }
    return { user: null, error: "Authentication failed" };
  }
}

export function authenticateRequest(request: NextRequest): AuthResult {
  const token = extractToken(request);
  if (!token) return { user: null, error: "Authentication required" };
  return validateToken(token);
}

export function requireAuth(request: NextRequest): {
  user: AuthUser | null;
  errorResponse: NextResponse | null;
} {
  const { user, error } = authenticateRequest(request);
  if (!user || error) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: error || "Authentication required" },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function requireAdmin(request: NextRequest): {
  user: AuthUser | null;
  errorResponse: NextResponse | null;
} {
  const { user, errorResponse } = requireAuth(request);
  if (errorResponse || !user) return { user: null, errorResponse };
  if (user.role !== "SUPER_ADMIN") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function createToken(user: {
  id: string;
  email: string;
  username: string;
  role: string;
}): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d", issuer: "tournaops", audience: "tournaops-users" }
  );
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  };
}

export function clearAuthCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE_NAME;