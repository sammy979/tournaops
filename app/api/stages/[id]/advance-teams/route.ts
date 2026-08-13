import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AdvanceSchema = z.object({
  teamsPerGroup: z.number().int().min(1).max(20),
  targetStageId: z.string().optional(),
  manualTeamIds: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stage = await prisma.stage.findUnique({
      where: { id: params.id },
      include: {
        tournament: {
          select: { userId: true, id: true },
          include: {
            stages: { orderBy: { order: "asc" } },
          },
        },
        groups: {
          include: {
            teamProgressions: {
              include: { team: true },
            },
          },
        },
      },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    if (stage.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = AdvanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { teamsPerGroup, targetStageId, manualTeamIds } = parsed.data;

    // Get results for all completed matches in this stage
    const matchResults = await prisma.matchResult.findMany({
      where: {
        match: {
          stageId: params.id,
          status: "completed",
        },
      },
      include: {
        team: true,
        match: { select: { groupName: true } },
      },
    });

    // Aggregate by team per group
    const teamGroupStats = new Map<string, {
      teamId: string;
      groupName: string;
      totalPoints: number;
      totalKills: number;
      avgPlacement: number;
      placements: number[];
    }>();

    for (const result of matchResults) {
      const key = `${result.match.groupName}::${result.teamId}`;
      if (!teamGroupStats.has(key)) {
        teamGroupStats.set(key, {
          teamId: result.teamId,
          groupName: result.match.groupName || "Unknown",
          totalPoints: 0,
          totalKills: 0,
          avgPlacement: 0,
          placements: [],
        });
      }
      const stats = teamGroupStats.get(key)!;
      stats.totalPoints += result.totalPoints;
      stats.totalKills += result.kills;
      stats.placements.push(result.placement);
    }

    // Calculate averages
    for (const stats of teamGroupStats.values()) {
      stats.avgPlacement = stats.placements.length > 0
        ? stats.placements.reduce((a, b) => a + b, 0) / stats.placements.length
        : 999;
    }

    let advancingTeamIds: string[];

    if (manualTeamIds && manualTeamIds.length > 0) {
      // Manual selection by organizer
      advancingTeamIds = manualTeamIds;
    } else {
      // Automatic: top N teams per group
      const groupTeams = new Map<string, typeof teamGroupStats extends Map<string, infer V> ? V[] : never[]>();

      for (const stats of teamGroupStats.values()) {
        if (!groupTeams.has(stats.groupName)) {
          groupTeams.set(stats.groupName, []);
        }
        groupTeams.get(stats.groupName)!.push(stats as any);
      }

      advancingTeamIds = [];
      for (const [, teams] of groupTeams.entries()) {
        const sorted = teams.sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
          if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
          return a.avgPlacement - b.avgPlacement;
        });
        advancingTeamIds.push(...sorted.slice(0, teamsPerGroup).map((t) => t.teamId));
      }
    }

    if (advancingTeamIds.length === 0) {
      return NextResponse.json({ error: "No teams to advance. Ensure matches are completed." }, { status: 400 });
    }

    // Find target stage
    let targetStage = targetStageId
      ? await prisma.stage.findUnique({ where: { id: targetStageId } })
      : null;

    if (!targetStage && !targetStageId) {
      // Auto-find next stage
      const nextStage = stage.tournament.stages.find(
        (s: any) => s.order === (stage.order || 0) + 1
      );
      targetStage = nextStage || null;
    }

    // Update team progressions
    await prisma.$transaction(async (tx) => {
      // Mark current stage teams as advanced or eliminated
      const allGroupTeamIds = Array.from(teamGroupStats.values()).map((s) => s.teamId);
      const advancingSet = new Set(advancingTeamIds);

      for (const teamId of allGroupTeamIds) {
        await tx.teamProgression.updateMany({
          where: { stageId: params.id, teamId },
          data: {
            status: advancingSet.has(teamId) ? "advanced" : "eliminated",
          },
        });
      }

      // Create progressions in next stage if applicable
      if (targetStage) {
        for (const teamId of advancingTeamIds) {
          const exists = await tx.teamProgression.findFirst({
            where: { stageId: targetStage.id, teamId },
          });
          if (!exists) {
            await tx.teamProgression.create({
              data: {
                stageId: targetStage.id,
                teamId,
                status: "active",
              },
            });
          }
        }

        // Activate next stage
        await tx.stage.update({
          where: { id: targetStage.id },
          data: { status: "active" },
        });
      }

      // Complete current stage
      await tx.stage.update({
        where: { id: params.id },
        data: { status: "completed" },
      });
    });

    return NextResponse.json({
      success: true,
      advancingCount: advancingTeamIds.length,
      advancingTeamIds,
      targetStageId: targetStage?.id || null,
      message: `${advancingTeamIds.length} teams advanced${targetStage ? ` to ${targetStage.name}` : ""}`,
    });
  } catch (error) {
    console.error("Team advancement error:", error);
    return NextResponse.json({ error: "Failed to advance teams" }, { status: 500 });
  }
}