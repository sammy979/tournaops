import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MatchResultItem {
  teamId: string;
  placement?: number;
  kills?: number;
  wwcd?: boolean;
  players?: Array<{ name: string; kills: number; pubgId?: string; photo?: string }>;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token) return NextResponse.json({ error: "No token" }, { status: 400 });

    const tournament = await prisma.tournament.findFirst({
      where: { overlayToken: token },
      select: {
        id: true,
        name: true,
        status: true,
        scoringRule: true,
        bannerImage: true,
        brandingData: true,
        user: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ 
        error: "Not found", tournament: null, standings: [], organizer: null,
      }, { status: 404 });
    }

    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, name: true, tag: true, logo: true, players: true },
    });

    const matches = await prisma.match.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, status: true, results: true },
    });

    const scoringRule: any = tournament.scoringRule || {
      killPoints: 1,
      placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      wwcdBonus: 0,
    };

    const killPoints = scoringRule.killPoints || 1;
    const placementPoints: number[] = Array.isArray(scoringRule.placementPoints)
      ? scoringRule.placementPoints
      : Object.values(scoringRule.placementPoints || {});
    const wwcdBonus = scoringRule.wwcdBonus || 0;

    const teamStandings: Record<string, any> = {};
    const playerKills: Record<string, { name: string; teamName: string; teamTag: string; teamLogo: string | null; kills: number; pubgId?: string; photo?: string }> = {};

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
        players: [],
      };

      // Extract player info from team.players JSON
      const teamPlayers = Array.isArray(team.players) ? team.players as any[] : [];
      teamPlayers.forEach((p: any) => {
        const playerKey = `${team.id}-${p.name}`;
        playerKills[playerKey] = {
          name: p.name || "Unknown",
          teamName: team.name,
          teamTag: team.tag || "",
          teamLogo: team.logo || null,
          kills: 0,
          pubgId: p.pubgId,
          photo: p.photo,
        };
      });
    });

    matches.forEach((match) => {
      if (!match.results) return;
      const results = Array.isArray(match.results) ? match.results as MatchResultItem[] : [];
      
      results.forEach((result) => {
        if (!result.teamId) return;
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

        // Track player kills if available
        if (Array.isArray(result.players)) {
          result.players.forEach((p) => {
            const playerKey = `${result.teamId}-${p.name}`;
            if (playerKills[playerKey]) {
              playerKills[playerKey].kills += Number(p.kills) || 0;
            }
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

    // Top individual fragger
    const topFraggers = Object.values(playerKills)
      .filter((p) => p.kills > 0)
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 10);

    // If no player kills tracked, use team with most kills
    const topFraggerTeam = [...standings].sort((a, b) => b.totalKills - a.totalKills)[0];

    return NextResponse.json({
      tournament: { 
        id: tournament.id, 
        name: tournament.name, 
        status: tournament.status,
        bannerImage: tournament.bannerImage,
      },
      standings,
      organizer: tournament.user,
      branding: tournament.brandingData || null,
      topFraggers,
      topFraggerTeam,
    }, {
      headers: {
        "Cache-Control": "public, max-age=5",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Overlay API error:", error);
    return NextResponse.json({ 
      error: error?.message, tournament: null, standings: [], organizer: null,
    }, { status: 500 });
  }
}