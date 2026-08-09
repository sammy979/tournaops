import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyStageOwnership } from "@/lib/authorization";

async function checkOwner(stageId: string, userId: string, isAdmin: boolean) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: true },
  });
  if (!stage) return { error: "Not found", status: 404, stage: null };
  if (!isAdmin && stage.tournament.userId !== userId) {
    return { error: "Forbidden", status: 403, stage: null };
  }
  return { stage, error: null, status: 200 };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const { authorized, errorResponse } = await verifyStageOwnership(id, session);
  if (!authorized) return errorResponse!;

  const stage = await prisma.stage.findUnique({
    where: { id },
    include: {
      groups: true,
      progressions: { orderBy: { finalPosition: "asc" } },
      tournament: { select: { name: true, teams: true, matches: true } },
    },
  });

  if (!stage) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ stage });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const check = await checkOwner(id, session.userId, !!session.isAdmin);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  if (check.stage!.isLocked) {
    return NextResponse.json(
      { error: "Stage is locked. Unlock first to edit." },
      { status: 403 }
    );
  }

  const data = await req.json();

  const updated = await prisma.stage.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      status: data.status,
      numGroups: data.numGroups,
      teamsPerGroup: data.teamsPerGroup,
      matchesPerGroup: data.matchesPerGroup,
      totalTeams: data.totalTeams,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      qualificationRule: data.qualificationRule,
      teamsAdvancing: data.teamsAdvancing,
      mapRotation: data.mapRotation,
      scoringRule: data.scoringRule,
      tiebreakerOrder: data.tiebreakerOrder,
      description: data.description,
    },
    include: { groups: true },
  });

  return NextResponse.json({ stage: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const check = await checkOwner(id, session.userId, !!session.isAdmin);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  if (check.stage!.isLocked) {
    return NextResponse.json(
      { error: "Cannot delete locked stage" },
      { status: 403 }
    );
  }

  await prisma.stage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}