import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface MatchResultItem {
  teamId: string;
  placement?: number;
  kills?: number;
  wwcd?: boolean;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findFirst({
      where: { overlayToken: token },
      select: {
        id: true,
        name: true,
        status: true,
        scoringRule: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ 
        error: "Overlay not found",
        tournament: null,
        standings: [],
      }, { status: 404 });
    }

    // Get teams
    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        tag: true,
      },
    });

    // Get matches with results
    const matches = await prisma.match.findMany({
      where: { 
        tournamentId: tournament.id,
      },
      select: {
        id: true,
        status: true,
        results: true,
      },
    });

    // Parse scoring rule
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

    // Build initial standings for all teams
    const teamStandings: Record<string, any> = {};
    
    teams.forEach((team) => {
      teamStandings[team.id] = {
        teamId: team.id,
        teamName: team.name,
        teamTag: team.tag || null,
        totalPoints: 0,
        totalKills: 0,
        matchesPlayed: 0,
        wwcdCount: 0,
      };
    });

    // Process each match's JSON results
    matches.forEach((match) => {
      if (!match.results) return;
      
      // results can be an array of team results
      const results = Array.isArray(match.results) 
        ? match.results as MatchResultItem[]
        : [];
      
      results.forEach((result) => {
        if (!result.teamId) return;
        const team = teamStandings[result.teamId];
        if (!team) return;
        
        const kills = Number(result.kills) || 0;
        const placement = Number(result.placement) || 16;
        const placeIndex = Math.max(0, placement - 1);
        const placePoints = placementPoints[placeIndex] || 0;
        const isWWCD = placement === 1 || result.wwcd === true;
        const wwcdBonusValue = isWWCD ? wwcdBonus : 0;
        
        team.totalKills += kills;
        team.totalPoints += (kills * killPoints) + placePoints + wwcdBonusValue;
        team.matchesPlayed += 1;
        if (isWWCD) team.wwcdCount += 1;
      });
    });

    // Sort and rank
    const standings = Object.values(teamStandings)
      .sort((a: any, b: any) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
        return b.totalKills - a.totalKills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
      },
      standings,
      totalMatches: matches.filter(m => m.status === "completed").length,
    }, {
      headers: {
        "Cache-Control": "public, max-age=5",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Overlay API error:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed to load overlay",
      tournament: null,
      standings: [],
    }, { status: 500 });
  }
}