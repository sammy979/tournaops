import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { brandingData: true, bannerImage: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      branding: tournament.brandingData || {},
      bannerImage: tournament.bannerImage,
    });
  } catch (err) {
    logError(err, "BRANDING_GET");
    return NextResponse.json({ error: "Failed to load branding" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Validate branding fields
    const allowed = ["primaryColor", "accentColor", "orgName", "orgLogo",
                     "customMessage", "discordUrl", "twitterUrl", "websiteUrl", "bannerColor"];
    const branding: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        branding[key] = String(body[key]).substring(0, 500);
      }
    }

    const updated = await prisma.tournament.update({
      where: { id },
      data: { brandingData: branding },
      select: { brandingData: true },
    });

    return NextResponse.json({ branding: updated.brandingData, success: true });
  } catch (err) {
    logError(err, "BRANDING_PUT");
    return NextResponse.json({ error: "Failed to save branding" }, { status: 500 });
  }
}