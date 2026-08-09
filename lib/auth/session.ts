import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ============================================================
// SECURITY: JWT_SECRET must be set in production
// Never use a hardcoded fallback in production
// ============================================================
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production");
    }
    // Dev only fallback — warns loudly
    console.warn("[AUTH] WARNING: JWT_SECRET not set. Using insecure dev default. Set JWT_SECRET in .env");
    return "tournaops-dev-secret-CHANGE-ME-NOT-FOR-PRODUCTION";
  }
  return secret;
}

const COOKIE_NAME = "tournaops_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days (was 30 — reduced for security)

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  isAdmin?: boolean;
  isPro?: boolean;
  role?: "USER" | "ORGANIZER" | "SUPER_ADMIN";
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: MAX_AGE,
    issuer: "tournaops",
    audience: "tournaops-users",
  });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: "tournaops",
      audience: "tournaops-users",
    }) as SessionPayload;
    return decoded;
  } catch (err) {
    // Do not log token details
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  } catch {
    // Ignore cookie errors on logout
  }
}

export { COOKIE_NAME };
