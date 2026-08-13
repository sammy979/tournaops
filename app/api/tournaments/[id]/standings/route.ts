import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface TeamStanding {
  teamId: string;
  teamName: string;
  teamTag?: string;
  groupName?: string;
  matchesPlayed: number;
  totalPoints: number;
  totalKills: number;
  placements: number[];
  wwcdCount: number;
  avgPlacement: number;
  rank?: number;
}

async function calculateStandings(stageId: string, groupName?: string): Promise<TeamStanding[]> {
  const whereClause: any = {
    match: {
      stageId,
      status: "completed",
    },
  };

  if (groupName) {
    whereClause.match.groupName = groupName;
  }

  const results = await prisma.matchResult.findMany({
    where: whereClause,
    include: {
      team: { select: { id: true, name: true, tag: true } },
      match: { select: { groupName: true } },
    },
  });

  // Aggregate by team
  const teamMap = new Map<string, TeamStanding>();

  for (const result of results) {
    const key = result.teamId;
    if (!teamMap.has(key)) {
      teamMap.set(key, {
        teamId: result.teamId,
        teamName: result.team.name,
        teamTag: result.team.tag || undefined,
        groupName: result.match.groupName || undefined,
        matchesPlayed: 0,
        totalPoints: 0,
        totalKills: 0,
        placements: [],
        wwcdCount: 0,
        avgPlacement: 0,
      });
    }

    const standing = teamMap.get(key)!;
    standing.matchesPlayed++;
    standing.totalPoints += result.totalPoints;
    standing.totalKills += result.kills;
    standing.placements.push(result.placement);
    if (result.isWWCD) standing.wwcdCount++;
  }

  // Calculate averages
  const standings = Array.from(teamMap.values()).map((s) => ({
    ...s,
    avgPlacement: s.placements.length > 0
      ? Math.round(s.placements.reduce((a, b) => a + b, 0) / s.placements.length * 10) / 10
      : 0,
  }));

  // Sort: total points DESC, kills DESC, avg placement ASC
  standings.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
    return a.avgPlacement - b.avgPlacement;
  });

  // Assign ranks
  standings.forEach((s, i) => {
    s.rank = i + 1;
  });

  return standings;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    const { searchParams } = new URL(req.url);
    const stageId = searchParams.get("stageId");
    const groupName = searchParams.get("group") || undefined;

    // Get tournament to verify it exists and check authorization
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      select: { userId: true, isPublic: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const isOrganizer = session?.userId === tournament.userId;
    if (!tournament.isPublic && !isOrganizer) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (!stageId) {
      // Return standings for all stages
      const stages = await prisma.stage.findMany({
        where: { tournamentId: params.id },
        orderBy: { order: "asc" },
        select: { id: true, name: true, type: true },
      });

      const allStandings = await Promise.all(
        stages.map(async (stage) => ({
          stage,
          standings: await calculateStandings(stage.id),
        }))
      );

      return NextResponse.json({ allStandings });
    }

    // Verify stage belongs to tournament
    const stage = await prisma.stage.findFirst({
      where: { id: stageId, tournamentId: params.id },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const standings = await calculateStandings(stageId, groupName);

    // Get groups for this stage
    const groups = await prisma.stageGroup.findMany({
      where: { stageId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({ standings, stage, groups });
  } catch (error) {
    console.error("Standings calculation error:", error);
    return NextResponse.json({ error: "Failed to calculate standings" }, { status: 500 });
  }
}