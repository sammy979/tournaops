import { sendWelcomeEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { validateEmail, validatePassword, validateUsername, validateString } from "@/lib/validation";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // â”€â”€ Rate limiting â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ip = getClientIp(req);
  const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.AUTH_REGISTER);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait before trying again." },
      { status: 429, headers: getRateLimitHeaders(rl, RATE_LIMITS.AUTH_REGISTER) }
    );
  }

  try {
    // â”€â”€ Parse body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { email, password, username, displayName } = body as Record<string, unknown>;

    // â”€â”€ Input validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const errors: string[] = [];

    if (!validateEmail(email)) {
      errors.push("Valid email is required");
    }

    const pwResult = validatePassword(password);
    if (!pwResult.valid) {
      errors.push(...pwResult.errors);
    }

    const unResult = validateUsername(username);
    if (!unResult.valid) {
      errors.push(...unResult.errors);
    }

    const dnResult = validateString(displayName, "Display name", { minLength: 2, maxLength: 50 });
    if (!dnResult.valid) {
      errors.push(...dnResult.errors);
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], details: errors }, { status: 400 });
    }

    // â”€â”€ Normalize inputs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const normalizedEmail = (email as string).toLowerCase().trim();
    const normalizedUsername = (username as string).toLowerCase().trim();
    const normalizedDisplayName = (displayName as string).trim();

    // â”€â”€ Check uniqueness â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { username: normalizedUsername },
        select: { id: true },
      }),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // â”€â”€ Hash password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // bcrypt cost 12 â€” good balance of security vs speed
    const passwordHash = await bcrypt.hash(password as string, 12);

    // â”€â”€ Create user â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        displayName: normalizedDisplayName,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        isAdmin: true,
        isPro: true,
        role: true,
      },
    });

    // â”€â”€ Set session cookie â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
      isPro: user.isPro,
      role: user.role as "USER" | "ORGANIZER" | "SUPER_ADMIN",
    });


    // â”€â”€ Send welcome email (fire and forget) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    void sendWelcomeEmail(user.email, user.displayName || user.username).catch((e) => {
      console.error("[REGISTER] Welcome email failed:", e);
    });
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          isAdmin: user.isAdmin,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    logError(err, "AUTH_REGISTER");
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}