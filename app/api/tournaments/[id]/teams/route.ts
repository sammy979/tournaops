import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const teams = await prisma.team.findMany({
      where: { tournamentId: id },
      include: { playersList: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ teams });
  } catch (err) {
    logError(err, "TEAMS_GET");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Team name required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { _count: { select: { teams: true } } },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (tournament._count.teams >= tournament.maxTeams) {
      return NextResponse.json({ error: `Tournament is full (max ${tournament.maxTeams} teams)` }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: body.name.trim().slice(0, 100),
        tag: body.tag?.trim().slice(0, 10) || null,
        contact: body.contact?.trim() || null,
        seed: body.seed ? Number(body.seed) : null,
        logo: body.logo || null,
        players: body.players || [],
        tournamentId: id,
      },
      include: { playersList: true },
    });
    return NextResponse.json({ team }, { status: 201 });
  } catch (err) {
    logError(err, "TEAM_CREATE");
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 });
  }
}