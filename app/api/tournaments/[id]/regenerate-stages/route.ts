import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import type { Prisma } from "@prisma/client";

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
    const stagesConfig = Array.isArray(body.stages) ? body.stages : [];
    const autoAssign = body.autoAssignTeams === true;

    if (stagesConfig.length === 0) {
      return NextResponse.json({ error: "No stages provided" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ============================================================
    // NUCLEAR CLEANUP - delete EVERYTHING for this tournament
    // in the correct order to respect foreign key constraints
    // ============================================================

    // Step 1: Unlock all stages (so they can be deleted)
    await prisma.stage.updateMany({
      where: { tournamentId: id },
      data: { isLocked: false, lockedAt: null, lockedBy: null },
    });

    // Step 2: Delete ALL matches for this tournament (both stage-tied and orphaned)
    const deletedMatches = await prisma.match.deleteMany({
      where: { tournamentId: id },
    });

    // Step 3: Delete all team progressions
    const deletedProgressions = await prisma.teamProgression.deleteMany({
      where: { tournamentId: id },
    });

    // Step 4: Delete all audit logs for stages
    await prisma.qualifierAuditLog.deleteMany({
      where: { tournamentId: id },
    });

    // Step 5: Delete all stages (cascade deletes groups)
    const deletedStages = await prisma.stage.deleteMany({
      where: { tournamentId: id },
    });

    console.log("[REGENERATE] Cleanup:", {
      matches: deletedMatches.count,
      progressions: deletedProgressions.count,
      stages: deletedStages.count,
    });

    // ============================================================
    // FRESH BUILD - create stages, groups, matches from scratch
    // ============================================================

    const created: any[] = [];
    const allTeams = [...tournament.teams];

    for (let sIdx = 0; sIdx < stagesConfig.length; sIdx++) {
      const cfg: any = stagesConfig[sIdx];
      const numGroups = Math.max(1, Math.min(16, Number(cfg.numGroups || cfg.groups || 1)));
      const teamsPerGroup = Math.max(1, Math.min(64, Number(cfg.teamsPerGroup || 16)));
      const matchesPerGroup = Math.max(1, Math.min(20, Number(cfg.matchesPerGroup || cfg.matches || 4)));
      const stageName = String(cfg.name || `Stage ${sIdx + 1}`);

      const stage = await prisma.stage.create({
        data: {
          tournamentId: id,
          name: stageName,
          type: cfg.type || "GROUP_STAGE",
          order: sIdx,
          status: sIdx === 0 ? "ACTIVE" : "DRAFT",
          numGroups,
          teamsPerGroup,
          matchesPerGroup,
          totalTeams: numGroups * teamsPerGroup,
          qualificationRule: {
            type: "TOP_N_PER_GROUP",
            count: Math.max(1, Math.floor(teamsPerGroup / 2)),
          } as Prisma.InputJsonValue,
          scoringRule: (tournament.scoringRule as Prisma.InputJsonValue) || ({} as Prisma.InputJsonValue),
          mapRotation: tournament.mapRotation,
          groups: {
            create: Array.from({ length: numGroups }, (_, gIdx) => {
              // Snake seeding for Stage 1 auto-assign
              let groupTeams: string[] = [];
              if (autoAssign && sIdx === 0) {
                // Distribute teams across groups using snake pattern
                for (let i = 0; i < allTeams.length; i++) {
                  const targetGroup = Math.floor(i / teamsPerGroup) < numGroups
                    ? Math.floor(i / teamsPerGroup)
                    : -1;
                  if (targetGroup === gIdx) {
                    groupTeams.push(allTeams[i].id);
                  }
                }
              }
              return {
                name: numGroups === 1 ? "Main Group" : `Group ${String.fromCharCode(65 + gIdx)}`,
                order: gIdx,
                teamIds: groupTeams,
                matchIds: [],
                status: "PENDING",
              };
            }),
          },
        },
        include: { groups: { orderBy: { order: "asc" } } },
      });

      // Create matches per group per matchesPerGroup
      const stageMatches: Prisma.MatchCreateManyInput[] = [];
      for (let gIdx = 0; gIdx < numGroups; gIdx++) {
        const group = stage.groups[gIdx];
        const maps = tournament.mapRotation.length > 0 ? tournament.mapRotation : ["Erangel"];
        for (let mIdx = 0; mIdx < matchesPerGroup; mIdx++) {
          stageMatches.push({
            tournamentId: id,
            stageId: stage.id,
            groupId: group.id,
            roundId: "no-round",
            lobbyId: `stage_${stage.id}_group_${group.id}`,
            name: numGroups === 1
              ? `${stageName} - Match ${mIdx + 1}`
              : `${stageName} - ${group.name} - Match ${mIdx + 1}`,
            map: maps[mIdx % maps.length],
            status: "pending",
            matchNumber: mIdx + 1,
          });
        }
      }
      if (stageMatches.length > 0) {
        await prisma.match.createMany({ data: stageMatches });
      }

      created.push({
        stageName,
        numGroups,
        teamsPerGroup,
        matchesPerGroup,
        matchesCreated: stageMatches.length,
        teamsAssigned: autoAssign && sIdx === 0 ? Math.min(allTeams.length, numGroups * teamsPerGroup) : 0,
      });
    }

    const totalMatchesCreated = created.reduce((s, c) => s + c.matchesCreated, 0);

    return NextResponse.json({
      success: true,
      cleaned: {
        matches: deletedMatches.count,
        stages: deletedStages.count,
        progressions: deletedProgressions.count,
      },
      created,
      totalMatchesCreated,
      message: `Deleted ${deletedMatches.count} old matches + ${deletedStages.count} old stages. Created ${created.length} stages with ${totalMatchesCreated} fresh matches.`,
    });
  } catch (err: any) {
    console.error("[REGENERATE_STAGES]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}