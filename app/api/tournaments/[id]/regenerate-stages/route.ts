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
      include: { teams: true, matches: true, stages: true },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete existing stages + orphan matches (cascade deletes stage groups)
    await prisma.stage.deleteMany({ where: { tournamentId: id } });
    await prisma.match.deleteMany({ where: { tournamentId: id, stageId: null } });

    const created: any[] = [];
    let allTeams = [...tournament.teams];

    for (let sIdx = 0; sIdx < stagesConfig.length; sIdx++) {
      const cfg: any = stagesConfig[sIdx];
      const numGroups = Number(cfg.numGroups || cfg.groups || 1);
      const teamsPerGroup = Number(cfg.teamsPerGroup || 16);
      const matchesPerGroup = Number(cfg.matchesPerGroup || cfg.matches || 4);
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
          qualificationRule: {} as Prisma.InputJsonValue,
          scoringRule: (tournament.scoringRule as Prisma.InputJsonValue) || ({} as Prisma.InputJsonValue),
          mapRotation: tournament.mapRotation,
          groups: {
            create: Array.from({ length: numGroups }, (_, gIdx) => {
              const groupTeams = autoAssign && sIdx === 0
                ? allTeams.slice(gIdx * teamsPerGroup, (gIdx + 1) * teamsPerGroup).map(t => t.id)
                : [];
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
        include: { groups: true },
      });

      // Create matches for stage
      const stageMatches: Prisma.MatchCreateManyInput[] = [];
      for (let gIdx = 0; gIdx < numGroups; gIdx++) {
        const group = stage.groups[gIdx];
        for (let mIdx = 0; mIdx < matchesPerGroup; mIdx++) {
          stageMatches.push({
            tournamentId: id,
            stageId: stage.id,
            groupId: group.id,
            roundId: "no-round",
            lobbyId: `stage_${stage.id}_group_${group.id}`,
            name: `${stageName} - Match ${mIdx + 1}`,
            map: tournament.mapRotation[mIdx % Math.max(1, tournament.mapRotation.length)] || "Erangel",
            status: "pending",
            matchNumber: mIdx + 1,
          });
        }
      }
      if (stageMatches.length > 0) {
        await prisma.match.createMany({ data: stageMatches });
      }

      created.push({ stageName, numGroups, teamsPerGroup, matchesPerGroup });
    }

    return NextResponse.json({ success: true, created, message: `Created ${created.length} stages with matches` });
  } catch (err: any) {
    console.error("[REGENERATE_STAGES]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}