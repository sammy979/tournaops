// ============================================================
// lib/scoring-engine.ts
// OFFICIAL PUBG Mobile Scoring Engine for TournaOps
// ============================================================
// THIS IS THE SINGLE SOURCE OF TRUTH FOR ALL SCORES.
// AI must NEVER override these calculations.
// All UI must display numbers from this engine.
// ============================================================

// ============================================================
// TYPES
// ============================================================

export interface PlacementTable {
  [placement: number]: number;
}

export interface ScoringConfig {
  type: "PMGC" | "PMPL" | "COMMUNITY" | "KILL_HEAVY" | "PLACEMENT_HEAVY" | "CUSTOM";
  killPoints: number;
  placementTable: PlacementTable;
  wwcdBonus?: number;
  penaltyPerDeath?: number;
  maxKillsPerMatch?: number;  // Optional kill cap
  tiebreakers?: TiebreakerRule[];
  customRules?: string;
}

export type TiebreakerRule =
  | "TOTAL_POINTS"
  | "WWCD_COUNT"
  | "PLACEMENT_POINTS"
  | "TOTAL_KILLS"
  | "BEST_MATCH_PLACEMENT"
  | "BEST_MATCH_SCORE";

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  matchNumber: number;
  placement: number;
  kills: number;
  isWWCD?: boolean;
}

export interface TeamMatchScore {
  teamId: string;
  teamName: string;
  matchNumber: number;
  placement: number;
  kills: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  matchTotal: number;
  isWWCD: boolean;
  breakdown: string;
}

export interface TeamTournamentStanding {
  rank: number;
  teamId: string;
  teamName: string;
  totalPoints: number;
  placementPoints: number;
  killPoints: number;
  totalKills: number;
  wwcdCount: number;
  matchesPlayed: number;
  averagePlacement: number;
  averageKills: number;
  bestMatchScore: number;
  bestMatchPlacement: number;
  matchScores: TeamMatchScore[];
  // Tiebreaker info
  tiebreakerApplied?: TiebreakerRule;
}

// ============================================================
// PRESET SCORING TABLES
// ============================================================

export const SCORING_PRESETS: Record<string, ScoringConfig> = {
  PMGC: {
    type: "PMGC",
    killPoints: 1,
    placementTable: {
      1: 12, 2: 9, 3: 8, 4: 7, 5: 6,
      6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0,
      16: 0,
    },
    wwcdBonus: 0,
    tiebreakers: ["WWCD_COUNT", "PLACEMENT_POINTS", "TOTAL_KILLS"],
  },
  PMPL: {
    type: "PMPL",
    killPoints: 1,
    placementTable: {
      1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
      6: 4, 7: 3, 8: 2, 9: 1, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
      16: 0,
    },
    wwcdBonus: 0,
    tiebreakers: ["WWCD_COUNT", "PLACEMENT_POINTS", "TOTAL_KILLS"],
  },
  COMMUNITY: {
    type: "COMMUNITY",
    killPoints: 1,
    placementTable: {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
      6: 2, 7: 2, 8: 1, 9: 1, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0,
      16: 0,
    },
    wwcdBonus: 0,
    tiebreakers: ["WWCD_COUNT", "PLACEMENT_POINTS", "TOTAL_KILLS"],
  },
  KILL_HEAVY: {
    type: "KILL_HEAVY",
    killPoints: 2,
    placementTable: {
      1: 8, 2: 5, 3: 4, 4: 3, 5: 2,
      6: 1, 7: 1, 8: 0, 9: 0, 10: 0,
    },
    wwcdBonus: 3,
    tiebreakers: ["TOTAL_KILLS", "WWCD_COUNT", "PLACEMENT_POINTS"],
  },
  PLACEMENT_HEAVY: {
    type: "PLACEMENT_HEAVY",
    killPoints: 1,
    placementTable: {
      1: 20, 2: 15, 3: 12, 4: 10, 5: 8,
      6: 6, 7: 5, 8: 4, 9: 3, 10: 2,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0,
      16: 0,
    },
    wwcdBonus: 5,
    tiebreakers: ["PLACEMENT_POINTS", "WWCD_COUNT", "TOTAL_KILLS"],
  },
};

// ============================================================
// CORE: Calculate single match score for a team
// ============================================================

export function calculateMatchScore(
  result: TeamMatchResult,
  config: ScoringConfig
): TeamMatchScore {
  // Placement points
  const placementPoints = config.placementTable[result.placement] ?? 0;

  // Kill points (with optional cap)
  const effectiveKills =
    config.maxKillsPerMatch !== undefined
      ? Math.min(result.kills, config.maxKillsPerMatch)
      : result.kills;
  const killPoints = effectiveKills * config.killPoints;

  // WWCD bonus
  const isWWCD = result.placement === 1;
  const bonusPoints = isWWCD && config.wwcdBonus ? config.wwcdBonus : 0;

  // Penalty
  const penaltyPoints = 0; // Reserved for future penalty rules

  // Match total
  const matchTotal = placementPoints + killPoints + bonusPoints - penaltyPoints;

  // Human-readable breakdown
  const breakdown = [
    `Place ${result.placement}: ${placementPoints}pts`,
    `${effectiveKills} kills × ${config.killPoints} = ${killPoints}pts`,
    ...(bonusPoints > 0 ? [`WWCD bonus: +${bonusPoints}pts`] : []),
    ...(penaltyPoints > 0 ? [`Penalty: -${penaltyPoints}pts`] : []),
    `Total: ${matchTotal}pts`,
  ].join(" | ");

  return {
    teamId: result.teamId,
    teamName: result.teamName,
    matchNumber: result.matchNumber,
    placement: result.placement,
    kills: result.kills,
    placementPoints,
    killPoints,
    bonusPoints,
    penaltyPoints,
    matchTotal,
    isWWCD,
    breakdown,
  };
}

// ============================================================
// CORE: Calculate tournament standings from all match results
// ============================================================

export function calculateStandings(
  results: TeamMatchResult[],
  config: ScoringConfig
): TeamTournamentStanding[] {
  // Group results by team
  const teamResultsMap = new Map<string, TeamMatchResult[]>();
  for (const result of results) {
    const existing = teamResultsMap.get(result.teamId) || [];
    existing.push(result);
    teamResultsMap.set(result.teamId, existing);
  }

  // Calculate per-team aggregates
  const standings: TeamTournamentStanding[] = [];

  for (const [teamId, teamResults] of teamResultsMap.entries()) {
    const matchScores = teamResults.map((r) => calculateMatchScore(r, config));

    const totalPoints = matchScores.reduce((sum, s) => sum + s.matchTotal, 0);
    const placementPoints = matchScores.reduce((sum, s) => sum + s.placementPoints, 0);
    const killPoints = matchScores.reduce((sum, s) => sum + s.killPoints, 0);
    const totalKills = matchScores.reduce((sum, s) => sum + s.kills, 0);
    const wwcdCount = matchScores.filter((s) => s.isWWCD).length;
    const matchesPlayed = matchScores.length;

    const averagePlacement =
      matchesPlayed > 0
        ? matchScores.reduce((sum, s) => sum + s.placement, 0) / matchesPlayed
        : 0;

    const averageKills =
      matchesPlayed > 0 ? totalKills / matchesPlayed : 0;

    const bestMatchScore = Math.max(...matchScores.map((s) => s.matchTotal), 0);
    const bestMatchPlacement = Math.min(...matchScores.map((s) => s.placement), 999);

    standings.push({
      rank: 0, // Set after sorting
      teamId,
      teamName: teamResults[0].teamName,
      totalPoints,
      placementPoints,
      killPoints,
      totalKills,
      wwcdCount,
      matchesPlayed,
      averagePlacement: Math.round(averagePlacement * 100) / 100,
      averageKills: Math.round(averageKills * 100) / 100,
      bestMatchScore,
      bestMatchPlacement,
      matchScores,
    });
  }

  // Sort with tiebreakers
  const tiebreakers = config.tiebreakers || [
    "TOTAL_POINTS",
    "WWCD_COUNT",
    "PLACEMENT_POINTS",
    "TOTAL_KILLS",
    "BEST_MATCH_PLACEMENT",
    "BEST_MATCH_SCORE",
  ];

  standings.sort((a, b) => {
    for (const rule of tiebreakers) {
      let diff = 0;
      switch (rule) {
        case "TOTAL_POINTS":
          diff = b.totalPoints - a.totalPoints;
          break;
        case "WWCD_COUNT":
          diff = b.wwcdCount - a.wwcdCount;
          break;
        case "PLACEMENT_POINTS":
          diff = b.placementPoints - a.placementPoints;
          break;
        case "TOTAL_KILLS":
          diff = b.totalKills - a.totalKills;
          break;
        case "BEST_MATCH_PLACEMENT":
          // Lower placement = better
          diff = a.bestMatchPlacement - b.bestMatchPlacement;
          break;
        case "BEST_MATCH_SCORE":
          diff = b.bestMatchScore - a.bestMatchScore;
          break;
      }
      if (diff !== 0) {
        return diff;
      }
    }
    // Final tiebreaker: alphabetical (deterministic)
    return a.teamName.localeCompare(b.teamName);
  });

  // Assign ranks (handle ties — same rank if same score on all tiebreakers)
  let currentRank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0) {
      const prev = standings[i - 1];
      const curr = standings[i];
      const isTied =
        prev.totalPoints === curr.totalPoints &&
        prev.wwcdCount === curr.wwcdCount &&
        prev.placementPoints === curr.placementPoints &&
        prev.totalKills === curr.totalKills;
      if (!isTied) {
        currentRank = i + 1;
      }
    }
    standings[i].rank = currentRank;
  }

  return standings;
}

// ============================================================
// GET TOP N QUALIFIERS
// ============================================================

export function getQualifiers(
  standings: TeamTournamentStanding[],
  topN: number
): TeamTournamentStanding[] {
  return standings.filter((s) => s.rank <= topN);
}

// ============================================================
// GET TOP FRAGGER
// ============================================================

export function getTopFragger(
  standings: TeamTournamentStanding[]
): TeamTournamentStanding | null {
  if (standings.length === 0) return null;
  return standings.reduce((top, s) =>
    s.totalKills > top.totalKills ? s : top
  );
}

// ============================================================
// VALIDATE SCORING CONFIG
// ============================================================

export function validateScoringConfig(config: Partial<ScoringConfig>): string[] {
  const errors: string[] = [];

  if (!config.type) {
    errors.push("Scoring type is required");
  }

  if (config.killPoints === undefined || config.killPoints < 0) {
    errors.push("Kill points must be 0 or greater");
  }

  if (!config.placementTable || Object.keys(config.placementTable).length === 0) {
    errors.push("Placement table is required");
  }

  if (config.placementTable) {
    for (const [place, points] of Object.entries(config.placementTable)) {
      if (isNaN(Number(place)) || Number(place) < 1) {
        errors.push(`Invalid placement: ${place}`);
      }
      if (isNaN(Number(points)) || Number(points) < 0) {
        errors.push(`Placement ${place} points must be 0 or greater`);
      }
    }
  }

  return errors;
}

// ============================================================
// PARSE SCORING CONFIG FROM DATABASE (JSON field)
// ============================================================

export function parseScoringConfig(raw: unknown): ScoringConfig {
  if (!raw || typeof raw !== "object") {
    return SCORING_PRESETS.PMGC;
  }

  const config = raw as Partial<ScoringConfig>;
  const errors = validateScoringConfig(config);

  if (errors.length > 0) {
    console.warn("[SCORING ENGINE] Invalid config, using PMGC default:", errors);
    return SCORING_PRESETS.PMGC;
  }

  return config as ScoringConfig;
}
