// lib/match-result-validation.ts
// ============================================================
// Canonical server-side match result validation for TournaOps
// Prevents duplicate teams, duplicate placements, invalid kills,
// invalid placements, and ineligible team submissions.
// ============================================================

export interface SubmittedMatchResult {
  teamId: string;
  placement: number;
  kills: number;
  wwcd?: boolean;
  damage?: number;
  playerResults?: any[];
}

export interface ValidateMatchResultsOptions {
  tournamentTeamIds: Set<string>;
  eligibleTeamIds?: Set<string>;
  requireAllEligible?: boolean;
  maxPlacement?: number;
  maxKills?: number;
}

export type MatchValidationResult =
  | {
      valid: true;
      sanitizedResults: SubmittedMatchResult[];
      warnings: string[];
    }
  | {
      valid: false;
      error: string;
      details?: string[];
    };

export function validateSubmittedMatchResults(
  rawResults: unknown,
  options: ValidateMatchResultsOptions
): MatchValidationResult {
  const {
    tournamentTeamIds,
    eligibleTeamIds,
    requireAllEligible = false,
    maxPlacement = 100,
    maxKills = 99,
  } = options;

  if (!Array.isArray(rawResults)) {
    return { valid: false, error: "Results must be an array." };
  }

  if (rawResults.length === 0) {
    return { valid: false, error: "At least one result is required." };
  }

  const seenTeamIds = new Set<string>();
  const seenPlacements = new Set<number>();
  const sanitizedResults: SubmittedMatchResult[] = [];
  const details: string[] = [];

  for (let i = 0; i < rawResults.length; i++) {
    const row = rawResults[i] as any;
    const index = i + 1;

    const teamId = typeof row?.teamId === "string" ? row.teamId.trim() : "";
    const placement = Number(row?.placement);
    const kills = Number(row?.kills);

    if (!teamId) {
      details.push(`Row ${index}: teamId is required.`);
      continue;
    }

    if (!Number.isInteger(placement) || placement < 1 || placement > maxPlacement) {
      details.push(`Row ${index}: placement must be an integer between 1 and ${maxPlacement}.`);
      continue;
    }

    if (!Number.isInteger(kills) || kills < 0 || kills > maxKills) {
      details.push(`Row ${index}: kills must be an integer between 0 and ${maxKills}.`);
      continue;
    }

    if (!tournamentTeamIds.has(teamId)) {
      details.push(`Row ${index}: team does not belong to this tournament.`);
      continue;
    }

    if (eligibleTeamIds && eligibleTeamIds.size > 0 && !eligibleTeamIds.has(teamId)) {
      details.push(`Row ${index}: team is not eligible for this match.`);
      continue;
    }

    if (seenTeamIds.has(teamId)) {
      details.push(`Row ${index}: duplicate team submitted.`);
      continue;
    }

    if (seenPlacements.has(placement)) {
      details.push(`Row ${index}: duplicate placement ${placement}.`);
      continue;
    }

    seenTeamIds.add(teamId);
    seenPlacements.add(placement);

    const damage =
      row?.damage !== undefined && row?.damage !== null
        ? Math.max(0, Number(row.damage) || 0)
        : undefined;

    sanitizedResults.push({
      teamId,
      placement,
      kills,
      wwcd: row?.wwcd === true || placement === 1,
      damage,
      playerResults: Array.isArray(row?.playerResults) ? row.playerResults : undefined,
    });
  }

  if (details.length > 0) {
    return {
      valid: false,
      error: details[0],
      details,
    };
  }

  if (eligibleTeamIds && eligibleTeamIds.size > 0 && requireAllEligible) {
    const missing = Array.from(eligibleTeamIds).filter((teamId) => !seenTeamIds.has(teamId));
    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing results for ${missing.length} required team(s).`,
        details: missing.slice(0, 10).map((id) => `Missing teamId: ${id}`),
      };
    }

    if (sanitizedResults.length > eligibleTeamIds.size) {
      return {
        valid: false,
        error: "More results were submitted than the number of teams assigned to this match.",
      };
    }
  }

  sanitizedResults.sort((a, b) => a.placement - b.placement);

  return {
    valid: true,
    sanitizedResults,
    warnings: [],
  };
}