import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MatchResultItem {
  teamId?: string;
  placement?: number;
  kills?: number;
  wwcd?: boolean;
  players?: Array<{ name: string; kills: number }>;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const tournament = await prisma.tournament.findFirst({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        game: true,
        status: true,
        format: true,
        prizePool: true,
        maxTeams: true,
        scoringRule: true,
        mapRotation: true,
        bannerImage: true,
        rules: true,
        isPublic: true,
        brandingData: true,
        registrationData: true,
        createdAt: true,
        userId: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    let organizer = null;
    try {
      organizer = await prisma.user.findUnique({
        where: { id: tournament.userId },
        select: { id: true, username: true, displayName: true, avatar: true },
      });
    } catch {}

    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        tag: true,
        logo: true,
        players: true,
      },
      orderBy: { name: "asc" },
    });

    const matches = await prisma.match.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        status: true,
        results: true,
        matchNumber: true,
        map: true,
      },
    });

    const rounds = await prisma.round.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, name: true, order: true },
    });

    // Calculate registration counts
    const regData = Array.isArray(tournament.registrationData) ? tournament.registrationData as any[] : [];
    const registrationStats = {
      total: regData.length,
      pending: regData.filter(r => r.status === "pending").length,
      approved: regData.filter(r => r.status === "approved").length,
      rejected: regData.filter(r => r.status === "rejected").length,
    };

    const totalSlotsUsed = teams.length + registrationStats.pending;
    const slotsAvailable = Math.max(0, tournament.maxTeams - totalSlotsUsed);
    const fillPercentage = Math.min(100, Math.round((totalSlotsUsed / tournament.maxTeams) * 100));

    // Scoring calculation
    const scoringRule: any = tournament.scoringRule || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    let placementPoints: number[] = [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    if (Array.isArray(scoringRule.placementPoints)) placementPoints = scoringRule.placementPoints;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;

    const teamStandings: Record<string, any> = {};
    const playerKills: Record<string, any> = {};

    teams.forEach((team) => {
      teamStandings[team.id] = {
        teamId: team.id,
        teamName: team.name,
        teamTag: team.tag || null,
        teamLogo: team.logo || null,
        totalPoints: 0,
        totalKills: 0,
        matchesPlayed: 0,
        wwcdCount: 0,
        players: Array.isArray(team.players) ? team.players : [],
      };
      const teamPlayers = Array.isArray(team.players) ? team.players as any[] : [];
      teamPlayers.forEach((p: any) => {
        if (!p || !p.name) return;
        playerKills[`${team.id}-${p.name}`] = {
          name: p.name,
          teamName: team.name,
          teamTag: team.tag,
          teamLogo: team.logo,
          kills: 0,
          photo: p.photo,
        };
      });
    });

    matches.forEach((match) => {
      if (!match.results) return;
      const results = Array.isArray(match.results) ? match.results as MatchResultItem[] : [];
      results.forEach((result) => {
        if (!result || !result.teamId) return;
        const team = teamStandings[result.teamId];
        if (!team) return;
        const kills = Number(result.kills) || 0;
        const placement = Number(result.placement) || 16;
        const placeIndex = Math.max(0, placement - 1);
        const placePoints = placementPoints[placeIndex] || 0;
        const isWWCD = placement === 1 || result.wwcd === true;
        team.totalKills += kills;
        team.totalPoints += (kills * killPoints) + placePoints + (isWWCD ? wwcdBonus : 0);
        team.matchesPlayed += 1;
        if (isWWCD) team.wwcdCount += 1;
        if (Array.isArray(result.players)) {
          result.players.forEach((p: any) => {
            if (!p || !p.name) return;
            const key = `${result.teamId}-${p.name}`;
            if (playerKills[key]) playerKills[key].kills += Number(p.kills) || 0;
          });
        }
      });
    });

    const standings = Object.values(teamStandings)
      .sort((a: any, b: any) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
        return b.totalKills - a.totalKills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    const topFraggers = Object.values(playerKills)
      .filter((p: any) => p.kills > 0)
      .sort((a: any, b: any) => b.kills - a.kills)
      .slice(0, 10);

    // Remove registrationData from response but keep the stats
    const { registrationData, ...tournamentPublic } = tournament;

    return NextResponse.json({
      tournament: { ...tournamentPublic, teams, matches, rounds },
      standings,
      organizer,
      branding: tournament.brandingData || null,
      topFraggers,
      registrationStats,
      slotsInfo: {
        maxTeams: tournament.maxTeams,
        approvedTeams: teams.length,
        pendingRegistrations: registrationStats.pending,
        totalUsed: totalSlotsUsed,
        available: slotsAvailable,
        fillPercentage,
      },
    }, {
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
  } catch (error: any) {
    console.error("Public API error:", error?.message, error?.stack);
    return NextResponse.json({
      error: error?.message || "Failed",
      details: String(error),
    }, { status: 500 });
  }
}