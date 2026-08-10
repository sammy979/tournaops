import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { exchangeCodeForTokens, fetchGoogleUserInfo, generateUsernameFromGoogle } from "@/lib/auth/google";
import { logError } from "@/lib/logger";

// GET /api/auth/google/callback
// Handles Google OAuth callback, creates/finds user, sets session

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.tournaops.com";

  try {
    const { searchParams } = req.nextUrl;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // User denied access
    if (error) {
      return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_callback`);
    }

    // Verify CSRF state
    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_oauth_state")?.value;
    const from = cookieStore.get("google_oauth_from")?.value || "/dashboard";

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${appUrl}/login?error=state_mismatch`);
    }

    // Clear OAuth cookies
    cookieStore.delete("google_oauth_state");
    cookieStore.delete("google_oauth_from");

    // Exchange code for access token
    const tokens = await exchangeCodeForTokens(code);

    // Fetch Google user profile
    const profile = await fetchGoogleUserInfo(tokens.access_token);

    if (!profile.email_verified) {
      return NextResponse.redirect(`${appUrl}/login?error=email_not_verified`);
    }

    // Find or create user
    // Priority: googleId match > email match > create new
    let user = await prisma.user.findUnique({
      where: { googleId: profile.sub },
      select: { id: true, email: true, username: true, displayName: true, isAdmin: true,
        isPro: true,
        role: true,
        proExpiresAt: true, isPro: true, role: true, googleId: true },
    });

    if (!user) {
      // Check if email already registered (email/password account)
      const existingByEmail = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() },
        select: { id: true, email: true, username: true, displayName: true, isAdmin: true,
        isPro: true,
        role: true,
        proExpiresAt: true, isPro: true, role: true, googleId: true },
      });

      if (existingByEmail) {
        // Link Google ID to existing account
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.sub,
            // Update avatar if not set
            avatar: existingByEmail.googleId ? undefined : (profile.picture || undefined),
          },
          select: { id: true, email: true, username: true, displayName: true, isAdmin: true,
        isPro: true,
        role: true,
        proExpiresAt: true, isPro: true, role: true, googleId: true },
        });
      } else {
        // Create new user from Google profile
        const username = generateUsernameFromGoogle(profile.name, profile.sub);
        const displayName = profile.name.trim().substring(0, 50) || username;

        user = await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            username,
            displayName,
            password: "",  // No password for Google-only accounts
            googleId: profile.sub,
            avatar: profile.picture || null,
          },
          select: { id: true, email: true, username: true, displayName: true, isAdmin: true,
        isPro: true,
        role: true,
        proExpiresAt: true, isPro: true, role: true, googleId: true },
        });
      }
    } else {
      // Update avatar from Google if changed
      if (profile.picture && !user.googleId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: profile.picture },
        });
      }
    }

    // Set session â€” identical to email/password login
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      isAdmin: user.isAdmin,
    });

    return NextResponse.redirect(`${appUrl}${from}`);

  } catch (err) {
    logError(err, "GOOGLE_AUTH_CALLBACK");
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`);
  }
}
