import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyStageOwnership(stageId: string, userId: string) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: { select: { userId: true } } },
  });
  if (!stage) return { stage: null, authorized: false };
  return { stage, authorized: stage.tournament.userId === userId };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stage, authorized } = await verifyStageOwnership(params.id, session.userId);
    if (!stage || !authorized) {
      return NextResponse.json({ error: "Stage not found or unauthorized" }, { status: 404 });
    }

    const fullStage = await prisma.stage.findUnique({
      where: { id: params.id },
      include: {
        groups: {
          include: {
            teamProgressions: {
              include: {
                team: true,
              },
            },
          },
          orderBy: { name: "asc" },
        },
        matches: {
          include: {
            result: true,
            results: true,
          },
          orderBy: [{ groupName: "asc" }, { matchNumber: "asc" }],
        },
      },
    });

    return NextResponse.json({ stage: fullStage });
  } catch (error) {
    console.error("Stage fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stage" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { stage, authorized } = await verifyStageOwnership(params.id, session.userId);
    if (!stage || !authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ["name", "status", "teamsAdvancing", "groupCount", "teamsPerGroup"];
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    const updated = await prisma.stage.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ stage: updated });
  } catch (error) {
    console.error("Stage update error:", error);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}