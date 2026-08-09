import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

// ============================================================
// GET /api/tournaments/[id]/player-stats
// Aggregates player statistics from stored match playerResults JSON
// No schema changes required — uses existing data
// ============================================================

interface PlayerStat {
  playerId: string;
  playerName: string;
  ign?: string;
  photo?: string;
  role?: string;
  isCaptain: boolean;
  teamId: string;
  teamName: string;
  teamTag?: string;
  teamLogo?: string;
  // Match stats
  matchesPlayed: number;
  totalKills: number;
  totalDamage: number;
  totalAssists: number;
  totalRevives: number;
  headshotKills: number;
  survived: number;
  wwcdParticipations: number;
  // Calculated
  avgKills: number;
  avgDamage: number;
  killDeathRatio: number;
  headshotRate: number;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(
      id,
      session
    );
    if (!authorized) return errorResponse!;

    // Load tournament with teams + players + completed matches
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            playersList: true,
          },
        },
        matches: {
          where: { status: "completed" },
          select: {
            id: true,
            stageId: true,
            results: true,
            matchNumber: true,
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

    // Build team lookup
    const teamMap = new Map(
      tournament.teams.map((t) => ({
        id: t.id,
        name: t.name,
        tag: t.tag,
        logo: t.logo,
        players: t.playersList,
      }))
        .map((t) => [t.id, t])
    );

    // Build player stat map
    // Key: teamId + playerName (since playerResults use name not id)
    const playerStats = new Map<string, PlayerStat>();

    // Initialize from registered players
    for (const team of tournament.teams) {
      const teamInfo = teamMap.get(team.id);
      if (!teamInfo) continue;

      for (const player of team.playersList) {
        const key = `${team.id}::${player.name.toLowerCase()}`;
        playerStats.set(key, {
          playerId: player.id,
          playerName: player.name,
          ign: player.ign || undefined,
          photo: player.photo || undefined,
          role: player.role || undefined,
          isCaptain: player.isCaptain,
          teamId: team.id,
          teamName: team.name,
          teamTag: team.tag || undefined,
          teamLogo: team.logo || undefined,
          matchesPlayed: 0,
          totalKills: 0,
          totalDamage: 0,
          totalAssists: 0,
          totalRevives: 0,
          headshotKills: 0,
          survived: 0,
          wwcdParticipations: 0,
          avgKills: 0,
          avgDamage: 0,
          killDeathRatio: 0,
          headshotRate: 0,
        });
      }
    }

    // Aggregate from match playerResults
    let totalMatchesWithPlayerData = 0;

    for (const match of tournament.matches) {
      if (!Array.isArray(match.results)) continue;

      for (const teamResult of match.results as any[]) {
        if (!teamResult?.teamId) continue;
        if (!Array.isArray(teamResult.playerResults)) continue;

        const isWWCD =
          teamResult.wwcd === true || Number(teamResult.placement) === 1;
        totalMatchesWithPlayerData++;

        for (const pr of teamResult.playerResults) {
          if (!pr?.playerName) continue;

          const key = `${teamResult.teamId}::${pr.playerName.toLowerCase()}`;

          // Create entry if player not pre-registered (unregistered players)
          if (!playerStats.has(key)) {
            const team = teamMap.get(teamResult.teamId);
            playerStats.set(key, {
              playerId: `unregistered::${key}`,
              playerName: pr.playerName,
              teamId: teamResult.teamId,
              teamName: team?.name || teamResult.teamName || "Unknown Team",
              teamTag: team?.tag || undefined,
              teamLogo: team?.logo || undefined,
              isCaptain: false,
              matchesPlayed: 0,
              totalKills: 0,
              totalDamage: 0,
              totalAssists: 0,
              totalRevives: 0,
              headshotKills: 0,
              survived: 0,
              wwcdParticipations: 0,
              avgKills: 0,
              avgDamage: 0,
              killDeathRatio: 0,
              headshotRate: 0,
            });
          }

          const s = playerStats.get(key)!;
          s.matchesPlayed++;
          s.totalKills += Number(pr.kills) || 0;
          s.totalDamage += Number(pr.damage) || 0;
          s.totalAssists += Number(pr.assists) || 0;
          s.totalRevives += Number(pr.revives) || 0;
          s.headshotKills += Number(pr.headshotKills) || 0;
          if (pr.survived === true) s.survived++;
          if (isWWCD) s.wwcdParticipations++;
        }
      }
    }

    // Calculate derived stats
    for (const s of playerStats.values()) {
      if (s.matchesPlayed > 0) {
        s.avgKills = Math.round((s.totalKills / s.matchesPlayed) * 100) / 100;
        s.avgDamage = Math.round((s.totalDamage / s.matchesPlayed) * 10) / 10;
        const deaths = s.matchesPlayed - s.survived;
        s.killDeathRatio =
          deaths > 0
            ? Math.round((s.totalKills / deaths) * 100) / 100
            : s.totalKills;
        s.headshotRate =
          s.totalKills > 0
            ? Math.round((s.headshotKills / s.totalKills) * 1000) / 10
            : 0;
      }
    }

    // Only include players with at least 1 match played
    const allPlayers = Array.from(playerStats.values()).filter(
      (p) => p.matchesPlayed > 0
    );

    // Leaderboards
    const topFraggers = [...allPlayers]
      .sort((a, b) => b.totalKills - a.totalKills || b.avgKills - a.avgKills)
      .slice(0, 10);

    const topDamage = [...allPlayers]
      .sort((a, b) => b.totalDamage - a.totalDamage || b.avgDamage - a.avgDamage)
      .slice(0, 10);

    const mostConsistent = [...allPlayers]
      .filter((p) => p.matchesPlayed >= 2)
      .sort((a, b) => b.avgKills - a.avgKills || b.avgDamage - a.avgDamage)
      .slice(0, 10);

    const mvp = topFraggers[0] || null;

    const topKD = [...allPlayers]
      .filter((p) => p.matchesPlayed >= 2)
      .sort(
        (a, b) =>
          b.killDeathRatio - a.killDeathRatio ||
          b.totalKills - a.totalKills
      )
      .slice(0, 10);

    const topHeadshot = [...allPlayers]
      .filter((p) => p.totalKills >= 3)
      .sort(
        (a, b) =>
          b.headshotRate - a.headshotRate ||
          b.headshotKills - a.headshotKills
      )
      .slice(0, 10);

    const hasPlayerData = totalMatchesWithPlayerData > 0;

    return NextResponse.json({
      hasPlayerData,
      totalPlayers: allPlayers.length,
      totalMatchesWithPlayerData,
      leaderboards: {
        topFraggers,
        topDamage,
        mostConsistent,
        topKD,
        topHeadshot,
        mvp,
      },
      allPlayers: allPlayers.sort(
        (a, b) => b.totalKills - a.totalKills
      ),
    });
  } catch (err) {
    logError(err, "PLAYER_STATS");
    return NextResponse.json(
      { error: "Failed to load player statistics" },
      { status: 500 }
    );
  }
}