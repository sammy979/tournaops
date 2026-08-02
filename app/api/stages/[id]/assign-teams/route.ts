import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;
  const body = await req.json();
  const mode = body.mode as "random" | "seeded" | "manual" | "regional";
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

  const teams = await prisma.team.findMany({
    where: { tournamentId: stage.tournamentId },
    orderBy: { seed: "asc" },
  });

  const teamIds = teams.map(t => t.id);
  const numGroups = stage.groups.length;
  const groupAssignments: string[][] = Array.from({ length: numGroups }, () => []);

  if (mode === "manual" && manualAssignments) {
    // Use provided manual assignments
    stage.groups.forEach((g, i) => {
      groupAssignments[i] = manualAssignments[g.id] || [];
    });
  } else if (mode === "random") {
    // Shuffle and distribute evenly
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    shuffled.forEach((id, i) => {
      groupAssignments[i % numGroups].push(id);
    });
  } else if (mode === "seeded") {
    // Snake draft — Best team goes to Group A, 2nd to B, ..., 8th to H, 9th to H, 10th to G, etc.
    // This balances top teams across groups
    const sorted = teams
      .filter(t => t.seed !== null)
      .sort((a, b) => (a.seed || 999) - (b.seed || 999))
      .map(t => t.id);

    let direction = 1;
    let groupIdx = 0;
    for (const id of sorted) {
      groupAssignments[groupIdx].push(id);
      groupIdx += direction;
      if (groupIdx >= numGroups) { groupIdx = numGroups - 1; direction = -1; }
      else if (groupIdx < 0) { groupIdx = 0; direction = 1; }
    }
  } else if (mode === "regional") {
    // Same as random for now — could be enhanced with team metadata later
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    shuffled.forEach((id, i) => {
      groupAssignments[i % numGroups].push(id);
    });
  }

  // Update groups with new teamIds
  await prisma.$transaction(
    stage.groups.map((g, i) =>
      prisma.stageGroup.update({
        where: { id: g.id },
        data: { teamIds: groupAssignments[i] },
      })
    )
  );

  // Audit log
  await prisma.qualifierAuditLog.create({
    data: {
      tournamentId: stage.tournamentId,
      stageId,
      action: "GROUP_ASSIGNMENT",
      reason: `Teams assigned to groups (${mode} mode)`,
      metadata: { mode, teamCount: teamIds.length, groupCount: numGroups },
      performedBy: session.userId,
    },
  });

  const updatedStage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { groups: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ stage: updatedStage, mode });
}