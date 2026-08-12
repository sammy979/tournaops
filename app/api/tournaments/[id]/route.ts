import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTournamentWithAuth(tournamentId: string, userId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      organizer: { select: { id: true, name: true, email: true } },
      stages: {
        orderBy: { order: "asc" },
        include: {
          groups: {
            include: {
              _count: { select: { teamProgressions: true } },
            },
          },
          _count: { select: { matches: true } },
        },
      },
      teams: {
        orderBy: { createdAt: "asc" },
        include: {
          _count: { select: { players: true } },
        },
      },
      _count: {
        select: { teams: true, stages: true },
      },
    },
  });

  if (!tournament) return { tournament: null, authorized: false };

  const isOrganizer = tournament.organizerId === userId;

  // Public tournaments can be read by anyone; private only by organizer
  if (!tournament.isPublic && !isOrganizer) {
    return { tournament: null, authorized: false };
  }

  return { tournament, authorized: true, isOrganizer };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    const userId = session?.userId || "";

    const { tournament, authorized, isOrganizer } = await getTournamentWithAuth(params.id, userId);

    if (!tournament || !authorized) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ tournament, isOrganizer });
  } catch (error) {
    console.error("Tournament fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { organizerId: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.organizerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized to edit this tournament" }, { status: 403 });
    }

    const body = await req.json();

    // Whitelist allowed fields for update
    const allowedFields = [
      "name", "description", "status", "registrationOpen", "registrationDeadline",
      "startDate", "endDate", "prizePool", "prizeDescription", "rules", "entryFee",
      "isPublic", "bannerUrl", "logoUrl", "discordServerId", "discordChannelId",
    ];

    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Convert date strings
    if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    const updated = await prisma.tournament.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ tournament: updated });
  } catch (error) {
    console.error("Tournament update error:", error);
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { organizerId: true, status: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.organizerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (tournament.status === "live") {
      return NextResponse.json({ error: "Cannot delete a live tournament" }, { status: 409 });
    }

    await prisma.tournament.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tournament delete error:", error);
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}