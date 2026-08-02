import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET tournament progression - shows team journey through all stages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: tournamentId } = await params;

  const stages = await prisma.stage.findMany({
    where: { tournamentId },
    include: {
      progressions: true,
    },
    orderBy: { order: "asc" },
  });

  const teams = await prisma.team.findMany({
    where: { tournamentId },
  });

  // Build team journey map
  const teamJourneys: Record<string, any> = {};

  for (const team of teams) {
    teamJourneys[team.id] = {
      teamId: team.id,
      teamName: team.name,
      stages: [],
      finalStatus: "PARTICIPATED",
    };
  }

  for (const stage of stages) {
    for (const prog of stage.progressions) {
      if (teamJourneys[prog.teamId]) {
        teamJourneys[prog.teamId].stages.push({
          stageId: stage.id,
          stageName: stage.name,
          stageType: stage.type,
          stageOrder: stage.order,
          position: prog.finalPosition,
          points: prog.points,
          kills: prog.kills,
          status: prog.status,
          manualOverride: prog.manualOverride,
        });
      }
    }
  }

  // Determine final status per team
  Object.values(teamJourneys).forEach((journey: any) => {
    if (journey.stages.length === 0) {
      journey.finalStatus = "NOT_PARTICIPATED";
    } else {
      const last = journey.stages[journey.stages.length - 1];
      journey.finalStatus = last.status;
      journey.finalPosition = last.position;
    }
  });

  return NextResponse.json({
    stages: stages.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      order: s.order,
      status: s.status,
      totalTeams: s.totalTeams,
      teamsAdvancing: s.teamsAdvancing,
      teamsEliminated: s.teamsEliminated,
    })),
    teamJourneys: Object.values(teamJourneys),
  });
}