import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;
  const body = await req.json();

  const { teamId, action, reason } = body;
  // action: "FORCE_QUALIFY" | "FORCE_ELIMINATE" | "REVERT"

  if (!reason || reason.trim().length < 5) {
    return NextResponse.json({ error: "Reason required (min 5 characters)" }, { status: 400 });
  }
  if (!teamId || !action) {
    return NextResponse.json({ error: "teamId and action required" }, { status: 400 });
  }

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { tournament: true },
  });
  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
  if (stage.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (stage.isLocked) {
    return NextResponse.json({ error: "Stage is locked. Unlock to override." }, { status: 403 });
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const newStatus = action === "FORCE_QUALIFY" ? "MANUAL_ADVANCE"
                  : action === "FORCE_ELIMINATE" ? "MANUAL_ELIMINATE"
                  : "PENDING";

  // Upsert progression record
  const progression = await prisma.teamProgression.upsert({
    where: { stageId_teamId: { stageId, teamId } },
    create: {
      tournamentId: stage.tournamentId,
      stageId,
      teamId,
      teamName: team.name,
      status: newStatus,
      manualOverride: true,
      overrideNote: reason,
      points: 0,
      kills: 0,
    },
    update: {
      status: newStatus,
      manualOverride: action !== "REVERT",
      overrideNote: reason,
    },
  });

  // Audit log
  await prisma.qualifierAuditLog.create({
    data: {
      tournamentId: stage.tournamentId,
      stageId,
      teamId,
      teamName: team.name,
      action,
      reason,
      metadata: { previousStatus: progression.status, newStatus },
      performedBy: session.userId,
    },
  });

  return NextResponse.json({ progression, action, reason });
}