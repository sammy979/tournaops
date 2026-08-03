// TournaOps AI Result Validator
// Checks for errors BEFORE publishing results

import type { AIValidationResult } from "./provider";

interface TeamResult {
  teamId?: string;
  teamName: string;
  placement: number;
  kills: number;
  placementPoints?: number;
  killPoints?: number;
  totalPoints?: number;
}

interface ExistingTeam {
  id: string;
  name: string;
}

interface ScoringRule {
  placementPoints: number[];
  killPoints: number;
  wwcdBonus?: number;
}

export function validateResults(
  results: TeamResult[],
  existingTeams: ExistingTeam[],
  scoring: ScoringRule,
  matchName?: string
): AIValidationResult {
  const errors: AIValidationResult["errors"] = [];

  if (!results || results.length === 0) {
    errors.push({
      type: "MISSING_TEAM",
      severity: "error",
      message: "No results to validate",
    });
    return { errors, isValid: false, confidence: 0 };
  }

  // 1. Check duplicate placements
  const placements = new Map<number, string[]>();
  results.forEach(r => {
    if (!placements.has(r.placement)) placements.set(r.placement, []);
    placements.get(r.placement)!.push(r.teamName);
  });
  placements.forEach((teams, placement) => {
    if (teams.length > 1) {
      errors.push({
        type: "DUPLICATE_PLACEMENT",
        severity: "error",
        message: `Placement #${placement} assigned to ${teams.length} teams: ${teams.join(", ")}`,
        field: "placement",
        actual: teams,
      });
    }
  });

  // 2. Check duplicate team names
  const nameCount = new Map<string, number>();
  results.forEach(r => {
    const key = r.teamName.toLowerCase().trim();
    nameCount.set(key, (nameCount.get(key) || 0) + 1);
  });
  nameCount.forEach((count, name) => {
    if (count > 1) {
      errors.push({
        type: "DUPLICATE_TEAM",
        severity: "error",
        message: `Team "${name}" appears ${count} times`,
        teamName: name,
      });
    }
  });

  // 3. Check negative kills
  results.forEach(r => {
    if (r.kills < 0) {
      errors.push({
        type: "NEGATIVE_KILLS",
        severity: "error",
        message: `${r.teamName} has negative kills (${r.kills})`,
        teamName: r.teamName,
        field: "kills",
        actual: r.kills,
      });
    }
  });

  // 4. Check invalid placements
  results.forEach(r => {
    if (r.placement < 1 || r.placement > results.length) {
      errors.push({
        type: "INVALID_PLACEMENT",
        severity: "warning",
        message: `${r.teamName} has placement #${r.placement} but there are only ${results.length} teams`,
        teamName: r.teamName,
        field: "placement",
        actual: r.placement,
      });
    }
  });

  // 5. Check point calculations
  results.forEach(r => {
    if (r.totalPoints !== undefined && r.placementPoints !== undefined && r.killPoints !== undefined) {
      const expectedPlacement = scoring.placementPoints[r.placement - 1] || 0;
      const expectedKillPts = r.kills * scoring.killPoints;
      const expectedWwcd = r.placement === 1 && scoring.wwcdBonus ? scoring.wwcdBonus : 0;
      const expectedTotal = expectedPlacement + expectedKillPts + expectedWwcd;

      if (r.placementPoints !== expectedPlacement) {
        errors.push({
          type: "INCORRECT_TOTAL",
          severity: "warning",
          message: `${r.teamName}: Placement points should be ${expectedPlacement} for #${r.placement}, but got ${r.placementPoints}`,
          teamName: r.teamName,
          field: "placementPoints",
          expected: expectedPlacement,
          actual: r.placementPoints,
          suggestion: `Fix to ${expectedPlacement}`,
        });
      }

      if (Math.abs(r.totalPoints - expectedTotal) > 1) {
        errors.push({
          type: "INCORRECT_TOTAL",
          severity: "warning",
          message: `${r.teamName}: Expected ${expectedTotal} total points (${expectedPlacement}+${expectedKillPts}${expectedWwcd ? "+" + expectedWwcd : ""}), got ${r.totalPoints}`,
          teamName: r.teamName,
          field: "totalPoints",
          expected: expectedTotal,
          actual: r.totalPoints,
          suggestion: `Fix to ${expectedTotal}`,
        });
      }
    }
  });

  // 6. Check suspicious scores (unusually high kills)
  const avgKills = results.reduce((a, r) => a + r.kills, 0) / results.length;
  results.forEach(r => {
    if (r.kills > avgKills * 3 && r.kills > 10) {
      errors.push({
        type: "SUSPICIOUS_SCORE",
        severity: "info",
        message: `${r.teamName} has ${r.kills} kills (average is ${Math.round(avgKills)}). Unusually high - please verify.`,
        teamName: r.teamName,
        field: "kills",
        actual: r.kills,
        expected: Math.round(avgKills),
      });
    }
  });

  // 7. Match teams against roster
  if (existingTeams.length > 0) {
    results.forEach(r => {
      const exactMatch = existingTeams.find(t => t.name.toLowerCase() === r.teamName.toLowerCase());
      if (!exactMatch) {
        const fuzzyMatch = existingTeams.find(t => {
          const a = t.name.toLowerCase().replace(/[^a-z0-9]/g, "");
          const b = r.teamName.toLowerCase().replace(/[^a-z0-9]/g, "");
          return a.includes(b) || b.includes(a);
        });

        if (fuzzyMatch) {
          errors.push({
            type: "TEAM_MISMATCH",
            severity: "warning",
            message: `"${r.teamName}" might be "${fuzzyMatch.name}"`,
            teamName: r.teamName,
            suggestion: `Did you mean "${fuzzyMatch.name}"?`,
          });
        } else {
          errors.push({
            type: "MISSING_TEAM",
            severity: "info",
            message: `"${r.teamName}" not found in tournament roster`,
            teamName: r.teamName,
          });
        }
      }
    });
  }

  // 8. Check for missing teams from roster
  if (existingTeams.length > 0 && results.length < existingTeams.length) {
    const resultNames = new Set(results.map(r => r.teamName.toLowerCase()));
    const missingTeams = existingTeams.filter(t => !resultNames.has(t.name.toLowerCase()));
    if (missingTeams.length > 0 && missingTeams.length <= 5) {
      missingTeams.forEach(t => {
        errors.push({
          type: "MISSING_TEAM",
          severity: "info",
          message: `"${t.name}" is in the roster but not in results`,
          teamName: t.name,
        });
      });
    }
  }

  const errorCount = errors.filter(e => e.severity === "error").length;
  const warningCount = errors.filter(e => e.severity === "warning").length;
  const confidence = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    errors,
    isValid: errorCount === 0,
    confidence,
  };
}

// Smart team name matching
export function matchTeamNames(
  inputNames: string[],
  existingTeams: ExistingTeam[]
): AITeamMatch[] {
  return inputNames.map(input => {
    const inputClean = input.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Exact match
    const exact = existingTeams.find(t => t.name.toLowerCase() === input.toLowerCase());
    if (exact) return { inputName: input, matchedName: exact.name, confidence: 100, isExactMatch: true };

    // Clean match
    const clean = existingTeams.find(t => t.name.toLowerCase().replace(/[^a-z0-9]/g, "") === inputClean);
    if (clean) return { inputName: input, matchedName: clean.name, confidence: 95, isExactMatch: false };

    // Partial match
    const partial = existingTeams.find(t => {
      const tc = t.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return tc.includes(inputClean) || inputClean.includes(tc);
    });
    if (partial) return { inputName: input, matchedName: partial.name, confidence: 80, isExactMatch: false };

    return { inputName: input, matchedName: input, confidence: 50, isExactMatch: false };
  });
}