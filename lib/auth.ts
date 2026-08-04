import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// ============================================================
// TYPES
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "USER" | "ADMIN" | "ORGANIZER";
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

// ============================================================
// CONSTANTS
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_COOKIE_NAME = "tournaops_token";
const TOKEN_HEADER_NAME = "authorization";

// ============================================================
// EXTRACT TOKEN FROM REQUEST
// ============================================================

export function extractToken(request: NextRequest): string | null {
  // 1. Check Authorization header (Bearer token)
  const authHeader = request.headers.get(TOKEN_HEADER_NAME);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // 2. Check cookie
  const cookieToken = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

// ============================================================
// VALIDATE JWT TOKEN
// ============================================================

export function validateToken(token: string): AuthResult {
  if (!JWT_SECRET) {
    console.error("[AUTH] JWT_SECRET is not configured");
    return { user: null, error: "Server configuration error" };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Check expiration explicitly (jwt.verify handles this, but be explicit)
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

// ============================================================
// AUTHENTICATE REQUEST — Main middleware function
// ============================================================

export function authenticateRequest(request: NextRequest): AuthResult {
  const token = extractToken(request);

  if (!token) {
    return { user: null, error: "Authentication required" };
  }

  return validateToken(token);
}

// ============================================================
// REQUIRE AUTH — Returns user or NextResponse error
// Use in API routes:
//   const { user, errorResponse } = requireAuth(request);
//   if (errorResponse) return errorResponse;
// ============================================================

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

// ============================================================
// REQUIRE ADMIN — Returns user if admin, error otherwise
// ============================================================

export function requireAdmin(request: NextRequest): {
  user: AuthUser | null;
  errorResponse: NextResponse | null;
} {
  const { user, errorResponse } = requireAuth(request);

  if (errorResponse || !user) {
    return { user: null, errorResponse };
  }

  if (user.role !== "ADMIN") {
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

// ============================================================
// REQUIRE ORGANIZER OR ADMIN
// ============================================================

export function requireOrganizer(request: NextRequest): {
  user: AuthUser | null;
  errorResponse: NextResponse | null;
} {
  const { user, errorResponse } = requireAuth(request);

  if (errorResponse || !user) {
    return { user: null, errorResponse };
  }

  if (user.role !== "ADMIN" && user.role !== "ORGANIZER") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Organizer access required" },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

// ============================================================
// CREATE JWT TOKEN
// ============================================================

export function createToken(user: {
  id: string;
  email: string;
  username: string;
  role: string;
}): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
      issuer: "tournaops",
      audience: "tournaops-users",
    }
  );
}

// ============================================================
// CREATE AUTH COOKIE OPTIONS
// ============================================================

export function getAuthCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: "/",
  };
}

// ============================================================
// CLEAR AUTH COOKIE
// ============================================================

export function clearAuthCookie(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  };
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE_NAME;
