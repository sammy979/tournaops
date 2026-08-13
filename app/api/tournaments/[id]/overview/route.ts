import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      select: { userId: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch comprehensive tournament overview data
    const [full, matchStats, recentActivity] = await Promise.all([
      prisma.tournament.findUnique({
        where: { id: params.id },
        include: {
          stages: {
            orderBy: { order: "asc" },
            include: {
              groups: {
                include: {
                  _count: { select: { teamProgressions: true } },
                },
              },
              matches: {
                include: {
                  result: true,
                  _count: { select: { results: true } },
                },
              },
              _count: { select: { matches: true } },
            },
          },
          teams: {
            orderBy: { name: "asc" },
            include: {
              _count: { select: { players: true } },
            },
          },
          _count: {
            select: { teams: true },
          },
        },
      }),

      prisma.match.aggregate({
        where: { stage: { tournamentId: params.id } },
        _count: { id: true },
      }),

      prisma.match.findMany({
        where: {
          stage: { tournamentId: params.id },
          result: { isNot: null },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          result: true,
          stage: { select: { name: true } },
        },
      }),
    ]);

    if (!full) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Calculate stats
    const totalMatches = matchStats._count.id;
    const completedMatches = full.stages.reduce((acc, stage) => {
      return acc + stage.matches.filter((m: any) => m.result).length;
    }, 0);

    const activeStage = full.stages.find((s: any) => s.status === "active") ||
                        full.stages.find((s: any) => s.status === "pending");

    return NextResponse.json({
      tournament: full,
      stats: {
        totalTeams: full._count.teams,
        maxTeams: full.maxTeams,
        totalMatches,
        completedMatches,
        pendingMatches: totalMatches - completedMatches,
        registrationPercent: full.maxTeams > 0 ? Math.round((full._count.teams / full.maxTeams) * 100) : 0,
      },
      activeStage,
      recentActivity,
    });
  } catch (error) {
    console.error("Tournament overview error:", error);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}