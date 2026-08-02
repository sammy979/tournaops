// TournaOps Stage Qualification Engine
// Handles: Top N/group, Top N overall, Percentages, Wildcards, Manual overrides

export type QualificationType =
  | "TOP_N_PER_GROUP"
  | "TOP_N_OVERALL"
  | "TOP_PERCENT"
  | "CUSTOM";

export interface QualificationRule {
  type: QualificationType;
  count?: number;
  percent?: number;
  wildcardCount?: number;
  manualAdvance?: string[];
  manualEliminate?: string[];
  minMatchesRequired?: number;
}

export interface GroupResult {
  groupId: string;
  groupName: string;
  standings: TeamStanding[];
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  rank: number;
  points: number;
  kills: number;
  damage: number;
  wwcds: number;
  matchesPlayed: number;
}

export interface QualificationResult {
  qualified: QualifiedTeam[];
  eliminated: QualifiedTeam[];
  wildcards: QualifiedTeam[];
  summary: {
    totalTeams: number;
    totalQualified: number;
    totalEliminated: number;
    totalWildcards: number;
    manualOverridesApplied: number;
  };
}

export interface QualifiedTeam {
  teamId: string;
  teamName: string;
  groupId: string;
  groupName: string;
  rank: number;
  points: number;
  kills: number;
  reason: "TOP_RANK" | "WILDCARD" | "MANUAL_ADVANCE" | "MANUAL_ELIMINATE" | "ELIMINATED_BY_RULE";
  overrideNote?: string;
}

// ═══════════════════════════════════════════════════════════
// MAIN CALCULATOR
// ═══════════════════════════════════════════════════════════

export function calculateQualification(
  rule: QualificationRule,
  groups: GroupResult[]
): QualificationResult {
  const qualified: QualifiedTeam[] = [];
  const eliminated: QualifiedTeam[] = [];
  const wildcards: QualifiedTeam[] = [];

  const allTeams: QualifiedTeam[] = [];

  // Flatten all teams with group context
  groups.forEach(group => {
    group.standings.forEach(team => {
      allTeams.push({
        teamId: team.teamId,
        teamName: team.teamName,
        groupId: group.groupId,
        groupName: group.groupName,
        rank: team.rank,
        points: team.points,
        kills: team.kills,
        reason: "ELIMINATED_BY_RULE",
      });
    });
  });

  // Apply manual eliminations FIRST (highest priority)
  const manualEliminated = new Set(rule.manualEliminate || []);
  const manualAdvanced = new Set(rule.manualAdvance || []);

  // ─── QUALIFICATION LOGIC ───

  const qualifiedIds = new Set<string>();

  switch (rule.type) {
    case "TOP_N_PER_GROUP": {
      const topN = rule.count || 8;
      groups.forEach(group => {
        group.standings.slice(0, topN).forEach(team => {
          if (!manualEliminated.has(team.teamId)) {
            qualifiedIds.add(team.teamId);
          }
        });
      });
      break;
    }

    case "TOP_N_OVERALL": {
      const topN = rule.count || 16;
      const sortedAll = allTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.kills !== a.kills) return b.kills - a.kills;
        return a.rank - b.rank;
      });
      sortedAll.slice(0, topN).forEach(team => {
        if (!manualEliminated.has(team.teamId)) {
          qualifiedIds.add(team.teamId);
        }
      });
      break;
    }

    case "TOP_PERCENT": {
      const percent = rule.percent || 50;
      const totalCount = allTeams.length;
      const advanceCount = Math.ceil((totalCount * percent) / 100);
      const sortedAll = allTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.kills - a.kills;
      });
      sortedAll.slice(0, advanceCount).forEach(team => {
        if (!manualEliminated.has(team.teamId)) {
          qualifiedIds.add(team.teamId);
        }
      });
      break;
    }

    case "CUSTOM":
      // Just use manual advances
      break;
  }

  // Apply manual advances (override eliminations)
  manualAdvanced.forEach(id => qualifiedIds.add(id));

  // ─── WILDCARDS ───
  // Best-performing teams NOT already qualified
  const wildcardCount = rule.wildcardCount || 0;
  if (wildcardCount > 0) {
    const notQualified = allTeams.filter(t =>
      !qualifiedIds.has(t.teamId) && !manualEliminated.has(t.teamId)
    );
    const bestEliminated = notQualified.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.kills - a.kills;
    });
    bestEliminated.slice(0, wildcardCount).forEach(team => {
      qualifiedIds.add(team.teamId);
      wildcards.push({ ...team, reason: "WILDCARD" });
    });
  }

  // ─── CATEGORIZE ───
  allTeams.forEach(team => {
    if (manualEliminated.has(team.teamId)) {
      eliminated.push({ ...team, reason: "MANUAL_ELIMINATE" });
      return;
    }
    if (manualAdvanced.has(team.teamId)) {
      qualified.push({ ...team, reason: "MANUAL_ADVANCE" });
      return;
    }
    if (wildcards.find(w => w.teamId === team.teamId)) return;

    if (qualifiedIds.has(team.teamId)) {
      qualified.push({ ...team, reason: "TOP_RANK" });
    } else {
      eliminated.push({ ...team, reason: "ELIMINATED_BY_RULE" });
    }
  });

  return {
    qualified,
    eliminated,
    wildcards,
    summary: {
      totalTeams: allTeams.length,
      totalQualified: qualified.length + wildcards.length,
      totalEliminated: eliminated.length,
      totalWildcards: wildcards.length,
      manualOverridesApplied: manualAdvanced.size + manualEliminated.size,
    },
  };
}

// ═══════════════════════════════════════════════════════════
// SUGGESTED RULES BY STAGE TYPE
// ═══════════════════════════════════════════════════════════

export function suggestQualificationRule(
  stageType: string,
  totalTeams: number,
  targetAdvancing?: number
): QualificationRule {
  const advancing = targetAdvancing || Math.floor(totalTeams / 2);

  switch (stageType) {
    case "OPEN_QUALIFIER":
    case "CLOSED_QUALIFIER":
      return {
        type: "TOP_N_PER_GROUP",
        count: Math.floor(advancing / 4),
        wildcardCount: 2,
      };

    case "GROUP_STAGE":
      return {
        type: "TOP_N_PER_GROUP",
        count: Math.floor(advancing / 2),
      };

    case "ROUND_OF_16":
    case "QUARTER_FINAL":
    case "SEMI_FINAL":
      return {
        type: "TOP_N_OVERALL",
        count: advancing,
      };

    case "GRAND_FINAL":
      return {
        type: "TOP_N_OVERALL",
        count: 1,
      };

    default:
      return {
        type: "TOP_N_OVERALL",
        count: advancing,
      };
  }
}

// ═══════════════════════════════════════════════════════════
// TIEBREAKER SORTING
// ═══════════════════════════════════════════════════════════

export function sortTeamsByTiebreakers(
  teams: TeamStanding[],
  tiebreakers: string[] = ["points", "kills", "damage", "wwcds"]
): TeamStanding[] {
  return [...teams].sort((a, b) => {
    for (const criterion of tiebreakers) {
      let cmp = 0;
      switch (criterion) {
        case "points": cmp = b.points - a.points; break;
        case "kills": cmp = b.kills - a.kills; break;
        case "damage": cmp = b.damage - a.damage; break;
        case "wwcds": cmp = b.wwcds - a.wwcds; break;
      }
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}