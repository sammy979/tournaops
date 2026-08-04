import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateStandings, parseScoringConfig } from "@/lib/scoring-engine";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        status: true,
        prizePool: true,
        maxTeams: true,
        scoringRule: true,
        mapRotation: true,
        isPublic: true,
        discord: false,
        rules: true,
        bannerImage: true,
        brandingData: true,
        scheduleData: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            username: true,
            displayName: true,
          },
        },
        teams: {
          select: {
            id: true,
            name: true,
            tag: true,
            logo: true,
            seed: true,
          },
          orderBy: { seed: "asc" },
        },
        matches: {
          where: { status: "completed" },
          select: {
            id: true,
            name: true,
            map: true,
            matchNumber: true,
            results: true,
            status: true,
          },
          orderBy: { matchNumber: "asc" },
        },
        stages: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tournament || !tournament.isPublic) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Calculate official standings
    const scoringConfig = parseScoringConfig(tournament.scoringRule);
    const allResults: Array<{
      teamId: string;
      teamName: string;
      matchNumber: number;
      placement: number;
      kills: number;
    }> = [];

    for (const match of tournament.matches) {
      if (!match.results || !Array.isArray(match.results)) continue;
      for (const result of match.results as Array<Record<string, unknown>>) {
        allResults.push({
          teamId: String(result.teamId || ""),
          teamName: String(result.teamName || ""),
          matchNumber: match.matchNumber || 0,
          placement: Number(result.placement) || 0,
          kills: Number(result.kills) || 0,
        });
      }
    }

    const standings = calculateStandings(allResults, scoringConfig);

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        slug: tournament.slug,
        name: tournament.name,
        description: tournament.description,
        status: tournament.status,
        prizePool: tournament.prizePool,
        maxTeams: tournament.maxTeams,
        mapRotation: tournament.mapRotation,
        rules: tournament.rules,
        bannerImage: tournament.bannerImage,
        branding: tournament.brandingData || {},
        schedule: tournament.scheduleData || [],
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt,
        organizer: tournament.createdBy.displayName || tournament.createdBy.username,
        teams: tournament.teams,
        stages: tournament.stages,
        completedMatches: tournament.matches.length,
        scoring: {
          type: scoringConfig.type,
          killPoints: scoringConfig.killPoints,
          placementTable: scoringConfig.placementTable,
        },
      },
      standings: standings.slice(0, 50),
      champion: standings[0] || null,
    });
  } catch (err) {
    logError(err, "PUBLIC_TOURNAMENT_GET");
    return NextResponse.json(
      { error: "Failed to load tournament" },
      { status: 500 }
    );
  }
}