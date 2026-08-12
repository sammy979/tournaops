import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyMatchOwnership(matchId: string, userId: string) {
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
  if (!match) return { match: null, authorized: false };
  return { match, authorized: match.stage.tournament.organizerId === userId };
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

    const { match, authorized } = await verifyMatchOwnership(params.id, session.userId);
    if (!match || !authorized) {
      return NextResponse.json({ error: "Match not found or unauthorized" }, { status: 404 });
    }

    const fullMatch = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        result: true,
        results: {
          include: { team: true },
          orderBy: { placement: "asc" },
        },
        stage: {
          select: { id: true, name: true, type: true, tournamentId: true },
        },
      },
    });

    return NextResponse.json({ match: fullMatch });
  } catch (error) {
    console.error("Match fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
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

    const { match, authorized } = await verifyMatchOwnership(params.id, session.userId);
    if (!match || !authorized) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = ["status", "scheduledAt", "map", "notes"];
    const updateData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) updateData[field] = body[field];
    }

    const updated = await prisma.match.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ match: updated });
  } catch (error) {
    console.error("Match update error:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}