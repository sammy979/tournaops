import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: matchId } = await params;
  const body = await req.json();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if stage is locked
  if (match.stageId) {
    const stage = await prisma.stage.findUnique({ where: { id: match.stageId } });
    if (stage?.isLocked) {
      return NextResponse.json({ error: "Stage is locked" }, { status: 403 });
    }
  }

  const {
    results,             // Standard team results with kills, placement, points
    compensation,        // { teamId: { points, reason } }
    penalties,           // { teamId: { points, reason } }
    notes,               // Match-level notes
    screenshotUrl,       // Optional screenshot
  } = body;

  const scoring = match.tournament.scoringRule as any;

  // Recalculate totalPoints for each result including comp/penalty
  const enrichedResults = (results || []).map((r: any) => {
    const compPoints = compensation?.[r.teamId]?.points || 0;
    const penPoints = penalties?.[r.teamId]?.points || 0;

    const placePts = scoring.placementPoints?.[r.placement - 1] || 0;
    const killPts = (r.kills || 0) * (scoring.killPoints || 1);
    const wwcdBonus = r.placement === 1 && scoring.wwcdBonus ? scoring.wwcdBonus : 0;
    const totalPoints = Math.max(0, placePts + killPts + wwcdBonus + compPoints - penPoints);

    return {
      ...r,
      placementPoints: placePts,
      killPoints: killPts,
      wwcdBonus,
      compensationPoints: compPoints,
      penaltyPoints: penPoints,
      totalPoints,
    };
  });

  // Sort results by placement
  enrichedResults.sort((a: any, b: any) => a.placement - b.placement);

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: {
      status: "completed",
      results: enrichedResults,
      compensationData: compensation || {},
      penaltyData: penalties || {},
      notes: notes || null,
      screenshotUrl: screenshotUrl || null,
      endTime: new Date(),
    },
  });

  // Audit log if compensation or penalties applied
  if (compensation && Object.keys(compensation).length > 0) {
    await prisma.qualifierAuditLog.create({
      data: {
        tournamentId: match.tournamentId,
        stageId: match.stageId,
        action: "ADD_COMPENSATION",
        reason: `Compensation added to match ${match.name}`,
        metadata: { compensation, matchId },
        performedBy: session.userId,
      },
    });
  }
  if (penalties && Object.keys(penalties).length > 0) {
    await prisma.qualifierAuditLog.create({
      data: {
        tournamentId: match.tournamentId,
        stageId: match.stageId,
        action: "ADD_PENALTY",
        reason: `Penalty added to match ${match.name}`,
        metadata: { penalties, matchId },
        performedBy: session.userId,
      },
    });
  }

  return NextResponse.json({ match: updated });
}