import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { parseTeamImport } from "@/lib/team-import-parser";

// POST /api/tournaments/[id]/teams/preview
// Body: { text: string }
// Returns: full TeamImportPreview — no database writes

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

    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: "Text too large (max 50,000 characters)" },
        { status: 400 }
      );
    }

    // Load current tournament state
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        maxTeams: true,
        teams: { select: { name: true } },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const existingNames = tournament.teams.map((t) => t.name);
    const currentCount = tournament.teams.length;
    const maxTeams = tournament.maxTeams;

    // Parse and preview — no writes
    const preview = parseTeamImport(
      text,
      existingNames,
      currentCount,
      maxTeams
    );

    return NextResponse.json({ preview });
  } catch (err) {
    console.error("[TEAM_PREVIEW]", err);
    return NextResponse.json(
      { error: "Preview failed" },
      { status: 500 }
    );
  }
}