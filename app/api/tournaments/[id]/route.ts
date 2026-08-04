import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

const VALID_STATUSES = ["draft", "registration", "live", "completed", "cancelled"];

// GET tournament by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        matches: { orderBy: { matchNumber: "asc" } },
        rounds: { orderBy: { order: "asc" } },
        stages: { orderBy: { order: "asc" } },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // If not public, must be owner or admin
    if (!tournament.isPublic) {
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      if (tournament.userId !== session.userId && !session.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json({ tournament });
  } catch (err) {
    logError(err, "TOURNAMENT_GET");
    return NextResponse.json({ error: "Failed to load tournament" }, { status: 500 });
  }
}

// PATCH tournament — update status, name, etc.
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    // Status change — validate
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be: " + VALID_STATUSES.join(", ") },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    // Other fields
    if (body.name !== undefined) updateData.name = String(body.name).substring(0, 100).trim();
    if (body.description !== undefined) updateData.description = String(body.description).substring(0, 2000);
    if (body.prizePool !== undefined) updateData.prizePool = String(body.prizePool).substring(0, 100);
    if (body.rules !== undefined) updateData.rules = String(body.rules).substring(0, 5000);
    if (body.discord !== undefined) updateData.discord = String(body.discord).substring(0, 200);
    if (body.isPublic !== undefined) updateData.isPublic = Boolean(body.isPublic);
    if (body.bannerImage !== undefined) updateData.bannerImage = String(body.bannerImage).substring(0, 500000);

    const updated = await prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        teams: true,
        matches: true,
        rounds: true,
      },
    });

    return NextResponse.json({ tournament: updated, success: true });
  } catch (err) {
    logError(err, "TOURNAMENT_PATCH");
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}

// DELETE tournament
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "TOURNAMENT_DELETE");
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}