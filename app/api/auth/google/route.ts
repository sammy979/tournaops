import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl } from "@/lib/auth/google";
import { cookies } from "next/headers";

// GET /api/auth/google
// Redirects user to Google consent screen
// Stores CSRF state in a short-lived cookie

export async function GET(req: NextRequest) {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      { error: "Google authentication is not configured" },
      { status: 503 }
    );
  }

  // Generate CSRF state token
  const state = crypto.randomUUID();

  // Store state in httpOnly cookie (15 min expiry)
  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  // Store redirect destination if provided
  const from = req.nextUrl.searchParams.get("from") || "/dashboard";
  cookieStore.set("google_oauth_from", from, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  const authUrl = buildGoogleAuthUrl(state);
  return NextResponse.redirect(authUrl);
}
