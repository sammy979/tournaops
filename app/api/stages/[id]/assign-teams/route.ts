import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;
  const body = await req.json();
  const mode = body.mode as "random" | "seeded" | "snake" | "manual" | "regional" | "from_previous";
  const manualAssignments = body.assignments as Record<string, string[]> | undefined;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { groups: { orderBy: { order: "asc" } }, tournament: true },
  });

  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
  if (stage.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (stage.isLocked) {
    return NextResponse.json({ error: "Stage is locked" }, { status: 403 });
  }

  let teamIdsToDistribute: string[] = [];
  let teamSeedMap: Record<string, number> = {};

  // Determine which teams to distribute
  if (mode === "from_previous") {
    // Get teams that qualified from the previous stage
    const prevStage = await prisma.stage.findFirst({
      where: {
        tournamentId: stage.tournamentId,
        order: stage.order - 1,
      },
      include: { progressions: true },
    });

    if (!prevStage) {
      return NextResponse.json({ error: "No previous stage found" }, { status: 400 });
    }

    const qualified = prevStage.progressions.filter(p =>
      ["QUALIFIED", "WILDCARD", "MANUAL_ADVANCE"].includes(p.status)
    );

    // Sort by final position (best first)
    qualified.sort((a, b) => (a.finalPosition || 999) - (b.finalPosition || 999));

    teamIdsToDistribute = qualified.map(q => q.teamId);
    qualified.forEach((q, idx) => {
      teamSeedMap[q.teamId] = idx + 1;
    });
  } else {
    // Use all tournament teams
    const teams = await prisma.team.findMany({
      where: { tournamentId: stage.tournamentId },
      orderBy: { seed: "asc" },
    });
    teamIdsToDistribute = teams.map(t => t.id);
    teams.forEach((t, idx) => {
      teamSeedMap[t.id] = t.seed || (idx + 1);
    });
  }

  const numGroups = stage.groups.length;
  const groupAssignments: string[][] = Array.from({ length: numGroups }, () => []);

  if (mode === "manual" && manualAssignments) {
    stage.groups.forEach((g, i) => {
      groupAssignments[i] = manualAssignments[g.id] || [];
    });
  } else if (mode === "random") {
    const shuffled = [...teamIdsToDistribute].sort(() => Math.random() - 0.5);
    shuffled.forEach((id, i) => {
      groupAssignments[i % numGroups].push(id);
    });
  } else if (mode === "snake" || mode === "seeded" || mode === "from_previous") {
    // SNAKE SEEDING (proper implementation)
    // Round 1: Group A gets #1, B gets #2, C gets #3, D gets #4
    // Round 2: D gets #5, C gets #6, B gets #7, A gets #8 (reverse)
    // Round 3: A gets #9, B gets #10, ... (forward again)
    const sortedTeams = [...teamIdsToDistribute].sort((a, b) =>
      (teamSeedMap[a] || 999) - (teamSeedMap[b] || 999)
    );

    let direction = 1;
    let groupIdx = 0;

    for (let i = 0; i < sortedTeams.length; i++) {
      groupAssignments[groupIdx].push(sortedTeams[i]);

      if (direction === 1) {
        if (groupIdx === numGroups - 1) {
          direction = -1;
        } else {
          groupIdx++;
        }
      } else {
        if (groupIdx === 0) {
          direction = 1;
        } else {
          groupIdx--;
        }
      }
    }
  } else if (mode === "regional") {
    const shuffled = [...teamIdsToDistribute].sort(() => Math.random() - 0.5);
    shuffled.forEach((id, i) => {
      groupAssignments[i % numGroups].push(id);
    });
  }

  // Update groups
  await prisma.$transaction(
    stage.groups.map((g, i) =>
      prisma.stageGroup.update({
        where: { id: g.id },
        data: { teamIds: groupAssignments[i] },
      })
    )
  );

  // Update total teams
  await prisma.stage.update({
    where: { id: stageId },
    data: { totalTeams: teamIdsToDistribute.length },
  });

  // Audit log
  await prisma.qualifierAuditLog.create({
    data: {
      tournamentId: stage.tournamentId,
      stageId,
      action: "GROUP_ASSIGNMENT",
      reason: `Teams assigned via ${mode} mode`,
      metadata: {
        mode,
        teamCount: teamIdsToDistribute.length,
        groupCount: numGroups,
        source: mode === "from_previous" ? "previous_stage" : "all_teams",
      },
      performedBy: session.userId,
    },
  });

  const updatedStage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { groups: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({
    stage: updatedStage,
    mode,
    distributed: teamIdsToDistribute.length,
    groupDistribution: groupAssignments.map((g, i) => ({
      groupName: stage.groups[i].name,
      count: g.length,
    })),
  });
}