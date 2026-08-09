import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
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

    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          include: {
            tournament: {
              select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                userId: true,
                isPublic: true,
              },
            },
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Allow access if: tournament is public OR user owns the tournament OR user is admin
    const tournament = player.team.tournament;
    const isOwner = tournament.userId === session.userId;
    const isPublic = tournament.isPublic;
    const isAdmin = session.isAdmin;

    if (!isOwner && !isPublic && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Never return tournament.userId in the response
    const { userId: _userId, ...tournamentPublic } = tournament as any;

    return NextResponse.json({
      player: {
        ...player,
        team: {
          ...player.team,
          tournament: tournamentPublic,
        },
      },
    });
  } catch (err) {
    logError(err, "PLAYER_GET");
    return NextResponse.json({ error: "Failed to load player" }, { status: 500 });
  }
}