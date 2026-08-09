import { broadcastMilestone, broadcastSlotList } from "@/lib/discord-broadcaster";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";
import { isValidWebhookUrl } from "@/lib/discord-queue";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tournament = await prisma.tournament.findFirst({
      where: { id, userId: session.userId },
      include: {
        teams: {
          include: { playersList: true },
          orderBy: { name: "asc" },
        },
        rounds: {
          orderBy: { order: "asc" },
        },
        matches: {
          orderBy: { matchNumber: "asc" },
        },
        stages: {
          include: { groups: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (err) {
    logError(err, "TOURNAMENT_GET");
    return NextResponse.json({ error: "Failed to load tournament" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const updates = await req.json();
    const allowedFields = [
      "name", "description", "status", "prizePool", "rules", "discord", "maxTeams", "format", "game",
      "isPublic", "bannerImage", "trophyImage", "coverImage",
      "brandingData", "scheduleData", "sponsorLogos", "mapRotation",
    ];
    const validUpdates: any = {};
    for (const key of allowedFields) {
      if (key in updates) validUpdates[key] = updates[key];
    }

    const tournament = await prisma.tournament.update({
      where: { id },
      data: validUpdates,
      include: { teams: true },
    });

    // Auto-broadcast milestone events to Discord
    const oldStatus = (await prisma.tournament.findUnique({ where: { id }, select: { status: true } }))?.status;
    const newStatus = validUpdates.status;
    if (newStatus && oldStatus !== newStatus && tournament.discord) {
      const wh = tournament.discord;
      if (isValidWebhookUrl(wh)) {
        try {
          if (newStatus === "registration") await broadcastMilestone(wh, tournament, "REGISTRATION_OPEN");
          else if (newStatus === "live") await broadcastMilestone(wh, tournament, "TOURNAMENT_STARTED");
          else if (newStatus === "completed") await broadcastMilestone(wh, tournament, "TOURNAMENT_COMPLETED");
        } catch (e) { console.warn("[DISCORD_MILESTONE] Failed:", e); }
      }
    }

    return NextResponse.json({ tournament });
  } catch (err) {
    logError(err, "TOURNAMENT_UPDATE");
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    await prisma.tournament.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "TOURNAMENT_DELETE");
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}