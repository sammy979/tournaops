import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Match ID required" }, { status: 400 });

    const matchId = id.trim();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { tournament: { select: { userId: true } } },
    });

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { scheduledAt, map } = body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};

    if (scheduledAt !== undefined) {
      if (scheduledAt === null || scheduledAt === "") {
        updateData.scheduledAt = null;
      } else {
        const d = new Date(String(scheduledAt));
        if (isNaN(d.getTime())) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
        updateData.scheduledAt = d;
      }
    }

    if (map !== undefined) {
      updateData.map = map === null || map === "" ? "" : String(map).trim();
    }

    const updated = await prisma.match.update({ where: { id: matchId }, data: updateData });
    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error("[PATCH /api/matches/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}