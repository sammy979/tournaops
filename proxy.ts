import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/contact",
  "/privacy",
  "/terms",
  "/create",
  "/timer",
];

const PUBLIC_PREFIXES = [
  "/tournaments/",
  "/api/public/",
  "/api/auth/",
  "/api/health",
  "/api/discord/incoming",
  "/api/payments/webhook",
  "/api/overlay/",
  "/overlay/",
  "/preview/",
  "/players/",
  "/bracket/",
  "/_next/",
  "/favicon",
  "/icon",
  "/logo",
  "/manifest",
  "/robots",
  "/sitemap",
];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isPublic) return NextResponse.next();

  const token = req.cookies.get("tournaops_session")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.webp$).*)",
  ],
};