import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { id: true, name: true, scoringRule: true, isPublic: true, userId: true },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    const progressions = await prisma.teamProgression.findMany({
      where: { tournamentId: id },
      orderBy: [{ points: "desc" }, { kills: "desc" }],
    });
    const teams = await prisma.team.findMany({
      where: { tournamentId: id },
      select: { id: true, name: true, tag: true, logo: true },
    });
    const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));
    const standings = progressions.map((p, index) => ({
      rank: index + 1,
      teamId: p.teamId,
      teamName: p.teamName,
      team: teamMap[p.teamId] ?? null,
      points: p.points,
      kills: p.kills,
      matchesPlayed: p.matchesPlayed,
      wwcds: p.wwcds,
      status: p.status,
    }));
    return NextResponse.json({ standings, tournament });
  } catch (error) {
    console.error("GET /api/tournaments/[id]/standings:", error);
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}