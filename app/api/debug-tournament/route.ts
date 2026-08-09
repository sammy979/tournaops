import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// ============================================================
// DEBUG ROUTE — development only
// Returns 404 in production regardless of auth state.
// This route is intentionally not removed so local debugging
// remains possible, but it is completely inaccessible in prod.
// ============================================================

export async function GET(req: NextRequest) {
  // Hard block in production — no exceptions
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tid = searchParams.get("tid");
  if (!tid) {
    return NextResponse.json({ error: "?tid= required" }, { status: 400 });
  }

  const t = await prisma.tournament.findUnique({
    where: { id: tid },
    include: {
      teams: { select: { id: true, name: true, seed: true } },
      stages: {
        include: {
          groups: true,
          progressions: true,
        },
        orderBy: { order: "asc" },
      },
      matches: {
        select: {
          id: true,
          name: true,
          stageId: true,
          groupId: true,
          status: true,
          matchNumber: true,
        },
      },
    },
  });

  if (!t) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the tournament owner may access debug info
  // isAdmin bypass intentionally removed — owner only
  if (t.userId !== session.userId) {
    return NextResponse.json(
      { error: "You do not have permission to access this tournament" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    tournament: { id: t.id, name: t.name },
    teams: {
      count: t.teams.length,
      first5: t.teams.slice(0, 5).map((x) => ({
        id: x.id,
        name: x.name,
        seed: x.seed,
      })),
    },
    stages: t.stages.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      status: s.status,
      isLocked: s.isLocked,
      numGroups: s.numGroups,
      teamsPerGroup: s.teamsPerGroup,
      matchesPerGroup: s.matchesPerGroup,
      totalTeams: s.totalTeams,
      order: s.order,
      groups: s.groups.map((g) => ({
        id: g.id,
        name: g.name,
        teamCount: g.teamIds.length,
        matchIdsCount: g.matchIds.length,
        // teamIds intentionally omitted from debug output
      })),
      progressions: s.progressions.length,
    })),
    matchesSummary: {
      total: t.matches.length,
      byStage: t.stages.map((s) => ({
        stageName: s.name,
        matchCount: t.matches.filter((m) => m.stageId === s.id).length,
      })),
      orphan: t.matches.filter((m) => !m.stageId).length,
    },
  });
}
