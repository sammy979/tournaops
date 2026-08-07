import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    const teams = Array.isArray(body?.teams) ? body.teams : [];

    if (teams.length === 0) {
      return NextResponse.json({ error: "No teams to import" }, { status: 400 });
    }

    if (teams.length > 400) {
      return NextResponse.json({ error: "Max 400 teams" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true },
    });

    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (tournament.teams.length + teams.length > tournament.maxTeams) {
      return NextResponse.json({
        error: "Would exceed max teams (" + tournament.maxTeams + "). Currently have " + tournament.teams.length
      }, { status: 400 });
    }

    const validTeams = teams
      .filter((t: any) => t.name && typeof t.name === "string" && t.name.trim().length > 0)
      .map((t: any, idx: number) => ({
        name: String(t.name).trim().slice(0, 100),
        tag: t.tag ? String(t.tag).trim().slice(0, 20) : null,
        contact: t.contact ? String(t.contact).trim().slice(0, 100) : null,
        seed: t.seed ? Number(t.seed) : (tournament.teams.length + idx + 1),
        players: t.players || [],
        tournamentId: id,
      }));

    if (validTeams.length === 0) {
      return NextResponse.json({ error: "No valid teams (name required)" }, { status: 400 });
    }

    const created = await prisma.$transaction(
      validTeams.map((team: any) => prisma.team.create({ data: team }))
    );

    return NextResponse.json({
      success: true,
      imported: created.length,
      skipped: teams.length - validTeams.length,
      teams: created,
    });
  } catch (err: any) {
    logError(err, "TEAM_BULK_IMPORT");
    return NextResponse.json({ error: err?.message || "Import failed" }, { status: 500 });
  }
}