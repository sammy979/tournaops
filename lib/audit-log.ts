// lib/audit-log.ts
// ============================================================
// Reusable audit logging for TournaOps
// All sensitive operations should log here.
// Never logs secrets, passwords, or tokens.
// ============================================================

import { prisma } from "@/lib/prisma";

export type AuditAction =
  // Match operations
  | "MATCH_RESULTS_SUBMITTED"
  | "MATCH_RESULTS_EDITED"
  | "MATCH_DELETED"
  // Stage operations
  | "STAGE_LOCKED"
  | "STAGE_UNLOCKED"
  | "AUTO_ADVANCE"
  | "FORCE_ADVANCE"
  | "TOURNAMENT_COMPLETED"
  | "CREATE_NEXT_STAGE"
  // Team operations
  | "TEAMS_BULK_IMPORTED"
  | "TEAM_DELETED"
  | "TEAMS_REGENERATED"
  // Override operations
  | "MANUAL_QUALIFICATION_OVERRIDE"
  | "MANUAL_ELIMINATION_OVERRIDE"
  // Tournament operations
  | "TOURNAMENT_STATUS_CHANGED"
  | "TOURNAMENT_REGENERATED";

export interface AuditLogEntry {
  tournamentId: string;
  stageId?: string;
  teamId?: string;
  teamName?: string;
  action: AuditAction;
  reason: string;
  metadata?: Record<string, unknown>;
  performedBy: string;
}

// ============================================================
// WRITE — fire-and-forget, never throws
// ============================================================

export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.qualifierAuditLog.create({
      data: {
        tournamentId: entry.tournamentId,
        stageId: entry.stageId,
        teamId: entry.teamId,
        teamName: entry.teamName,
        action: entry.action,
        reason: entry.reason,
        metadata: entry.metadata as any,
        performedBy: entry.performedBy,
      },
    });
  } catch (err) {
    // Never let audit log failure break the main operation
    console.warn(
      "[AUDIT_LOG] Failed to write:",
      err instanceof Error ? err.message : err
    );
  }
}

// ============================================================
// READ — for admin/organizer audit trail views
// ============================================================

export async function getAuditLog(
  tournamentId: string,
  options: {
    stageId?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    return await prisma.qualifierAuditLog.findMany({
      where: {
        tournamentId,
        ...(options.stageId ? { stageId: options.stageId } : {}),
      },
      orderBy: { performedAt: "desc" },
      take: options.limit || 50,
      skip: options.offset || 0,
    });
  } catch (err) {
    console.warn("[AUDIT_LOG] Read failed:", err instanceof Error ? err.message : err);
    return [];
  }
}