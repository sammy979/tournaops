import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface TeamRow {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  teamTag?: string;
  groupId: string;
  groupName: string;
  matches: number;
  wwcds: number;
  placementPoints: number;
  kills: number;
  killPoints: number;
  compensationPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  matchResults: Record<string, any>;
  rank: number;
  qualificationStatus: "QUALIFIED" | "ELIMINATED" | "UNDER_REVIEW" | "PENDING";
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: stageId } = await params;
  const url = new URL(req.url);
  const groupFilter = url.searchParams.get("group"); // group ID or "all"
  const statusFilter = url.searchParams.get("status"); // qualified / eliminated / all

  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: {
      groups: { orderBy: { order: "asc" } },
      progressions: true,
    },
  });

  if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

  // Get all matches for this stage
  const matches = await prisma.match.findMany({
    where: {
      tournamentId: stage.tournamentId,
      stageId,
    },
    orderBy: { matchNumber: "asc" },
  });

  // Get all teams referenced in this stage
  const allTeamIds = new Set<string>();
  stage.groups.forEach(g => g.teamIds.forEach(id => allTeamIds.add(id)));
  const teams = await prisma.team.findMany({
    where: { id: { in: Array.from(allTeamIds) } },
  });
  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  // Build progressions map
  const progressionMap = Object.fromEntries(
    stage.progressions.map(p => [p.teamId, p])
  );

  // Group filter
  const filteredGroups = groupFilter && groupFilter !== "all"
    ? stage.groups.filter(g => g.id === groupFilter)
    : stage.groups;

  // Build leaderboard rows
  const rows: TeamRow[] = [];
  const scoring = stage.scoringRule as any;

  for (const group of filteredGroups) {
    for (const teamId of group.teamIds) {
      const team = teamMap[teamId];
      if (!team) continue;

      const teamMatches = matches.filter(m =>
        m.groupId === group.id ||
        (m.results as any[])?.some((r: any) => r.teamId === teamId)
      );

      let matchesPlayed = 0, wwcds = 0, placementPoints = 0, kills = 0, killPoints = 0;
      let compensationPoints = 0, penaltyPoints = 0, totalPoints = 0;
      const matchResults: Record<string, any> = {};

      teamMatches.forEach(match => {
        if (match.status !== "completed" || !match.results) return;
        const results = match.results as any[];
        const r = results.find(x => x.teamId === teamId);
        if (!r) return;

        matchesPlayed++;
        if (r.placement === 1) wwcds++;
        placementPoints += r.placementPoints || 0;
        kills += r.kills || 0;
        killPoints += r.killPoints || 0;
        compensationPoints += r.compensationPoints || 0;
        penaltyPoints += r.penaltyPoints || 0;
        totalPoints += r.totalPoints || 0;
        matchResults[match.id] = {
          placement: r.placement,
          kills: r.kills,
          totalPoints: r.totalPoints,
        };
      });

      const progression = progressionMap[teamId];
      let qualStatus: TeamRow["qualificationStatus"] = "PENDING";
      if (progression) {
        if (["QUALIFIED", "WILDCARD", "MANUAL_ADVANCE"].includes(progression.status)) qualStatus = "QUALIFIED";
        else if (["ELIMINATED", "MANUAL_ELIMINATE"].includes(progression.status)) qualStatus = "ELIMINATED";
      }

      rows.push({
        teamId,
        teamName: team.name,
        teamLogo: team.logo || undefined,
        teamTag: team.tag || undefined,
        groupId: group.id,
        groupName: group.name,
        matches: matchesPlayed,
        wwcds,
        placementPoints,
        kills,
        killPoints,
        compensationPoints,
        penaltyPoints,
        totalPoints,
        matchResults,
        rank: 0,
        qualificationStatus: qualStatus,
      });
    }
  }

  // Sort by tiebreakers
  const tiebreakers = stage.tiebreakerOrder || ["points", "kills", "damage", "wwcds"];
  rows.sort((a, b) => {
    for (const t of tiebreakers) {
      let cmp = 0;
      if (t === "points") cmp = b.totalPoints - a.totalPoints;
      else if (t === "kills") cmp = b.kills - a.kills;
      else if (t === "wwcds") cmp = b.wwcds - a.wwcds;
      if (cmp !== 0) return cmp;
    }
    return 0;
  });

  // Rank
  rows.forEach((r, i) => { r.rank = i + 1; });

  // Filter by qualification status
  const finalRows = statusFilter && statusFilter !== "all"
    ? rows.filter(r => r.qualificationStatus.toLowerCase() === statusFilter.toLowerCase())
    : rows;

  return NextResponse.json({
    stage: {
      id: stage.id,
      name: stage.name,
      type: stage.type,
      status: stage.status,
      isLocked: stage.isLocked,
    },
    groups: stage.groups,
    matches: matches.map(m => ({ id: m.id, name: m.name, map: m.map, matchNumber: m.matchNumber, status: m.status, groupId: m.groupId })),
    rows: finalRows,
    filters: { group: groupFilter, status: statusFilter },
  });
}