import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// GET /api/public/tournaments/[slug]/player-stats
// Public player statistics — no auth required
// Only returns aggregated data, not private player info
// ============================================================

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const tournament = await prisma.tournament.findFirst({
      where: { slug, isPublic: true },
      select: {
        id: true,
        name: true,
        teams: {
          include: {
            playersList: {
              select: {
                id: true,
                name: true,
                ign: true,
                photo: true,
                role: true,
                isCaptain: true,
                country: true,
                countryFlag: true,
              },
            },
          },
        },
        matches: {
          where: { status: "completed" },
          select: {
            id: true,
            results: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const teamMap = new Map(
      tournament.teams.map((t) => [t.id, t])
    );

    const playerStats = new Map<
      string,
      {
        playerName: string;
        ign?: string;
        photo?: string;
        role?: string;
        isCaptain: boolean;
        teamId: string;
        teamName: string;
        teamTag?: string;
        teamLogo?: string;
        matchesPlayed: number;
        totalKills: number;
        totalDamage: number;
        wwcdParticipations: number;
        avgKills: number;
      }
    >();

    for (const match of tournament.matches) {
      if (!Array.isArray(match.results)) continue;

      for (const teamResult of match.results as any[]) {
        if (!teamResult?.teamId || !Array.isArray(teamResult.playerResults))
          continue;

        const isWWCD =
          teamResult.wwcd === true || Number(teamResult.placement) === 1;
        const team = teamMap.get(teamResult.teamId);

        for (const pr of teamResult.playerResults) {
          if (!pr?.playerName) continue;

          const key = `${teamResult.teamId}::${pr.playerName.toLowerCase()}`;

          if (!playerStats.has(key)) {
            const registeredPlayer = team?.playersList.find(
              (p) =>
                p.name.toLowerCase() === pr.playerName.toLowerCase()
            );

            playerStats.set(key, {
              playerName: pr.playerName,
              ign: registeredPlayer?.ign || undefined,
              photo: registeredPlayer?.photo || undefined,
              role: registeredPlayer?.role || undefined,
              isCaptain: registeredPlayer?.isCaptain || false,
              teamId: teamResult.teamId,
              teamName: team?.name || "Unknown",
              teamTag: team?.tag || undefined,
              teamLogo: team?.logo || undefined,
              matchesPlayed: 0,
              totalKills: 0,
              totalDamage: 0,
              wwcdParticipations: 0,
              avgKills: 0,
            });
          }

          const s = playerStats.get(key)!;
          s.matchesPlayed++;
          s.totalKills += Number(pr.kills) || 0;
          s.totalDamage += Number(pr.damage) || 0;
          if (isWWCD) s.wwcdParticipations++;
        }
      }
    }

    for (const s of playerStats.values()) {
      if (s.matchesPlayed > 0) {
        s.avgKills =
          Math.round((s.totalKills / s.matchesPlayed) * 100) / 100;
      }
    }

    const players = Array.from(playerStats.values()).filter(
      (p) => p.matchesPlayed > 0
    );

    const topFraggers = [...players]
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 10);

    const topDamage = [...players]
      .sort((a, b) => b.totalDamage - a.totalDamage)
      .slice(0, 10);

    return NextResponse.json(
      {
        hasPlayerData: players.length > 0,
        totalPlayers: players.length,
        topFraggers,
        topDamage,
        mvp: topFraggers[0] || null,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("[PUBLIC_PLAYER_STATS]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to load player statistics" },
      { status: 500 }
    );
  }
}