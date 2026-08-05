import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const tournament = await prisma.tournament.findFirst({
      where: { overlayToken: params.token },
      include: {
        teams: true,
        rounds: {
          include: {
            matches: {
              include: {
                results: {
                  include: { team: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Overlay not found" }, { status: 404 });
    }

    const allResults = tournament.rounds.flatMap((r) =>
      r.matches.flatMap((m) => m.results)
    );

    const scoringRule = (tournament.scoringRule as any) || {
      killPoints: 1,
      placementPoints: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 },
      wwcdBonus: 0,
    };

    const teamStandings: Record<string, any> = {};
    
    tournament.teams.forEach((team) => {
      teamStandings[team.id] = {
        teamId: team.id,
        teamName: team.name,
        teamTag: team.tag,
        totalPoints: 0,
        totalKills: 0,
        matchesPlayed: 0,
        wwcdCount: 0,
      };
    });

    allResults.forEach((result: any) => {
      const team = teamStandings[result.teamId];
      if (!team) return;
      
      const kills = result.kills || 0;
      const placement = result.placement || 16;
      const killPoints = kills * (scoringRule.killPoints || 1);
      const placePoints = scoringRule.placementPoints?.[placement] || 0;
      const wwcdBonus = result.wwcd ? (scoringRule.wwcdBonus || 0) : 0;
      
      team.totalKills += kills;
      team.totalPoints += killPoints + placePoints + wwcdBonus;
      team.matchesPlayed += 1;
      if (result.wwcd) team.wwcdCount += 1;
    });

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
    }, {
      headers: {
        "Cache-Control": "public, max-age=5",
      },
    });
  } catch (error) {
    console.error("Overlay API error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}