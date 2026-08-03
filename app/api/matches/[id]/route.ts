import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// PUT — Update match results
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: matchId } = await params;
  const data = await req.json();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: data.status || "completed",
      results: data.results,
      endTime: new Date(),
      notes: data.notes,
      compensationData: data.compensationData,
      penaltyData: data.penaltyData,
    },
  });

  // Return full tournament with updated data
  const tournament = await prisma.tournament.findUnique({
    where: { id: match.tournamentId },
    include: { teams: true, matches: true, rounds: true },
  });

  return NextResponse.json({ match: updated, tournament });
}