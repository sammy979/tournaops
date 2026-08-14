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
    const { matchesPerGroup, maps } = body;
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: {
        tournament: { select: { userId: true, id: true } },
        groups: true,
      },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const defaultMaps = ["Erangel", "Miramar", "Sanhok", "Vikendi"];
    const mapList = maps && maps.length > 0 ? maps : defaultMaps;
    const numMatches = matchesPerGroup || stage.matchesPerGroup || 4;
    const createdMatches = [];
    for (const group of stage.groups) {
      const existingCount = await prisma.match.count({ where: { stageId: id, groupId: group.id } });
      for (let i = 0; i < numMatches; i++) {
        const matchNum = existingCount + i + 1;
        const match = await prisma.match.create({
          data: {
            name: `${group.name} - Match ${matchNum}`,
            tournamentId: stage.tournament.id,
            stageId: id,
            groupId: group.id,
            roundId: id,
            lobbyId: group.id,
            map: mapList[i % mapList.length],
            status: "pending",
            matchNumber: matchNum,
          },
        });
        createdMatches.push(match);
      }
    }
    return NextResponse.json({ success: true, matches: createdMatches, count: createdMatches.length });
  } catch (error) {
    console.error("POST /api/stages/[id]/generate-matches:", error);
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 });
  }
}