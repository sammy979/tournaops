import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const TeamResultSchema = z.object({
  teamId: z.string().min(1),
  placement: z.number().int().min(1),
  kills: z.number().int().min(0).default(0),
  isWWCD: z.boolean().default(false),
  notes: z.string().optional(),
});

const SubmitResultsSchema = z.object({
  results: z.array(TeamResultSchema).min(1),
  confirmed: z.boolean().default(false),
  map: z.string().optional(),
});

// PUBG Mobile default scoring
function calculatePoints(
  placement: number,
  kills: number,
  scoringPreset?: any
): number {
  const placementPoints: Record<number, number> = scoringPreset?.placementPoints || {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
    6: 2, 7: 2, 8: 2, 9: 1, 10: 1,
    11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0,
  };
  const killPoints = scoringPreset?.killPoints || 1;
  const placPts = placementPoints[placement] ?? 0;
  return placPts + kills * killPoints;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        stage: {
          include: {
            tournament: {
              select: { organizerId: true, id: true },
            },
          },
        },
        result: true,
        results: true,
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.stage.tournament.organizerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Prevent overwriting confirmed results without explicit re-submission
    if (match.status === "completed" && match.results.length > 0) {
      const body_ = await req.json();
      if (!body_.forceUpdate) {
        return NextResponse.json(
          { error: "Match already has confirmed results. Use forceUpdate: true to overwrite." },
          { status: 409 }
        );
      }
    }

    const body = await req.json();
    const parsed = SubmitResultsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid result data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { results, confirmed, map } = parsed.data;

    // Validate team IDs belong to the tournament
    const tournamentId = match.stage.tournament.id;
    const teamIds = results.map((r) => r.teamId);
    const validTeams = await prisma.team.findMany({
      where: { id: { in: teamIds }, tournamentId },
      select: { id: true },
    });
    const validTeamIds = new Set(validTeams.map((t) => t.id));

    for (const result of results) {
      if (!validTeamIds.has(result.teamId)) {
        return NextResponse.json(
          { error: `Team ${result.teamId} does not belong to this tournament` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate placements
    const placements = results.map((r) => r.placement);
    const uniquePlacements = new Set(placements);
    if (uniquePlacements.size !== placements.length) {
      return NextResponse.json({ error: "Duplicate placement positions detected" }, { status: 400 });
    }

    // Only commit if confirmed
    if (!confirmed) {
      // Return preview with calculated points for organizer review
      const preview = results.map((r) => ({
        ...r,
        calculatedPoints: calculatePoints(r.placement, r.kills),
      }));
      return NextResponse.json({ preview, message: "Review the results before confirming" });
    }

    // Commit results atomically
    await prisma.$transaction(async (tx) => {
      // Delete existing results for this match
      await tx.matchResult.deleteMany({ where: { matchId: params.id } });

      // Update match
      await tx.match.update({
        where: { id: params.id },
        data: {
          status: "completed",
          map: map || null,
          completedAt: new Date(),
        },
      });

      // Create new results
      for (const result of results) {
        const totalPoints = calculatePoints(result.placement, result.kills);
        await tx.matchResult.create({
          data: {
            matchId: params.id,
            teamId: result.teamId,
            placement: result.placement,
            kills: result.kills,
            totalPoints,
            isWWCD: result.isWWCD,
            notes: result.notes || null,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Results saved successfully",
    });
  } catch (error) {
    console.error("Result submission error:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
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

    const match = await prisma.match.findUnique({
      where: { id: params.id },
      include: {
        stage: {
          include: {
            tournament: { select: { organizerId: true } },
          },
        },
      },
    });

    if (!match || match.stage.tournament.organizerId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const results = await prisma.matchResult.findMany({
      where: { matchId: params.id },
      include: { team: { select: { id: true, name: true, tag: true } } },
      orderBy: { placement: "asc" },
    });

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}