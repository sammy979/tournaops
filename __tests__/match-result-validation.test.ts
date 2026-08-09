/**
 * Match Result Validation Tests
 * Tests lib/match-result-validation.ts
 *
 * Actual signature:
 *   validateSubmittedMatchResults(rawResults: unknown, options: ValidateMatchResultsOptions)
 * where options = { tournamentTeamIds: Set<string>, eligibleTeamIds?, maxPlacement?, maxKills? }
 *
 * Returns:
 *   { valid: true, sanitizedResults, warnings } | { valid: false, error, details? }
 */

import { validateSubmittedMatchResults } from "@/lib/match-result-validation";

const teamIds = new Set(["team-1", "team-2", "team-3", "team-4"]);
const opts = { tournamentTeamIds: teamIds };

function makeResult(overrides: any = {}) {
  return { teamId: "team-1", placement: 1, kills: 5, ...overrides };
}

describe("validateSubmittedMatchResults", () => {
  test("accepts valid results for all teams", () => {
    const results = [
      makeResult({ teamId: "team-1", placement: 1, kills: 8 }),
      makeResult({ teamId: "team-2", placement: 2, kills: 3 }),
      makeResult({ teamId: "team-3", placement: 3, kills: 2 }),
      makeResult({ teamId: "team-4", placement: 4, kills: 1 }),
    ];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(true);
  });

  test("rejects team not in tournament", () => {
    const results = [makeResult({ teamId: "team-999", placement: 1, kills: 5 })];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
  });

  test("rejects negative kills", () => {
    const results = [makeResult({ teamId: "team-1", placement: 1, kills: -1 })];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
  });

  test("rejects placement of 0", () => {
    const results = [makeResult({ teamId: "team-1", placement: 0, kills: 5 })];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
  });

  test("rejects duplicate placements", () => {
    const results = [
      makeResult({ teamId: "team-1", placement: 1, kills: 5 }),
      makeResult({ teamId: "team-2", placement: 1, kills: 3 }),
    ];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
    if (!out.valid) {
      const msg = (out.details ?? [out.error]).join(" ");
      expect(msg.toLowerCase()).toMatch(/duplicate|placement/);
    }
  });

  test("rejects empty results array", () => {
    const out = validateSubmittedMatchResults([], opts);
    expect(out.valid).toBe(false);
    if (!out.valid) expect(out.error).toBeTruthy();
  });

  test("rejects non-array results", () => {
    const out = validateSubmittedMatchResults("not-an-array", opts);
    expect(out.valid).toBe(false);
    if (!out.valid) expect(out.error).toMatch(/array/i);
  });

  test("rejects non-integer kills", () => {
    const results = [makeResult({ teamId: "team-1", placement: 1, kills: 1.5 })];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
  });

  test("accepts kills of 0", () => {
    const results = [
      makeResult({ teamId: "team-1", placement: 1, kills: 0 }),
      makeResult({ teamId: "team-2", placement: 2, kills: 0 }),
    ];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(true);
  });

  test("rejects duplicate team entries", () => {
    const results = [
      makeResult({ teamId: "team-1", placement: 1, kills: 5 }),
      makeResult({ teamId: "team-1", placement: 2, kills: 3 }),
    ];
    const out = validateSubmittedMatchResults(results, opts);
    expect(out.valid).toBe(false);
  });

  test("respects maxKills option", () => {
    const results = [makeResult({ teamId: "team-1", placement: 1, kills: 50 })];
    const out = validateSubmittedMatchResults(results, { tournamentTeamIds: teamIds, maxKills: 20 });
    expect(out.valid).toBe(false);
  });

  test("respects maxPlacement option", () => {
    const results = [makeResult({ teamId: "team-1", placement: 50, kills: 3 })];
    const out = validateSubmittedMatchResults(results, { tournamentTeamIds: teamIds, maxPlacement: 16 });
    expect(out.valid).toBe(false);
  });

  test("valid result contains sanitizedResults", () => {
    const results = [makeResult({ teamId: "team-1", placement: 1, kills: 5 })];
    const out = validateSubmittedMatchResults(results, opts);
    if (out.valid) {
      expect(Array.isArray(out.sanitizedResults)).toBe(true);
      expect(out.sanitizedResults[0].teamId).toBe("team-1");
    }
  });
});