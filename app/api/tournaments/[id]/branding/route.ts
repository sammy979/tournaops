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

    const branding = {
      primaryColor: String(body.primaryColor || "#3b82f6").substring(0, 30),
      accentColor: String(body.accentColor || "#8b5cf6").substring(0, 30),
      orgName: String(body.orgName || "").substring(0, 100),
      orgLogo: String(body.orgLogo || "").substring(0, 500000),
      customMessage: String(body.customMessage || "").substring(0, 500),
      discordUrl: String(body.discordUrl || "").substring(0, 200),
      twitterUrl: String(body.twitterUrl || "").substring(0, 200),
      websiteUrl: String(body.websiteUrl || "").substring(0, 200),
      bannerColor: String(body.bannerColor || "from-blue-900/20 to-purple-900/20").substring(0, 100),
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