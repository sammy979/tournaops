import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST — advance verification status
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: matchId } = await params;
  const body = await req.json();
  const { action, note } = body;
  // action: "submit" | "verify" | "publish" | "dispute" | "reset"

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (match.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  let updateData: any = {};
  let auditAction = "";
  let auditReason = "";

  switch (action) {
    case "submit":
      updateData = {
        verificationStatus: "SUBMITTED",
        submittedAt: now,
        submittedBy: session.userId,
      };
      auditAction = "MATCH_SUBMITTED";
      auditReason = `Match ${match.name} results submitted for review`;
      break;

    case "verify":
      updateData = {
        verificationStatus: "VERIFIED",
        verifiedAt: now,
        verifiedBy: session.userId,
      };
      auditAction = "MATCH_VERIFIED";
      auditReason = note || `Match ${match.name} verified`;
      break;

    case "publish":
      updateData = {
        verificationStatus: "PUBLISHED",
        publishedAt: now,
        publishedBy: session.userId,
      };
      auditAction = "MATCH_PUBLISHED";
      auditReason = `Match ${match.name} results published`;
      break;

    case "dispute":
      if (!note || note.length < 5) {
        return NextResponse.json({ error: "Dispute reason required (min 5 chars)" }, { status: 400 });
      }
      updateData = {
        verificationStatus: "DISPUTED",
        disputeReason: note,
        disputeStatus: "OPEN",
      };
      auditAction = "MATCH_DISPUTED";
      auditReason = note;
      break;

    case "reset":
      updateData = {
        verificationStatus: "DRAFT",
        submittedAt: null,
        verifiedAt: null,
        publishedAt: null,
      };
      auditAction = "MATCH_RESET";
      auditReason = note || `Match ${match.name} reset to draft`;
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.match.update({
    where: { id: matchId },
    data: updateData,
  });

  // Audit log
  if (match.stageId) {
    await prisma.qualifierAuditLog.create({
      data: {
        tournamentId: match.tournamentId,
        stageId: match.stageId,
        action: auditAction,
        reason: auditReason,
        metadata: { matchId, previousStatus: match.status, newStatus: updated.status },
        performedBy: session.userId,
      },
    });
  }

  return NextResponse.json({ match: updated });
}
