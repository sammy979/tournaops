import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || id.trim() === "") {
      return NextResponse.json({ error: "Tournament ID required" }, { status: 400 });
    }

    const tournamentId = id.trim();

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { userId: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const [full, matchStats, recentMatches] = await Promise.all([
      prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          stages: {
            orderBy: { order: "asc" },
            include: {
              groups: {
                orderBy: { order: "asc" },
              },
            },
          },
          teams: {
            orderBy: { name: "asc" },
            include: {
              playersList: { select: { id: true } },
            },
          },
          _count: {
            select: { teams: true },
          },
        },
      }),

      prisma.match.count({
        where: { tournamentId },
      }),

      prisma.match.findMany({
        where: { tournamentId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          map: true,
          matchNumber: true,
          results: true,
          updatedAt: true,
          stageId: true,
        },
      }),
    ]);

    if (!full) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const completedMatches = await prisma.match.count({
      where: { tournamentId, status: { in: ["completed", "COMPLETED"] } },
    });

    const activeStage =
      full.stages.find((s) => s.status === "ACTIVE") ||
      full.stages.find((s) => s.status === "active") ||
      full.stages.find((s) => s.status === "PENDING") ||
      full.stages.find((s) => s.status === "DRAFT") ||
      full.stages[0] ||
      null;

    // Enrich recent matches with stage names
    const stageMap = new Map(full.stages.map((s) => [s.id, s.name]));
    const recentActivity = recentMatches.map((m) => ({
      ...m,
      updatedAt: m.updatedAt.toISOString(),
      stageName: m.stageId ? stageMap.get(m.stageId) || null : null,
    }));

    return NextResponse.json({
      tournament: {
        ...full,
        createdAt: full.createdAt.toISOString(),
        updatedAt: full.updatedAt.toISOString(),
        startDate: full.startDate ? full.startDate.toISOString() : null,
        endDate: full.endDate ? full.endDate.toISOString() : null,
        stages: full.stages.map((s) => ({
          ...s,
          startDate: s.startDate ? s.startDate.toISOString() : null,
          endDate: s.endDate ? s.endDate.toISOString() : null,
          registrationOpens: s.registrationOpens ? s.registrationOpens.toISOString() : null,
          registrationCloses: s.registrationCloses ? s.registrationCloses.toISOString() : null,
          lockedAt: s.lockedAt ? s.lockedAt.toISOString() : null,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
          groups: s.groups.map((g) => ({
            ...g,
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
          })),
        })),
        teams: full.teams.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          playerCount: t.playersList.length,
        })),
      },
      stats: {
        totalTeams: full._count.teams,
        maxTeams: full.maxTeams,
        totalMatches: matchStats,
        completedMatches,
        pendingMatches: matchStats - completedMatches,
        registrationPercent: full.maxTeams > 0
          ? Math.round((full._count.teams / full.maxTeams) * 100)
          : 0,
      },
      activeStage: activeStage
        ? {
            ...activeStage,
            startDate: activeStage.startDate ? activeStage.startDate.toISOString() : null,
            endDate: activeStage.endDate ? activeStage.endDate.toISOString() : null,
            registrationOpens: activeStage.registrationOpens ? activeStage.registrationOpens.toISOString() : null,
            registrationCloses: activeStage.registrationCloses ? activeStage.registrationCloses.toISOString() : null,
            lockedAt: activeStage.lockedAt ? activeStage.lockedAt.toISOString() : null,
            createdAt: activeStage.createdAt.toISOString(),
            updatedAt: activeStage.updatedAt.toISOString(),
          }
        : null,
      recentActivity,
    });
  } catch (error) {
    console.error("Tournament overview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch overview" },
      { status: 500 }
    );
  }
}