import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";
import { validateBulkImport } from "@/lib/team-import-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/tournaments/[id]/teams/bulk
// Accepts: { teams: Array<{ name, tag?, seed? }> }
// Returns: { success, imported, skipped, warnings, teams }

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(
      id,
      session
    );
    if (!authorized) return errorResponse!;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const rawTeams = Array.isArray(body?.teams) ? body.teams : [];

    // Load tournament with current teams
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { select: { name: true } },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const existingNames = tournament.teams.map((t) => t.name);
    const currentCount = tournament.teams.length;
    const maxTeams = tournament.maxTeams;

    // Server-side validation using canonical parser
    const validation = validateBulkImport(
      rawTeams,
      existingNames,
      currentCount,
      maxTeams
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.errors[0],
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Cap import to remaining capacity
    const remaining = maxTeams - currentCount;
    const teamsToImport = validation.teams.slice(0, remaining);

    if (teamsToImport.length === 0) {
      return NextResponse.json(
        {
          error: `Tournament is full (${currentCount}/${maxTeams} teams)`,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Build create data with auto-seeding
    const createData = teamsToImport.map((t, idx) => ({
      name: t.name,
      tag: t.tag || null,
      seed: t.seed || currentCount + idx + 1,
      players: [],
      contact: null,
      tournamentId: id,
    }));

    // Create all teams in a transaction
    const created = await prisma.$transaction(
      createData.map((team) => prisma.team.create({ data: team }))
    );

    const skipped = rawTeams.length - teamsToImport.length;

    return NextResponse.json({
      success: true,
      imported: created.length,
      skipped,
      warnings: validation.warnings,
      teams: created,
    });
  } catch (err) {
    logError(err, "TEAM_BULK_IMPORT");
    return NextResponse.json(
      { error: "Import failed. Please try again." },
      { status: 500 }
    );
  }
}