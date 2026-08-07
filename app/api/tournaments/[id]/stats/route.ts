import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
  if (!authorized) return errorResponse!;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: true,
      matches: {
        orderBy: { matchNumber: "asc" },
      },
    },
  });

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const completedMatches = tournament.matches.filter(m => m.status === "completed");

  const teamStats = tournament.teams.map((team) => {
    let totalKills = 0;
    let matchesPlayed = 0;
    let wwcds = 0;
    let top3 = 0;
    let placementSum = 0;
    let bestPlacement = 999;

    for (const match of completedMatches) {
      if (!Array.isArray(match.results)) continue;
      const result = (match.results as any[]).find((r: any) => r.teamId === team.id);
      if (!result) continue;

      const kills = Number(result.kills) || 0;
      const placement = Number(result.placement) || 0;

      totalKills += kills;
      matchesPlayed += 1;
      placementSum += placement || 16;

      if (placement === 1 || result.wwcd) wwcds += 1;
      if (placement > 0 && placement <= 3) top3 += 1;
      if (placement > 0 && placement < bestPlacement) bestPlacement = placement;
    }

    return {
      teamId: team.id,
      teamName: team.name,
      teamTag: team.tag,
      matchesPlayed,
      totalKills,
      avgKillsPerMatch: matchesPlayed ? Math.round((totalKills / matchesPlayed) * 10) / 10 : 0,
      avgPlacement: matchesPlayed ? Math.round((placementSum / matchesPlayed) * 10) / 10 : 0,
      bestPlacement: bestPlacement === 999 ? null : bestPlacement,
      wwcds,
      top3Finishes: top3,
    };
  });

  const topFraggers = [...teamStats].sort((a, b) => b.totalKills - a.totalKills);

  const totalKills = teamStats.reduce((s, t) => s + t.totalKills, 0);

  return NextResponse.json({
    teamStats,
    topFraggers: topFraggers.slice(0, 10),
    matchStats: {
      total: completedMatches.length,
      avgKillsPerMatch: completedMatches.length
        ? Math.round((totalKills / completedMatches.length) * 10) / 10
        : 0,
    },
    totalTeams: tournament.teams.length,
    totalMatches: completedMatches.length,
    totalKills,
  });
}