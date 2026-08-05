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
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;
    if (!token) {
      return NextResponse.json({ error: "No token", standings: [] }, { status: 400 });
    }

    // Simple query - only select fields that exist
    const tournament = await prisma.tournament.findFirst({
      where: { overlayToken: token },
      select: {
        id: true,
        name: true,
        status: true,
        scoringRule: true,
        bannerImage: true,
        brandingData: true,
        userId: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ 
        error: "Overlay not found",
        tournament: null,
        standings: [],
        organizer: null,
      }, { status: 404 });
    }

    // Get organizer
    let organizer = null;
    try {
      organizer = await prisma.user.findUnique({
        where: { id: tournament.userId },
        select: { id: true, username: true, displayName: true, avatar: true },
      });
    } catch (e) {
      console.warn("Failed to fetch organizer:", e);
    }

    // Get teams (only basic fields)
    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        tag: true,
        logo: true,
        players: true,
      },
    });

    // Get matches with results
    const matches = await prisma.match.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        status: true,
        results: true,
      },
    });

    // Parse scoring rule
    const scoringRule: any = tournament.scoringRule || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    let placementPoints: number[] = [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0];
    if (Array.isArray(scoringRule.placementPoints)) {
      placementPoints = scoringRule.placementPoints;
    } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;

    // Build standings
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
      };

      // Process team players
      let teamPlayers: any[] = [];
      if (Array.isArray(team.players)) {
        teamPlayers = team.players as any[];
      }
      
      teamPlayers.forEach((p: any) => {
        if (!p || !p.name) return;
        playerKills[`${team.id}-${p.name}`] = {
          name: p.name,
          teamName: team.name,
          teamTag: team.tag,
          teamLogo: team.logo,
          kills: 0,
          pubgId: p.pubgId,
          photo: p.photo,
        };
      });
    });

    // Process matches
    matches.forEach((match) => {
      if (!match.results) return;
      
      let results: MatchResultItem[] = [];
      if (Array.isArray(match.results)) {
        results = match.results as MatchResultItem[];
      }
      
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

        // Process player kills
        if (Array.isArray(result.players)) {
          result.players.forEach((p: any) => {
            if (!p || !p.name) return;
            const key = `${result.teamId}-${p.name}`;
            if (playerKills[key]) {
              playerKills[key].kills += Number(p.kills) || 0;
            }
          });
        }
      });
    });

    // Sort standings
    const standings = Object.values(teamStandings)
      .sort((a: any, b: any) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
        return b.totalKills - a.totalKills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    // Top fraggers (from player kills)
    const topFraggers = Object.values(playerKills)
      .filter((p: any) => p.kills > 0)
      .sort((a: any, b: any) => b.kills - a.kills)
      .slice(0, 10);

    // Fallback: use top team by kills
    const topFraggerTeam = standings.length > 0 
      ? [...standings].sort((a: any, b: any) => b.totalKills - a.totalKills)[0]
      : null;

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        bannerImage: tournament.bannerImage,
      },
      standings,
      organizer,
      branding: tournament.brandingData || null,
      topFraggers,
      topFraggerTeam,
    }, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Overlay API error:", error?.message, error?.stack);
    return NextResponse.json({ 
      error: error?.message || "Failed to load",
      details: String(error),
      tournament: null,
      standings: [],
      organizer: null,
    }, { status: 500 });
  }
}