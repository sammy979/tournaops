import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug: params.slug },
      include: {
        organizer: { select: { name: true } },
        stages: {
          where: { status: { not: "cancelled" } },
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            order: true,
            groupCount: true,
            teamsAdvancing: true,
          },
        },
        teams: {
          where: {},
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            tag: true,
            logoUrl: true,
            _count: { select: { players: true } },
          },
        },
        _count: { select: { teams: true } },
      },
    });

    if (!tournament || !tournament.isPublic) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error("Public tournament fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}