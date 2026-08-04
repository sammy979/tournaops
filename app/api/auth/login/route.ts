import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { validateEmail, validatePassword } from "@/lib/validation";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // ── Rate limiting ──────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = checkRateLimit(`login:${ip}`, RATE_LIMITS.AUTH_LOGIN);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait before trying again." },
      { status: 429, headers: getRateLimitHeaders(rl, RATE_LIMITS.AUTH_LOGIN) }
    );
  }

  try {
    // ── Parse body ─────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password } = body as Record<string, unknown>;

    // ── Input validation ───────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 1 || password.length > 128) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    // ── Lookup user ────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: (email as string).toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        password: true,
        isAdmin: true,
      },
    });

    // Use same error for both invalid email and wrong password
    // This prevents user enumeration attacks
    if (!user) {
      // Still run bcrypt to prevent timing attacks
      await bcrypt.compare(password as string, "$2b$10$invalidhashtopreventtimingattack");
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ── Verify password ────────────────────────────────────────
    const valid = await bcrypt.compare(password as string, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // ── Set session cookie ─────────────────────────────────────
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    logError(err, "AUTH_LOGIN");
    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
