import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { calculateQualification, GroupResult, TeamStanding } from "@/lib/scoring/qualification";

// GET preview of who would qualify (dry-run)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { groups: true, tournament: true },
  });

  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stage.tournament.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Compute standings for each group from completed matches
  const groupResults = await computeGroupResults(stage);
  const rule = stage.qualificationRule as any;

  const result = calculateQualification(rule, groupResults);
  return NextResponse.json({ preview: result, stage });
}

// POST actually advance the teams
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: stageId } = await params;

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { groups: true, tournament: true },
  });

  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stage.tournament.userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (stage.isLocked) return NextResponse.json({ error: "Stage locked" }, { status: 403 });

  const body = await req.json();
  const nextStageId = body.nextStageId as string | undefined;
  const overrides = body.overrides as any;

  // Compute results
  const groupResults = await computeGroupResults(stage);
  const rule = { ...(stage.qualificationRule as any), ...overrides };
  const result = calculateQualification(rule, groupResults);

  // Save TeamProgression records
  await prisma.$transaction(async (tx) => {
    // Delete existing progressions for this stage (in case re-running)
    await tx.teamProgression.deleteMany({ where: { stageId } });

    // Create qualified
    for (const team of [...result.qualified, ...result.wildcards]) {
      await tx.teamProgression.create({
        data: {
          tournamentId: stage.tournamentId,
          stageId,
          teamId: team.teamId,
          teamName: team.teamName,
          finalPosition: team.rank,
          points: team.points,
          kills: team.kills,
          status: team.reason === "WILDCARD" ? "WILDCARD"
                : team.reason === "MANUAL_ADVANCE" ? "MANUAL_ADVANCE"
                : "QUALIFIED",
          advancedToStageId: nextStageId,
          manualOverride: team.reason.startsWith("MANUAL"),
        },
      });
    }

    // Create eliminated
    for (const team of result.eliminated) {
      await tx.teamProgression.create({
        data: {
          tournamentId: stage.tournamentId,
          stageId,
          teamId: team.teamId,
          teamName: team.teamName,
          finalPosition: team.rank,
          points: team.points,
          kills: team.kills,
          status: team.reason === "MANUAL_ELIMINATE" ? "MANUAL_ELIMINATE" : "ELIMINATED",
          manualOverride: team.reason === "MANUAL_ELIMINATE",
        },
      });
    }

    // Update stage counts
    await tx.stage.update({
      where: { id: stageId },
      data: {
        teamsAdvancing: result.summary.totalQualified,
        teamsEliminated: result.summary.totalEliminated,
        status: "COMPLETED",
      },
    });

    // Assign teams to next stage groups (evenly distributed)
    if (nextStageId) {
      const nextStage = await tx.stage.findUnique({
        where: { id: nextStageId },
        include: { groups: true },
      });

      if (nextStage) {
        const qualifiedIds = [...result.qualified, ...result.wildcards].map(t => t.teamId);
        const groupCount = nextStage.groups.length;
        const teamsPerGroup = Math.ceil(qualifiedIds.length / groupCount);

        for (let i = 0; i < nextStage.groups.length; i++) {
          const start = i * teamsPerGroup;
          const end = start + teamsPerGroup;
          const groupTeamIds = qualifiedIds.slice(start, end);

          await tx.stageGroup.update({
            where: { id: nextStage.groups[i].id },
            data: { teamIds: groupTeamIds },
          });
        }

        await tx.stage.update({
          where: { id: nextStageId },
          data: { status: "READY", totalTeams: qualifiedIds.length },
        });
      }
    }
  });

  return NextResponse.json({
    success: true,
    result,
    message: `${result.summary.totalQualified} teams advanced, ${result.summary.totalEliminated} eliminated`,
  });
}

// ─────────────────────────────────────────────────────────
// Helper: Compute group standings from match results
// ─────────────────────────────────────────────────────────
async function computeGroupResults(stage: any): Promise<GroupResult[]> {
  const matches = await prisma.match.findMany({
    where: {
      tournamentId: stage.tournamentId,
      OR: stage.groups.map((g: any) => ({ lobbyId: g.id })),
      status: "completed",
    },
  });

  const results: GroupResult[] = [];

  for (const group of stage.groups) {
    const groupMatches = matches.filter((m: any) =>
      group.matchIds.includes(m.id) || m.lobbyId === group.id
    );

    const teamMap: Record<string, TeamStanding> = {};

    // Initialize teams in group
    for (const teamId of group.teamIds) {
      const team = await prisma.team.findUnique({ where: { id: teamId } });
      if (team) {
        teamMap[teamId] = {
          teamId, teamName: team.name,
          rank: 0, points: 0, kills: 0, damage: 0, wwcds: 0, matchesPlayed: 0,
        };
      }
    }

    // Aggregate results
    groupMatches.forEach((match: any) => {
      const matchResults = (match.results as any[]) || [];
      matchResults.forEach((r: any) => {
        if (!teamMap[r.teamId]) return;
        const entry = teamMap[r.teamId];
        entry.points += r.totalPoints || 0;
        entry.kills += r.kills || 0;
        entry.damage += r.damage || 0;
        if (r.wwcd) entry.wwcds += 1;
        entry.matchesPlayed += 1;
      });
    });

    // Sort and rank
    const sorted = Object.values(teamMap).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.kills !== a.kills) return b.kills - a.kills;
      return b.damage - a.damage;
    });
    sorted.forEach((t, i) => { t.rank = i + 1; });

    results.push({
      groupId: group.id,
      groupName: group.name,
      standings: sorted,
    });
  }

  return results;
}