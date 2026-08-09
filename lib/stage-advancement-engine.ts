// lib/stage-advancement-engine.ts
// ============================================================
// Canonical stage advancement engine for TournaOps
// All advancement logic lives here — not in route files.
// This engine is:
//   - Idempotent: running twice produces identical state
//   - Transactional: partial advancement never happens
//   - Audited: every advancement is logged
//   - Safe: locked stages cannot be re-advanced
// ============================================================

import { prisma } from "@/lib/prisma";

export interface StageCompletionStatus {
  isComplete: boolean;
  totalMatches: number;
  completedMatches: number;
  incompleteMatches: number;
  reason?: string;
}

export interface AdvancementResult {
  success: boolean;
  qualifiedCount: number;
  eliminatedCount: number;
  nextStageName: string;
  alreadyAdvanced: boolean;
  message: string;
}

export interface ForceAdvanceOptions {
  reason: string;
  performedBy: string;
}

// ============================================================
// CHECK STAGE COMPLETION
// ============================================================

export async function checkStageCompletion(
  stageId: string
): Promise<StageCompletionStatus> {
  const matches = await prisma.match.findMany({
    where: { stageId },
    select: { id: true, status: true, results: true },
  });

  if (matches.length === 0) {
    return {
      isComplete: false,
      totalMatches: 0,
      completedMatches: 0,
      incompleteMatches: 0,
      reason: "No matches found for this stage.",
    };
  }

  const completedMatches = matches.filter(
    (m) =>
      m.status === "completed" &&
      Array.isArray(m.results) &&
      (m.results as any[]).length > 0
  );

  const incompleteMatches = matches.length - completedMatches.length;

  return {
    isComplete: incompleteMatches === 0,
    totalMatches: matches.length,
    completedMatches: completedMatches.length,
    incompleteMatches,
    reason:
      incompleteMatches > 0
        ? `${incompleteMatches} match${incompleteMatches !== 1 ? "es" : ""} not yet complete.`
        : undefined,
  };
}

// ============================================================
// CALCULATE STAGE STANDINGS
// Uses only pre-calculated totalPoints stored in match results
// (server-authoritative, set at result save time)
// ============================================================

function calculateStageStandings(
  stageTeamIds: string[],
  stageMatches: any[],
  teamLookup: Map<string, any>
) {
  const teamStats = new Map<
    string,
    { teamId: string; teamName: string; teamTag: string; points: number; kills: number; wwcds: number }
  >();

  for (const teamId of stageTeamIds) {
    const team = teamLookup.get(teamId);
    if (team) {
      teamStats.set(teamId, {
        teamId,
        teamName: team.name,
        teamTag: team.tag || "",
        points: 0,
        kills: 0,
        wwcds: 0,
      });
    }
  }

  for (const match of stageMatches) {
    for (const r of (match.results as any[]) || []) {
      const s = teamStats.get(r.teamId);
      if (!s) continue;
      s.points += Number(r.totalPoints) || 0;
      s.kills += Number(r.kills) || 0;
      if (r.wwcd || Number(r.placement) === 1) s.wwcds++;
    }
  }

  return Array.from(teamStats.values()).sort(
    (a, b) =>
      b.points - a.points ||
      b.wwcds - a.wwcds ||
      b.kills - a.kills
  );
}

// ============================================================
// SNAKE SEEDING — distribute teams across groups
// ============================================================

function snakeSeed(
  teamIds: string[],
  groupCount: number
): string[][] {
  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  let direction = 1;
  let groupIdx = 0;

  for (const teamId of teamIds) {
    groups[groupIdx].push(teamId);
    if (direction === 1) {
      if (groupIdx === groupCount - 1) direction = -1;
      else groupIdx++;
    } else {
      if (groupIdx === 0) direction = 1;
      else groupIdx--;
    }
  }

  return groups;
}

// ============================================================
// CORE ADVANCEMENT — used by both auto and force advance
// ============================================================

export async function advanceStage(
  tournamentId: string,
  currentStageId: string,
  options: {
    isForced: boolean;
    performedBy: string;
    reason: string;
  }
): Promise<AdvancementResult> {
  const { isForced, performedBy, reason } = options;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      stages: {
        include: { groups: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      matches: true,
      teams: true,
    },
  });

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  const currentStage = tournament.stages.find((s) => s.id === currentStageId);
  if (!currentStage) {
    throw new Error("Stage not found");
  }

  // Prevent re-advancing an already completed+locked stage
  if (currentStage.isLocked && currentStage.status === "COMPLETED") {
    const nextStage = tournament.stages.find(
      (s) => s.order === currentStage.order + 1
    );
    const nextStageName = nextStage?.name || "next stage";

    // Check if advancement already recorded
    const existingProgressions = await prisma.teamProgression.count({
      where: { stageId: currentStageId, status: "QUALIFIED" },
    });

    if (existingProgressions > 0) {
      return {
        success: true,
        qualifiedCount: existingProgressions,
        eliminatedCount: 0,
        nextStageName,
        alreadyAdvanced: true,
        message: `Stage already advanced. ${existingProgressions} teams previously qualified.`,
      };
    }
  }

  // Check completion (unless forced)
  if (!isForced) {
    const completion = await checkStageCompletion(currentStageId);
    if (!completion.isComplete) {
      throw new Error(
        `Cannot advance: ${completion.reason} (${completion.completedMatches}/${completion.totalMatches} complete)`
      );
    }
  }

  const nextStage = tournament.stages.find(
    (s) => s.order === currentStage.order + 1
  );

  if (!nextStage) {
    // This is the final stage — mark tournament complete
    await prisma.$transaction([
      prisma.stage.update({
        where: { id: currentStageId },
        data: {
          status: "COMPLETED",
          isLocked: true,
          lockedAt: new Date(),
          lockedBy: performedBy,
        },
      }),
      prisma.qualifierAuditLog.create({
        data: {
          tournamentId,
          stageId: currentStageId,
          action: "TOURNAMENT_COMPLETED",
          reason: "Final stage completed",
          metadata: { isForced },
          performedBy,
        },
      }),
    ]);

    return {
      success: true,
      qualifiedCount: 0,
      eliminatedCount: 0,
      nextStageName: "TOURNAMENT COMPLETE",
      alreadyAdvanced: false,
      message: "Tournament complete. No next stage.",
    };
  }

  // Idempotency: if next stage already has teams, skip re-assignment
  const nextStageAlreadyHasTeams = nextStage.groups.some(
    (g) => Array.isArray(g.teamIds) && g.teamIds.length > 0
  );

  if (nextStageAlreadyHasTeams) {
    const existingProgressions = await prisma.teamProgression.count({
      where: { stageId: currentStageId, status: "QUALIFIED" },
    });

    return {
      success: true,
      qualifiedCount: existingProgressions,
      eliminatedCount: 0,
      nextStageName: nextStage.name,
      alreadyAdvanced: true,
      message: `Teams already advanced to ${nextStage.name}.`,
    };
  }

  // Build team lookup
  const teamLookup = new Map(tournament.teams.map((t) => [t.id, t]));

  // Collect all teams from current stage groups
  const stageTeamIds: string[] = [];
  for (const group of currentStage.groups) {
    for (const teamId of group.teamIds || []) {
      if (!stageTeamIds.includes(teamId)) {
        stageTeamIds.push(teamId);
      }
    }
  }

  const stageMatches = tournament.matches.filter(
    (m) => m.stageId === currentStageId && m.status === "completed"
  );

  const standings = calculateStageStandings(
    stageTeamIds,
    stageMatches,
    teamLookup
  );

  // Determine how many advance
  const nextCapacity =
    nextStage.groups.length * (nextStage.teamsPerGroup || 16);
  const advanceCount = Math.min(standings.length, nextCapacity);
  const qualified = standings.slice(0, advanceCount);
  const eliminated = standings.slice(advanceCount);

  // Distribute with snake seeding
  const groupCount = nextStage.groups.length;
  const groupAssignments = snakeSeed(
    qualified.map((q) => q.teamId),
    groupCount
  );

  // Execute in a single transaction
  await prisma.$transaction(async (tx) => {
    // Delete existing progressions for this stage (idempotent)
    await tx.teamProgression.deleteMany({ where: { stageId: currentStageId } });

    // Create qualified progressions
    for (let i = 0; i < qualified.length; i++) {
      const q = qualified[i];
      await tx.teamProgression.create({
        data: {
          tournamentId,
          stageId: currentStageId,
          teamId: q.teamId,
          teamName: q.teamName,
          finalPosition: i + 1,
          points: q.points,
          kills: q.kills,
          wwcds: q.wwcds,
          status: "QUALIFIED",
          advancedToStageId: nextStage.id,
          manualOverride: isForced,
          overrideNote: isForced ? reason : null,
        },
      });
    }

    // Create eliminated progressions
    for (let i = 0; i < eliminated.length; i++) {
      const e = eliminated[i];
      await tx.teamProgression.create({
        data: {
          tournamentId,
          stageId: currentStageId,
          teamId: e.teamId,
          teamName: e.teamName,
          finalPosition: qualified.length + i + 1,
          points: e.points,
          kills: e.kills,
          wwcds: e.wwcds,
          status: "ELIMINATED",
        },
      });
    }

    // Update next stage groups with snake-seeded teams
    for (let i = 0; i < nextStage.groups.length; i++) {
      await tx.stageGroup.update({
        where: { id: nextStage.groups[i].id },
        data: { teamIds: groupAssignments[i] || [] },
      });
    }

    // Lock current stage and activate next stage
    await tx.stage.update({
      where: { id: currentStageId },
      data: {
        status: "COMPLETED",
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: performedBy,
        teamsAdvancing: qualified.length,
        teamsEliminated: eliminated.length,
      },
    });

    await tx.stage.update({
      where: { id: nextStage.id },
      data: {
        status: "ACTIVE",
        totalTeams: qualified.length,
      },
    });

    // Audit log
    await tx.qualifierAuditLog.create({
      data: {
        tournamentId,
        stageId: currentStageId,
        action: isForced ? "FORCE_ADVANCE" : "AUTO_ADVANCE",
        reason,
        metadata: {
          nextStageId: nextStage.id,
          nextStageName: nextStage.name,
          qualifiedCount: qualified.length,
          eliminatedCount: eliminated.length,
          isForced,
          topQualified: qualified.slice(0, 5).map((q) => ({
            teamId: q.teamId,
            teamName: q.teamName,
            points: q.points,
          })),
        },
        performedBy,
      },
    });
  });

  return {
    success: true,
    qualifiedCount: qualified.length,
    eliminatedCount: eliminated.length,
    nextStageName: nextStage.name,
    alreadyAdvanced: false,
    message: `${qualified.length} teams advanced to ${nextStage.name}.`,
  };
}

// ============================================================
// AUTO-ADVANCE TRIGGER
// Called after every match result save
// ============================================================

export async function triggerAutoAdvanceIfComplete(
  tournamentId: string,
  stageId: string
): Promise<{ triggered: boolean; result?: AdvancementResult }> {
  const completion = await checkStageCompletion(stageId);

  if (!completion.isComplete) {
    return { triggered: false };
  }

  const result = await advanceStage(tournamentId, stageId, {
    isForced: false,
    performedBy: "system",
    reason: "All stage matches completed — automatic advancement triggered.",
  });

  return { triggered: true, result };
}