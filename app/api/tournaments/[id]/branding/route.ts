import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        brandingData: true,
        bannerImage: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      branding: tournament.brandingData || {},
      bannerImage: tournament.bannerImage || null,
    });
  } catch (err) {
    logError(err, "BRANDING_GET");
    return NextResponse.json({ error: "Failed to load branding" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();

    // Validate sponsors array
    const sponsors = Array.isArray(body.sponsors) ? body.sponsors.slice(0, 20).map((s: any) => ({
      id: String(s.id || Date.now() + Math.random()).substring(0, 50),
      name: String(s.name || "").substring(0, 100),
      logo: String(s.logo || "").substring(0, 500000),
      tier: String(s.tier || "gold").substring(0, 20),
      website: String(s.website || "").substring(0, 200),
      description: String(s.description || "").substring(0, 300),
    })) : [];

    const branding = {
      primaryColor: String(body.primaryColor || "#3b82f6").substring(0, 30),
      accentColor: String(body.accentColor || "#8b5cf6").substring(0, 30),
      orgName: String(body.orgName || "").substring(0, 100),
      orgLogo: String(body.orgLogo || "").substring(0, 500000),
      tagline: String(body.tagline || "").substring(0, 200),
      customMessage: String(body.customMessage || "").substring(0, 500),
      discordUrl: String(body.discordUrl || "").substring(0, 200),
      twitterUrl: String(body.twitterUrl || "").substring(0, 200),
      websiteUrl: String(body.websiteUrl || "").substring(0, 200),
      bannerColor: String(body.bannerColor || "from-blue-900/20 to-purple-900/20").substring(0, 100),
      sponsors: sponsors,
    };

    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        brandingData: branding as any,
      },
      select: {
        brandingData: true,
      },
    });

    return NextResponse.json({
      success: true,
      branding: updated.brandingData,
    });
  } catch (err) {
    logError(err, "BRANDING_PUT");
    return NextResponse.json({ error: "Failed to save branding" }, { status: 500 });
  }
}
