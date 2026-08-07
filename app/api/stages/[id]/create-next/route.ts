import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;
  const body = await req.json();

  const {
    nextStageName,
    nextStageType,
    matchesPerGroup,
    numGroups,
    mapRotation,
  } = body;

  const currentStage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: true, progressions: true },
  });

  if (!currentStage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (currentStage.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const qualified = currentStage.progressions.filter(p =>
    ["QUALIFIED", "WILDCARD", "MANUAL_ADVANCE"].includes(p.status)
  );

  if (qualified.length === 0) {
    return NextResponse.json({ error: "No qualified teams. Advance teams first." }, { status: 400 });
  }

  qualified.sort((a, b) => (a.finalPosition || 999) - (b.finalPosition || 999));

  const teamsPerGroup = Math.ceil(qualified.length / (numGroups || 1));

  const nextStage = await prisma.stage.create({
    data: {
      tournamentId: currentStage.tournamentId,
      name: nextStageName || "Grand Final",
      type: nextStageType || "GRAND_FINAL",
      order: currentStage.order + 1,
      status: "READY",
      numGroups: numGroups || 1,
      teamsPerGroup,
      matchesPerGroup: matchesPerGroup || 6,
      totalTeams: qualified.length,
      qualificationRule: {
        type: "TOP_N_OVERALL",
        count: 1,
      },
      teamsAdvancing: 0,
      teamsEliminated: 0,
      mapRotation: mapRotation || currentStage.mapRotation,
      scoringRule: (currentStage.scoringRule ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      tiebreakerOrder: currentStage.tiebreakerOrder,
      description: `Auto-created from ${currentStage.name}`,
      groups: {
        create: Array.from({ length: numGroups || 1 }, (_, i) => ({
          name: (numGroups || 1) === 1 ? "Grand Final Lobby" : `Group ${String.fromCharCode(65 + i)}`,
          order: i,
          teamIds: [],
          matchIds: [],
        })),
      },
    },
    include: { groups: { orderBy: { order: "asc" } } },
  });

  const groupAssignments: string[][] = Array.from({ length: numGroups || 1 }, () => []);
  let direction = 1;
  let groupIdx = 0;
  for (const q of qualified) {
    groupAssignments[groupIdx].push(q.teamId);
    if (direction === 1) {
      if (groupIdx === (numGroups || 1) - 1) direction = -1;
      else groupIdx++;
    } else {
      if (groupIdx === 0) direction = 1;
      else groupIdx--;
    }
  }

  await prisma.$transaction(
    nextStage.groups?.map((g, i) =>
      prisma.stageGroup.update({
        where: { id: g.id },
        data: { teamIds: groupAssignments[i] },
      })
    )
  );

  await prisma.teamProgression.updateMany({
    where: {
      stageId,
      status: { in: ["QUALIFIED", "WILDCARD", "MANUAL_ADVANCE"] },
    },
    data: { advancedToStageId: nextStage.id },
  });

  await prisma.stage.update({
    where: { id: stageId },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy: session.userId,
      status: "COMPLETED",
    },
  });

  await prisma.qualifierAuditLog.create({
    data: {
      tournamentId: currentStage.tournamentId,
      stageId,
      action: "CREATE_NEXT_STAGE",
      reason: `Auto-created ${nextStage.name} from ${currentStage.name} with ${qualified.length} qualified teams`,
      metadata: {
        newStageId: nextStage.id,
        newStageName: nextStage.name,
        qualifiedCount: qualified.length,
      },
      performedBy: session.userId,
    },
  });

  return NextResponse.json({
    success: true,
    nextStage: await prisma.stage.findUnique({
      where: { id: nextStage.id },
      include: { groups: true },
    }),
    qualifiedCount: qualified.length,
  });
}