import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tid = searchParams.get("tid");
  if (!tid) {
    // List user's tournaments
    const tournaments = await prisma.tournament.findMany({
      where: { userId: session.userId },
      select: { id: true, name: true, slug: true, status: true, _count: { select: { teams: true, matches: true, stages: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      hint: "Add ?tid=TOURNAMENT_ID to check specific tournament",
      yourTournaments: tournaments,
    });
  }

  const t = await prisma.tournament.findUnique({
    where: { id: tid },
    include: {
      teams: { select: { id: true, name: true, tag: true } },
      stages: { include: { groups: true, progressions: true }, orderBy: { order: "asc" } },
      matches: { orderBy: { matchNumber: "asc" } },
    },
  });

  if (!t) return NextResponse.json({ error: "Not found" });
  if (t.userId !== session.userId) return NextResponse.json({ error: "Not owner" }, { status: 403 });

  const completedMatches = t.matches.filter(m => m.status === "completed" && Array.isArray(m.results) && (m.results as any[]).length > 0);
  const orphanMatches = t.matches.filter(m => !m.stageId);
  const matchesWithoutGroup = t.matches.filter(m => m.stageId && !m.groupId);

  // Calculate standings
  const scoringRule: any = t.scoringRule || {};
  const killPoints = Number(scoringRule.killPoints) || 1;
  const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
  let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
  if (Array.isArray(scoringRule.placementPoints)) placementPoints = scoringRule.placementPoints;

  const teamStats = new Map<string, any>();
  for (const team of t.teams) {
    teamStats.set(team.id, { id: team.id, name: team.name, points: 0, kills: 0, wwcds: 0, matches: 0 });
  }
  for (const m of completedMatches) {
    for (const r of (m.results as any[])) {
      const s = teamStats.get(r.teamId);
      if (!s) continue;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 16;
      s.points += (placementPoints[placement - 1] || 0) + kills * killPoints + (placement === 1 ? wwcdBonus : 0);
      s.kills += kills;
      if (placement === 1) s.wwcds++;
      s.matches++;
    }
  }
  const standings = Array.from(teamStats.values())
    .filter(s => s.matches > 0)
    .sort((a, b) => b.points - a.points);

  const checks = {
    tournament: { id: t.id, name: t.name, slug: t.slug, status: t.status, discordConfigured: !!t.discord },
    teams: { total: t.teams.length, max: t.maxTeams },
    stages: {
      total: t.stages.length,
      details: t.stages.map(s => ({
        name: s.name,
        status: s.status,
        groups: s.groups.length,
        teamsAssigned: s.groups.reduce((sum, g) => sum + g.teamIds.length, 0),
        totalTeamsPossible: s.groups.length * (s.teamsPerGroup || 16),
        matchesInStage: t.matches.filter(m => m.stageId === s.id).length,
        completedMatches: t.matches.filter(m => m.stageId === s.id && m.status === "completed" && Array.isArray(m.results) && (m.results as any[]).length > 0).length,
        progressions: s.progressions.length,
      })),
    },
    matches: {
      total: t.matches.length,
      completed: completedMatches.length,
      pending: t.matches.length - completedMatches.length,
      orphaned_no_stage: orphanMatches.length,
      no_group: matchesWithoutGroup.length,
    },
    standings_calculation: {
      teamsWithResults: standings.length,
      top5: standings.slice(0, 5).map(s => ({ name: s.name, points: s.points, kills: s.kills, wwcds: s.wwcds })),
    },
    urls: {
      dashboard: `https://www.tournaops.com/dashboard/tournaments/${t.id}/overview`,
      matchResults: `https://www.tournaops.com/dashboard/tournaments/${t.id}/match-results`,
      standings: `https://www.tournaops.com/dashboard/tournaments/${t.id}/standings`,
      matches: `https://www.tournaops.com/dashboard/tournaments/${t.id}/matches`,
      public: `https://www.tournaops.com/tournaments/${t.slug}`,
      publicResults: `https://www.tournaops.com/tournaments/${t.slug}/results`,
      publicReport: `https://www.tournaops.com/tournaments/${t.slug}/report`,
      standingsImage: `https://www.tournaops.com/api/tournaments/${t.id}/standings-image`,
      overlay: t.overlayToken ? `https://www.tournaops.com/overlay/${t.overlayToken}` : "not-set",
    },
    diagnostics: {
      canEnterResults: t.stages.length > 0 && t.stages[0].groups.some(g => g.teamIds.length > 0),
      canShowStandings: completedMatches.length > 0,
      canAdvanceTeams: t.stages.length > 0 && t.stages[0].groups.some(g => g.teamIds.length > 0) && completedMatches.length > 0,
      discordWorking: !!t.discord,
    },
  };

  return NextResponse.json(checks);
}