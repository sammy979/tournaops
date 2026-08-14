import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { select: { id: true, name: true, tag: true, logo: true, seed: true } },
        stages: { orderBy: { order: "asc" }, select: { id: true, name: true, type: true, status: true, order: true } },
        matches: {
          orderBy: { scheduledAt: "asc" },
          take: 10,
          select: { id: true, name: true, status: true, scheduledAt: true, map: true, startTime: true },
        },
        prizes: { orderBy: { position: "asc" } },
        registrations: { select: { id: true, status: true } },
        _count: { select: { teams: true, matches: true, stages: true, registrations: true } },
      },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const completedMatches = await prisma.match.count({ where: { tournamentId: id, status: "completed" } });
    const pendingMatches = await prisma.match.count({ where: { tournamentId: id, status: "pending" } });
    return NextResponse.json({
      tournament,
      stats: {
        totalTeams: tournament._count.teams,
        totalMatches: tournament._count.matches,
        totalStages: tournament._count.stages,
        totalRegistrations: tournament._count.registrations,
        completedMatches,
        pendingMatches,
      },
    });
  } catch (error) {
    console.error("GET /api/tournaments/[id]/overview:", error);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}