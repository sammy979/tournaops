import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { teamIds, nextStageId, reason } = body;
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!teamIds || !Array.isArray(teamIds) || teamIds.length === 0) {
      return NextResponse.json({ error: "teamIds required" }, { status: 400 });
    }
    await prisma.teamProgression.updateMany({
      where: { stageId: id, teamId: { in: teamIds } },
      data: {
        status: "ADVANCED",
        advancedToStageId: nextStageId ?? null,
      },
    });
    return NextResponse.json({ success: true, advanced: teamIds.length });
  } catch (error) {
    console.error("POST /api/stages/[id]/advance-teams:", error);
    return NextResponse.json({ error: "Failed to advance teams" }, { status: 500 });
  }
}