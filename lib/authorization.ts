import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { SessionPayload } from "@/lib/auth/session";

// ============================================================
// TOURNAMENT OWNERSHIP
// ============================================================

export async function verifyTournamentOwnership(
  tournamentId: string,
  session: SessionPayload
): Promise<{ authorized: boolean; errorResponse: NextResponse | null }> {
  if (session.isAdmin) {
    return { authorized: true, errorResponse: null };
  }

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { userId: true },
    });

    if (!tournament) {
      return {
        authorized: false,
        errorResponse: NextResponse.json({ error: "Tournament not found" }, { status: 404 }),
      };
    }

    if (tournament.userId !== session.userId) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: "You do not have permission to access this tournament" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, errorResponse: null };
  } catch {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authorization check failed" }, { status: 500 }),
    };
  }
}

// ============================================================
// STAGE OWNERSHIP
// ============================================================

export async function verifyStageOwnership(
  stageId: string,
  session: SessionPayload
): Promise<{ authorized: boolean; errorResponse: NextResponse | null; tournamentId?: string }> {
  if (session.isAdmin) {
    return { authorized: true, errorResponse: null };
  }

  try {
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      select: {
        tournamentId: true,
        tournament: { select: { userId: true } },
      },
    });

    if (!stage) {
      return {
        authorized: false,
        errorResponse: NextResponse.json({ error: "Stage not found" }, { status: 404 }),
      };
    }

    if (stage.tournament.userId !== session.userId) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: "You do not have permission to access this stage" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, errorResponse: null, tournamentId: stage.tournamentId };
  } catch {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authorization check failed" }, { status: 500 }),
    };
  }
}

// ============================================================
// MATCH OWNERSHIP — Match belongs directly to Tournament
// ============================================================

export async function verifyMatchOwnership(
  matchId: string,
  session: SessionPayload
): Promise<{ authorized: boolean; errorResponse: NextResponse | null }> {
  if (session.isAdmin) {
    return { authorized: true, errorResponse: null };
  }

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        tournament: { select: { userId: true } },
      },
    });

    if (!match) {
      return {
        authorized: false,
        errorResponse: NextResponse.json({ error: "Match not found" }, { status: 404 }),
      };
    }

    if (match.tournament.userId !== session.userId) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: "You do not have permission to access this match" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, errorResponse: null };
  } catch {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authorization check failed" }, { status: 500 }),
    };
  }
}

// ============================================================
// SCORING PRESET OWNERSHIP
// ============================================================

export async function verifyScoringPresetOwnership(
  presetId: string,
  session: SessionPayload
): Promise<{ authorized: boolean; errorResponse: NextResponse | null }> {
  if (session.isAdmin) {
    return { authorized: true, errorResponse: null };
  }

  try {
    const preset = await prisma.userScoringPreset.findUnique({
      where: { id: presetId },
      select: { userId: true },
    });

    if (!preset) {
      return {
        authorized: false,
        errorResponse: NextResponse.json({ error: "Preset not found" }, { status: 404 }),
      };
    }

    if (preset.userId !== session.userId) {
      return {
        authorized: false,
        errorResponse: NextResponse.json(
          { error: "You do not have permission to access this preset" },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, errorResponse: null };
  } catch {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authorization check failed" }, { status: 500 }),
    };
  }
}
