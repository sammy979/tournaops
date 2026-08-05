import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const owned = await verifyTournamentOwnership((await context.params).id, session.userId);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const tournament = await prisma.tournament.findUnique({
    where: { id: (await context.params).id },
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

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build stats
  const allResults = tournament.rounds.flatMap((r) =>
    r.matches.flatMap((m) => m.results)
  );

  const completedMatches = tournament.rounds.flatMap((r) =>
    r.matches.filter((m) => m.status === "completed")
  );

  // Per-team stats
  const teamStats = tournament.teams.map((team) => {
    const results = allResults.filter((r) => r.teamId === team.id);
    const kills = results.reduce((sum, r) => sum + (r.kills || 0), 0);
    const placements = results.map((r) => r.placement).filter(Boolean);
    const avgPlacement = placements.length
      ? placements.reduce((a, b) => a + b, 0) / placements.length
      : 0;
    const wwcds = results.filter((r) => r.wwcd).length;
    const top3 = results.filter((r) => r.placement <= 3).length;

    return {
      teamId: team.id,
      teamName: team.name,
      teamTag: team.tag,
      matchesPlayed: results.length,
      totalKills: kills,
      avgKillsPerMatch: results.length ? kills / results.length : 0,
      avgPlacement: Math.round(avgPlacement * 10) / 10,
      wwcds,
      top3Finishes: top3,
    };
  });

  // Sort by kills
  const topFraggers = [...teamStats].sort((a, b) => b.totalKills - a.totalKills);

  // Match stats
  const matchStats = {
    total: completedMatches.length,
    avgKillsPerMatch:
      completedMatches.length
        ? allResults.reduce((s, r) => s + (r.kills || 0), 0) / completedMatches.length
        : 0,
    highestKillMatch: completedMatches.reduce((best, match) => {
      const kills = match.results.reduce((s, r) => s + (r.kills || 0), 0);
      return kills > (best?.kills || 0) ? { id: match.id, kills } : best;
    }, null as { id: string; kills: number } | null),
  };

  return NextResponse.json({
    teamStats,
    topFraggers: topFraggers.slice(0, 10),
    matchStats,
    totalTeams: tournament.teams.length,
    totalMatches: completedMatches.length,
    totalKills: allResults.reduce((s, r) => s + (r.kills || 0), 0),
  });
}