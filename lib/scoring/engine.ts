// TournaOps Advanced Scoring Engine
// Handles all official + custom PUBG Mobile scoring rules

import { TeamMatchResult, ScoringRule, PlayerMatchResult } from "@/types/tournament";

export interface AdvancedScoringRule extends ScoringRule {
  name?: string;
  // Bonus rules
  wwcdBonus?: number;           // Extra points for #1
  top3Bonus?: number;           // Extra points for top 3
  perfectMatchBonus?: number;   // Bonus for placement 1 + most kills
  
  // Limits
  maxKillPoints?: number;       // Cap on kill points per match
  maxPlacementPoints?: number;  // Cap on placement points
  
  // Multipliers
  finalMatchMultiplier?: number; // Multiply points in final match (e.g., 1.5x)
  
  // Deductions
  disqualifiedPenalty?: number;  // Points deducted for DQ
  
  // Tiebreakers (in order)
  tiebreakerOrder?: Array<"points" | "kills" | "damage" | "placement" | "wwcd" | "top3">;
}

export interface CalculatedTeamResult extends TeamMatchResult {
  bonuses: {
    wwcd?: number;
    top3?: number;
    perfect?: number;
    multiplier?: number;
  };
  penalties: {
    disqualified?: number;
  };
  breakdown: {
    basePlacement: number;
    baseKills: number;
    totalBonuses: number;
    totalPenalties: number;
    finalTotal: number;
  };
}

/**
 * Calculate a single team's score for a match with all bonuses/penalties
 */
export function calculateTeamScore(
  placement: number,
  kills: number,
  playerResults: PlayerMatchResult[],
  damage: number,
  scoring: AdvancedScoringRule,
  isFinal: boolean = false,
  disqualified: boolean = false
): {
  placementPoints: number;
  killPoints: number;
  bonuses: any;
  penalties: any;
  totalPoints: number;
  breakdown: any;
} {
  // Base placement points
  const rawPlacementPoints = scoring.placementPoints[placement - 1] || 0;
  const placementPoints = scoring.maxPlacementPoints
    ? Math.min(rawPlacementPoints, scoring.maxPlacementPoints)
    : rawPlacementPoints;

  // Base kill points
  const rawKillPoints = kills * scoring.killPoints;
  const killPoints = scoring.maxKillPoints
    ? Math.min(rawKillPoints, scoring.maxKillPoints)
    : rawKillPoints;

  // Bonuses
  const bonuses: any = {};
  let totalBonuses = 0;

  if (placement === 1 && scoring.wwcdBonus) {
    bonuses.wwcd = scoring.wwcdBonus;
    totalBonuses += scoring.wwcdBonus;
  }

  if (placement <= 3 && scoring.top3Bonus) {
    bonuses.top3 = scoring.top3Bonus;
    totalBonuses += scoring.top3Bonus;
  }

  // Perfect match: #1 + highest kills (would need cross-team check, simplified here)
  if (placement === 1 && kills >= 8 && scoring.perfectMatchBonus) {
    bonuses.perfect = scoring.perfectMatchBonus;
    totalBonuses += scoring.perfectMatchBonus;
  }

  // Penalties
  const penalties: any = {};
  let totalPenalties = 0;

  if (disqualified && scoring.disqualifiedPenalty) {
    penalties.disqualified = scoring.disqualifiedPenalty;
    totalPenalties += scoring.disqualifiedPenalty;
  }

  // Base total
  let subtotal = placementPoints + killPoints + totalBonuses - totalPenalties;

  // Final match multiplier
  if (isFinal && scoring.finalMatchMultiplier) {
    const multiplied = subtotal * scoring.finalMatchMultiplier;
    bonuses.multiplier = multiplied - subtotal;
    subtotal = multiplied;
  }

  const totalPoints = Math.max(0, Math.round(subtotal));

  return {
    placementPoints,
    killPoints,
    bonuses,
    penalties,
    totalPoints,
    breakdown: {
      basePlacement: placementPoints,
      baseKills: killPoints,
      totalBonuses,
      totalPenalties,
      finalTotal: totalPoints,
    },
  };
}

/**
 * Apply advanced sorting with tiebreakers
 */
export function sortWithTiebreakers<T extends {
  totalPoints: number;
  totalKills: number;
  totalDamage: number;
  wwcds?: number;
  top3s?: number;
  bestPlacement?: number;
}>(
  entries: T[],
  tiebreakers: Array<"points" | "kills" | "damage" | "placement" | "wwcd" | "top3"> = ["points", "kills", "damage", "wwcd"]
): T[] {
  return [...entries].sort((a, b) => {
    for (const criterion of tiebreakers) {
      let cmp = 0;
      switch (criterion) {
        case "points": cmp = b.totalPoints - a.totalPoints; break;
        case "kills": cmp = b.totalKills - a.totalKills; break;
        case "damage": cmp = b.totalDamage - a.totalDamage; break;
        case "wwcd": cmp = (b.wwcds || 0) - (a.wwcds || 0); break;
        case "top3": cmp = (b.top3s || 0) - (a.top3s || 0); break;
        case "placement": cmp = (a.bestPlacement || 999) - (b.bestPlacement || 999); break;
      }
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

/**
 * Predefined competitive scoring systems with all rules
 */
export const ADVANCED_SCORING_PRESETS: Record<string, AdvancedScoringRule> = {
  pmgc: {
    name: "PMGC Standard",
    placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    tiebreakerOrder: ["points", "kills", "damage", "placement"],
  },
  pmpl: {
    name: "PMPL South Asia",
    placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    wwcdBonus: 5,
    tiebreakerOrder: ["points", "kills", "wwcd", "damage"],
  },
  community: {
    name: "Community Standard",
    placementPoints: [12, 9, 7, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    tiebreakerOrder: ["points", "kills", "damage"],
  },
  kill_heavy: {
    name: "Kill Heavy",
    placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 2,
    tiebreakerOrder: ["points", "kills", "damage"],
  },
  battlegrounds: {
    name: "Battlegrounds Mobile India",
    placementPoints: [10, 7, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    maxKillPoints: 6,
    tiebreakerOrder: ["points", "kills", "wwcd", "damage"],
  },
  esports_pro: {
    name: "Esports Pro",
    placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    wwcdBonus: 3,
    top3Bonus: 2,
    finalMatchMultiplier: 1.5,
    tiebreakerOrder: ["points", "wwcd", "kills", "damage"],
  },
  scrim_fast: {
    name: "Scrim Fast",
    placementPoints: [10, 8, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 2,
    tiebreakerOrder: ["kills", "points", "damage"],
  },
};

/**
 * Get a scoring rule by key
 */
export function getScoringRule(key: string): AdvancedScoringRule {
  return ADVANCED_SCORING_PRESETS[key] || ADVANCED_SCORING_PRESETS.pmgc;
}

/**
 * Format bonus/penalty for display
 */
export function formatBonusText(bonuses: any): string {
  const parts: string[] = [];
  if (bonuses.wwcd) parts.push(`+${bonuses.wwcd} WWCD`);
  if (bonuses.top3) parts.push(`+${bonuses.top3} Top 3`);
  if (bonuses.perfect) parts.push(`+${bonuses.perfect} Perfect`);
  if (bonuses.multiplier) parts.push(`+${Math.round(bonuses.multiplier)} Final`);
  return parts.join(" · ");
}

/**
 * Validate scoring rule
 */
export function validateScoringRule(rule: AdvancedScoringRule): { valid: boolean; error?: string } {
  if (!rule.name) return { valid: false, error: "Name required" };
  if (!Array.isArray(rule.placementPoints)) return { valid: false, error: "placementPoints must be array" };
  if (rule.placementPoints.length < 1) return { valid: false, error: "Need at least 1 placement" };
  if (typeof rule.killPoints !== "number") return { valid: false, error: "killPoints must be number" };
  if (rule.killPoints < 0) return { valid: false, error: "killPoints cannot be negative" };
  return { valid: true };
}