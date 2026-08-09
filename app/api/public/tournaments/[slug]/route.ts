import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// PUBLIC tournament API — no authentication required
// NEVER exposes: userId, registrationData, private settings
// Standings use stored totalPoints from server-calculated results
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
        trophyImage: true,
        coverImage: true,
        sponsorLogos: true,
        rules: true,
        brandingData: true,
        createdAt: true,
        // userId intentionally excluded from public response
        userId: true, // needed to find organizer but NOT returned
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Fetch organizer display info only
    let organizer: { username: string; displayName: string; avatar: string | null } | null = null;
    try {
      const user = await prisma.user.findUnique({
        where: { id: tournament.userId },
        select: { username: true, displayName: true, avatar: true },
      });
      if (user) organizer = user;
    } catch {
      // Non-fatal
    }

    const teams = await prisma.team.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        tag: true,
        logo: true,
        banner: true,
        country: true,
        countryFlag: true,
        seed: true,
        playersList: {
          select: {
            id: true,
            name: true,
            ign: true,
            role: true,
            photo: true,
            isCaptain: true,
            country: true,
            countryFlag: true,
          },
        },
      },
      orderBy: { seed: "asc" },
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
        stageId: true,
        groupId: true,
        startTime: true,
        endTime: true,
      },
      orderBy: { matchNumber: "asc" },
    });

    const stages = await prisma.stage.findMany({
      where: { tournamentId: tournament.id },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        order: true,
        numGroups: true,
        teamsPerGroup: true,
        matchesPerGroup: true,
        totalTeams: true,
        teamsAdvancing: true,
        teamsEliminated: true,
        scoringRule: true,
        mapRotation: true,
        isLocked: true,
        groups: {
          select: {
            id: true,
            name: true,
            order: true,
            teamIds: true,
            status: true,
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    const rounds = await prisma.round.findMany({
      where: { tournamentId: tournament.id },
      select: { id: true, name: true, order: true },
    });

    // ── STANDINGS using stored server-calculated totalPoints ──
    // We trust r.totalPoints which was set by the server at result save time
    // We do NOT recalculate here to avoid three-engine inconsistency

    const teamStandings = new Map<string, any>();
    for (const team of teams) {
      teamStandings.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        teamTag: team.tag || null,
        teamLogo: team.logo || null,
        totalPoints: 0,
        totalKills: 0,
        matchesPlayed: 0,
        wwcdCount: 0,
        placementPoints: 0,
        killPoints: 0,
      });
    }

    for (const match of matches) {
      if (
        match.status !== "completed" ||
        !Array.isArray(match.results)
      )
        continue;

      for (const r of match.results as any[]) {
        if (!r?.teamId) continue;
        const s = teamStandings.get(r.teamId);
        if (!s) continue;

        // Use server-calculated totalPoints — single source of truth
        s.totalPoints += Number(r.totalPoints) || 0;
        s.placementPoints += Number(r.placementPoints) || 0;
        s.killPoints += Number(r.killPoints) || 0;
        s.totalKills += Number(r.kills) || 0;
        s.matchesPlayed += 1;
        if (r.wwcd === true || Number(r.placement) === 1) s.wwcdCount++;
      }
    }

    const standings = Array.from(teamStandings.values())
      .filter((s) => s.matchesPlayed > 0)
      .sort(
        (a, b) =>
          b.totalPoints - a.totalPoints ||
          b.wwcdCount - a.wwcdCount ||
          b.totalKills - a.totalKills
      )
      .map((s, i) => ({ ...s, rank: i + 1 }));

    // ── SLOT INFO ─────────────────────────────────────────────
    const slotsInfo = {
      maxTeams: tournament.maxTeams,
      approvedTeams: teams.length,
      available: Math.max(0, tournament.maxTeams - teams.length),
      fillPercentage: Math.min(
        100,
        Math.round((teams.length / tournament.maxTeams) * 100)
      ),
    };

    // Build response — never include userId in public response
    const { userId: _userId, ...tournamentPublic } = tournament as any;

    return NextResponse.json(
      {
        tournament: {
          ...tournamentPublic,
          teams,
          matches: matches.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            matchNumber: m.matchNumber,
            map: m.map,
            stageId: m.stageId,
            groupId: m.groupId,
            startTime: m.startTime,
            endTime: m.endTime,
            // Only include results for completed matches
            results:
              m.status === "completed" && Array.isArray(m.results)
                ? (m.results as any[]).map((r) => ({
                    teamId: r.teamId,
                    teamName: r.teamName,
                    placement: r.placement,
                    kills: r.kills,
                    totalPoints: r.totalPoints,
                    placementPoints: r.placementPoints,
                    killPoints: r.killPoints,
                    wwcd: r.wwcd,
                    damage: r.damage,
                  }))
                : [],
          })),
          stages,
          rounds,
        },
        standings,
        organizer,
        branding: tournament.brandingData || null,
        slotsInfo,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    // Never expose stack traces or internal details publicly
    console.error("[PUBLIC_TOURNAMENT_API]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Tournament not available" },
      { status: 500 }
    );
  }
}