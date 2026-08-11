import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try authenticated access first, fall back to public
    const session = await getSession();

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { include: { playersList: true }, orderBy: { name: "asc" } },
        matches: { orderBy: { matchNumber: "asc" } },
        stages: { orderBy: { order: "asc" } },
        progressions: { orderBy: { finalPosition: "asc" } },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // If private and not owner, deny
    if (!tournament.isPublic && (!session || tournament.userId !== session.userId)) {
      return NextResponse.json({ error: "Tournament is private" }, { status: 403 });
    }

    const scoringRule = tournament.scoringRule as any || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
    let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(scoringRule.placementPoints)) {
      placementPoints = scoringRule.placementPoints;
    } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }

    // Build standings
    const teamStats = new Map<string, any>();
    for (const team of tournament.teams) {
      teamStats.set(team.id, {
        id: team.id,
        name: team.name,
        tag: team.tag,
        logo: team.logo,
        players: team.playersList,
        points: 0,
        kills: 0,
        wwcds: 0,
        placementPts: 0,
        killPts: 0,
        damage: 0,
        matchesPlayed: 0,
        bestPlacement: 999,
        placements: [] as number[],
      });
    }

    const completedMatches = tournament.matches.filter(m =>
      m.status === "completed" && Array.isArray(m.results) && (m.results as any[]).length > 0
    );

    let totalKills = 0;
    let totalDamage = 0;
    let totalWWCDs = 0;

    for (const match of completedMatches) {
      const results = match.results as any[];
      for (const r of results) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const placement = Number(r.placement) || 0;
        const damage = Number(r.damage) || 0;
        const isWWCD = placement === 1 || r.wwcd === true;
        const pIdx = Math.max(0, placement - 1);
        const pPts = placementPoints[pIdx] || 0;
        const kPts = kills * killPoints;
        const bonus = isWWCD ? wwcdBonus : 0;

        s.points += pPts + kPts + bonus;
        s.placementPts += pPts;
        s.killPts += kPts;
        s.kills += kills;
        s.damage += damage;
        s.matchesPlayed++;
        if (isWWCD) { s.wwcds++; totalWWCDs++; }
        if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
        s.placements.push(placement);
        totalKills += kills;
        totalDamage += damage;
      }
    }

    const standings = Array.from(teamStats.values())
      .filter(s => s.matchesPlayed > 0)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wwcds !== a.wwcds) return b.wwcds - a.wwcds;
        return b.kills - a.kills;
      })
      .map((s, i) => ({
        rank: i + 1,
        id: s.id,
        name: s.name,
        tag: s.tag,
        logo: s.logo,
        points: s.points,
        kills: s.kills,
        wwcds: s.wwcds,
        placementPts: s.placementPts,
        killPts: s.killPts,
        damage: s.damage,
        matchesPlayed: s.matchesPlayed,
        bestPlacement: s.bestPlacement === 999 ? null : s.bestPlacement,
        avgPlacement: s.placements.length > 0
          ? Math.round((s.placements.reduce((a: number, b: number) => a + b, 0) / s.placements.length) * 10) / 10
          : null,
      }));

    const champion = standings[0] || null;
    const topFragger = standings.sort((a, b) => b.kills - a.kills)[0] || null;
    standings.sort((a, b) => a.rank - b.rank);

    // Stage journeys
    const stageJourneys: Record<string, any[]> = {};
    for (const prog of tournament.progressions) {
      if (!stageJourneys[prog.teamId]) stageJourneys[prog.teamId] = [];
      const stage = tournament.stages.find(s => s.id === prog.stageId);
      stageJourneys[prog.teamId].push({
        stageId: prog.stageId,
        stageName: stage?.name || "Unknown",
        stageType: stage?.type || "",
        position: prog.finalPosition,
        points: prog.points,
        kills: prog.kills,
        status: prog.status,
      });
    }

    const avgKillsPerMatch = completedMatches.length > 0
      ? Math.round((totalKills / completedMatches.length) * 10) / 10
      : 0;

    const branding = tournament.brandingData as any || {};
    const organizer = await prisma.user.findUnique({
      where: { id: tournament.userId },
      select: { displayName: true, username: true, avatar: true },
    });

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        description: tournament.description,
        prizePool: tournament.prizePool,
        status: tournament.status,
        format: tournament.format,
        bannerImage: tournament.bannerImage,
        organizer: branding.orgName || organizer?.displayName || organizer?.username || "Organizer",
        createdAt: tournament.createdAt,
      },
      standings,
      awards: {
        champion: champion ? {
          name: champion.name,
          logo: champion.logo,
          points: champion.points,
          kills: champion.kills,
          wwcds: champion.wwcds,
        } : null,
        topFragger: topFragger ? {
          name: topFragger.name,
          team: topFragger.name,
          kills: topFragger.kills,
        } : null,
        topDamage: standings.sort((a, b) => b.damage - a.damage)[0] ? {
          name: standings[0]?.name,
          team: standings[0]?.name,
          damage: standings[0]?.damage,
        } : null,
        mostWWCD: standings.sort((a, b) => b.wwcds - a.wwcds)[0] ? {
          name: standings[0]?.name,
          wwcds: standings[0]?.wwcds,
        } : null,
        mostConsistent: standings.length > 0 ? {
          name: standings[0].name,
          points: standings[0].points,
        } : null,
        biggestComeback: null,
      },
      statistics: {
        totalTeams: tournament.teams.length,
        completedMatches: completedMatches.length,
        totalMatches: tournament.matches.length,
        totalKills,
        totalDamage,
        totalWWCDs,
        avgKillsPerMatch,
      },
      stages: tournament.stages.map(s => ({ id: s.id, name: s.name, type: s.type, status: s.status })),
      stageJourneys,
      branding,
      aiSummary: null,
    });
  } catch (err) {
    logError(err, "TOURNAMENT_REPORT");
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}