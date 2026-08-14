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
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: {
        tournament: { select: { userId: true, teams: { select: { id: true, name: true } } } },
      },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.stageGroup.deleteMany({ where: { stageId: id } });
    const teams = stage.tournament.teams;
    const numGroups = stage.numGroups || 1;
    const groups = [];
    for (let i = 0; i < numGroups; i++) {
      const groupTeams = teams.filter((_, idx) => idx % numGroups === i).map(t => t.id);
      const group = await prisma.stageGroup.create({
        data: {
          stageId: id,
          name: `Group ${String.fromCharCode(65 + i)}`,
          order: i,
          teamIds: groupTeams,
          matchIds: [],
          status: "PENDING",
        },
      });
      groups.push(group);
    }
    return NextResponse.json({ success: true, groups });
  } catch (error) {
    console.error("POST /api/stages/[id]/generate-groups:", error);
    return NextResponse.json({ error: "Failed to generate groups" }, { status: 500 });
  }
}