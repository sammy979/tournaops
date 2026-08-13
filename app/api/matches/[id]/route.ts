import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
    }

    const matchId = id.trim();

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        stage: {
          include: {
            tournament: { select: { organizerId: true } },
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.stage.tournament.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { scheduledAt, map } = body as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};

    if (scheduledAt !== undefined) {
      if (scheduledAt === null || scheduledAt === "") {
        updateData.scheduledAt = null;
      } else {
        const d = new Date(String(scheduledAt));
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid scheduledAt date" }, { status: 400 });
        }
        updateData.scheduledAt = d;
      }
    }

    if (map !== undefined) {
      updateData.map = map === null || map === "" ? null : String(map).trim();
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: updateData,
    });

    return NextResponse.json({ success: true, match: updated });
  } catch (error) {
    console.error("[PATCH /api/matches/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}