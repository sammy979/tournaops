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
        createdAt: true,
        teams: {
          select: {
            id: true,
            name: true,
            tag: true,
            logo: true,
            players: true,
          },
          orderBy: { name: "asc" },
        },
        rounds: {
          select: {
            id: true,
            name: true,
            order: true,
          },
        },
        matches: {
          select: {
            id: true,
            name: true,
            status: true,
            results: true,
            matchNumber: true,
            map: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

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
    
    tournament.teams.forEach((team) => {
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

    tournament.matches.forEach((match) => {
      if (!match.results) return;
      
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

    const standings = Object.values(teamStandings)
      .sort((a: any, b: any) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
        return b.totalKills - a.totalKills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    return NextResponse.json({
      tournament,
      standings,
    }, {
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (error: any) {
    console.error("Public tournament API error:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed to load tournament",
    }, { status: 500 });
  }
}