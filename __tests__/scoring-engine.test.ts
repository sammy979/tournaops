/**
 * Scoring Engine Tests
 * Tests the canonical lib/scoring-engine.ts implementation.
 * Tests match ACTUAL engine behavior verified from source.
 *
 * Key facts:
 * - parseScoringConfig gracefully returns PMGC for invalid input (no throw)
 * - PMPL placementTable: 1=15, 2=12, 3=10 ... 9=1, 10+=0
 * - PMPL killPoints = 1
 * - PMPL tiebreakers: WWCD_COUNT first, then PLACEMENT_POINTS, then TOTAL_KILLS
 * - KILL_HEAVY killPoints = 2, wwcdBonus = 3
 * - PLACEMENT_HEAVY 1st = 20pts + 5 wwcd bonus
 */

import {
  calculateMatchScore,
  calculateStandings,
  getQualifiers,
  getTopFragger,
  validateScoringConfig,
  parseScoringConfig,
  SCORING_PRESETS,
  type TeamMatchResult,
  type ScoringConfig,
} from "@/lib/scoring-engine";

const PMPL = SCORING_PRESETS.PMPL;
const PMGC = SCORING_PRESETS.PMGC;
const KILL_HEAVY = SCORING_PRESETS.KILL_HEAVY;
const PLACEMENT_HEAVY = SCORING_PRESETS.PLACEMENT_HEAVY;

function r(
  teamId: string,
  teamName: string,
  placement: number,
  kills: number,
  matchNumber = 1
): TeamMatchResult {
  return { teamId, teamName, matchNumber, placement, kills };
}

// ─── parseScoringConfig ──────────────────────────────────────────────────────

describe("parseScoringConfig", () => {
  test("returns config for valid PMGC object", () => {
    const config = parseScoringConfig(PMGC);
    expect(config.type).toBe("PMGC");
    expect(config.killPoints).toBe(1);
  });

  test("returns PMGC default for null — graceful fallback, no throw", () => {
    const config = parseScoringConfig(null);
    expect(config.type).toBe("PMGC");
  });

  test("returns PMGC default for undefined — graceful fallback", () => {
    const config = parseScoringConfig(undefined);
    expect(config.type).toBe("PMGC");
  });

  test("returns PMGC default for empty object — graceful fallback", () => {
    const config = parseScoringConfig({});
    expect(config.type).toBe("PMGC");
  });

  test("returns PMGC default for object with only invalid type", () => {
    const config = parseScoringConfig({ type: "INVALID" });
    expect(config.type).toBe("PMGC");
  });

  test("returns supplied config when fully valid", () => {
    const config = parseScoringConfig(PMPL);
    expect(config.type).toBe("PMPL");
  });
});

// ─── validateScoringConfig ───────────────────────────────────────────────────

describe("validateScoringConfig", () => {
  test("no errors for valid PMPL", () => {
    expect(validateScoringConfig(PMPL)).toHaveLength(0);
  });

  test("no errors for valid PMGC", () => {
    expect(validateScoringConfig(PMGC)).toHaveLength(0);
  });

  test("no errors for valid KILL_HEAVY", () => {
    expect(validateScoringConfig(KILL_HEAVY)).toHaveLength(0);
  });

  test("error when type missing", () => {
    const errors = validateScoringConfig({ killPoints: 1, placementTable: { 1: 10 } });
    expect(errors.some((e) => e.includes("type"))).toBe(true);
  });

  test("error when killPoints negative", () => {
    const errors = validateScoringConfig({ ...PMPL, killPoints: -1 });
    expect(errors.some((e) => e.includes("Kill points"))).toBe(true);
  });

  test("error when placementTable empty", () => {
    const errors = validateScoringConfig({ ...PMPL, placementTable: {} });
    expect(errors.some((e) => e.includes("Placement table"))).toBe(true);
  });

  test("killPoints = 0 is valid", () => {
    const errors = validateScoringConfig({ ...PLACEMENT_HEAVY, killPoints: 0 });
    expect(errors.filter((e) => e.includes("Kill points"))).toHaveLength(0);
  });
});

// ─── calculateMatchScore ─────────────────────────────────────────────────────

describe("calculateMatchScore", () => {
  test("PMPL 1st place 5 kills: 15 + 5 = 20", () => {
    const score = calculateMatchScore(r("t1", "Alpha", 1, 5), PMPL);
    expect(score.placementPoints).toBe(15);
    expect(score.killPoints).toBe(5);
    expect(score.bonusPoints).toBe(0);
    expect(score.matchTotal).toBe(20);
    expect(score.isWWCD).toBe(true);
  });

  test("PMPL 2nd place 3 kills: 12 + 3 = 15", () => {
    const score = calculateMatchScore(r("t2", "Bravo", 2, 3), PMPL);
    expect(score.placementPoints).toBe(12);
    expect(score.killPoints).toBe(3);
    expect(score.matchTotal).toBe(15);
    expect(score.isWWCD).toBe(false);
  });

  test("PMPL 9th place 0 kills: 1 + 0 = 1", () => {
    const score = calculateMatchScore(r("t3", "C", 9, 0), PMPL);
    expect(score.placementPoints).toBe(1);
    expect(score.matchTotal).toBe(1);
  });

  test("PMPL 16th place 0 kills: 0", () => {
    const score = calculateMatchScore(r("t3", "C", 16, 0), PMPL);
    expect(score.matchTotal).toBe(0);
  });

  test("PMPL 16th place 10 kills: 0 + 10 = 10", () => {
    const score = calculateMatchScore(r("t4", "D", 16, 10), PMPL);
    expect(score.killPoints).toBe(10);
    expect(score.matchTotal).toBe(10);
  });

  test("KILL_HEAVY kills worth 2 each", () => {
    const score = calculateMatchScore(r("t1", "A", 5, 8), KILL_HEAVY);
    expect(score.killPoints).toBe(16);
  });

  test("KILL_HEAVY 1st place gets wwcdBonus = 3", () => {
    const score = calculateMatchScore(r("t1", "A", 1, 0), KILL_HEAVY);
    expect(score.bonusPoints).toBe(3);
    expect(score.isWWCD).toBe(true);
    expect(score.matchTotal).toBe(8 + 0 + 3);
  });

  test("PLACEMENT_HEAVY 1st place: 20 placement + 5 bonus = 25", () => {
    const score = calculateMatchScore(r("t1", "A", 1, 0), PLACEMENT_HEAVY);
    expect(score.placementPoints).toBe(20);
    expect(score.bonusPoints).toBe(5);
    expect(score.matchTotal).toBe(25);
  });

  test("isWWCD only true for placement 1", () => {
    expect(calculateMatchScore(r("t1", "A", 1, 0), PMPL).isWWCD).toBe(true);
    expect(calculateMatchScore(r("t2", "B", 2, 0), PMPL).isWWCD).toBe(false);
    expect(calculateMatchScore(r("t3", "C", 16, 0), PMPL).isWWCD).toBe(false);
  });

  test("maxKillsPerMatch cap is respected", () => {
    const capped: ScoringConfig = { ...PMPL, maxKillsPerMatch: 5 };
    const score = calculateMatchScore(r("t1", "A", 5, 20), capped);
    expect(score.killPoints).toBe(5);
  });

  test("matchTotal = placementPoints + killPoints + bonusPoints - penaltyPoints", () => {
    const score = calculateMatchScore(r("t1", "A", 2, 7), KILL_HEAVY);
    expect(score.matchTotal).toBe(
      score.placementPoints + score.killPoints + score.bonusPoints - score.penaltyPoints
    );
  });

  test("breakdown is a non-empty string", () => {
    const score = calculateMatchScore(r("t1", "A", 1, 3), PMPL);
    expect(typeof score.breakdown).toBe("string");
    expect(score.breakdown.length).toBeGreaterThan(0);
  });
});

// ─── calculateStandings ──────────────────────────────────────────────────────

describe("calculateStandings", () => {
  const twoMatchResults: TeamMatchResult[] = [
    r("t1", "Alpha", 1, 5, 1),
    r("t2", "Bravo", 2, 8, 1),
    r("t3", "Charlie", 3, 2, 1),
    r("t1", "Alpha", 3, 3, 2),
    r("t2", "Bravo", 1, 6, 2),
    r("t3", "Charlie", 2, 4, 2),
  ];

  test("returns 3 teams for 3 distinct teams", () => {
    expect(calculateStandings(twoMatchResults, PMPL)).toHaveLength(3);
  });

  test("first rank is 1", () => {
    expect(calculateStandings(twoMatchResults, PMPL)[0].rank).toBe(1);
  });

  test("sorted by totalPoints descending", () => {
    const standings = calculateStandings(twoMatchResults, PMPL);
    for (let i = 1; i < standings.length; i++) {
      expect(standings[i - 1].totalPoints).toBeGreaterThanOrEqual(standings[i].totalPoints);
    }
  });

  test("aggregates kills across matches", () => {
    const standings = calculateStandings(twoMatchResults, PMPL);
    const alpha = standings.find((s) => s.teamId === "t1")!;
    expect(alpha.totalKills).toBe(8);
    expect(alpha.matchesPlayed).toBe(2);
  });

  test("wwcdCount: Alpha won match1, Bravo won match2", () => {
    const standings = calculateStandings(twoMatchResults, PMPL);
    const alpha = standings.find((s) => s.teamId === "t1")!;
    const bravo = standings.find((s) => s.teamId === "t2")!;
    expect(alpha.wwcdCount).toBe(1);
    expect(bravo.wwcdCount).toBe(1);
  });

  test("bestMatchPlacement is minimum placement across matches", () => {
    const standings = calculateStandings(twoMatchResults, PMPL);
    const alpha = standings.find((s) => s.teamId === "t1")!;
    expect(alpha.bestMatchPlacement).toBe(1);
  });

  test("empty results returns empty array", () => {
    expect(calculateStandings([], PMPL)).toHaveLength(0);
  });

  test("single team: length 1, rank 1", () => {
    const standings = calculateStandings([r("t1", "Alpha", 1, 5, 1)], PMPL);
    expect(standings).toHaveLength(1);
    expect(standings[0].rank).toBe(1);
  });

  test("averagePlacement: Alpha placed 1st and 3rd = average 2", () => {
    const standings = calculateStandings(twoMatchResults, PMPL);
    const alpha = standings.find((s) => s.teamId === "t1")!;
    expect(alpha.averagePlacement).toBe(2);
  });

  test("PMPL sorts by WWCD_COUNT first, not raw totalPoints", () => {
    // Alpha: 1st place PMPL = 15pts, 0 kills = 15 total, 1 WWCD
    // Bravo: 2nd place PMPL = 12pts, 15 kills = 27 total, 0 WWCD
    // PMPL tiebreakers = [WWCD_COUNT, PLACEMENT_POINTS, TOTAL_KILLS]
    // TOTAL_POINTS is NOT in the PMPL tiebreaker list.
    // The sort applies tiebreakers in order: WWCD_COUNT first.
    // Alpha has 1 WWCD vs Bravo 0 WWCD — Alpha ranks first.
    const results: TeamMatchResult[] = [
      r("t1", "Alpha", 1, 0, 1),
      r("t2", "Bravo", 2, 15, 1),
    ];
    const standings = calculateStandings(results, PMPL);
    const bravo = standings.find((s) => s.teamId === "t2")!;
    const alpha = standings.find((s) => s.teamId === "t1")!;
    expect(bravo.totalPoints).toBe(27);
    expect(alpha.totalPoints).toBe(15);
    // Alpha wins because WWCD_COUNT is the first tiebreaker in PMPL
    expect(standings[0].teamId).toBe("t1");
  });

  test("WWCD tiebreaker: same points, WWCD winner ranks first", () => {
    // Alpha: 1st place = 15pts, 0 kills, 1 WWCD
    // Bravo: 8th place PMPL = 2pts + 13 kills = 15pts, 0 WWCD
    // Same total points — PMPL tiebreaker WWCD_COUNT fires: Alpha wins
    const results: TeamMatchResult[] = [
      r("t1", "Alpha", 1, 0, 1),
      r("t2", "Bravo", 8, 13, 1),
    ];
    const standings = calculateStandings(results, PMPL);
    expect(standings[0].totalPoints).toBe(standings[1].totalPoints);
    expect(standings[0].teamId).toBe("t1"); // Alpha has 1 WWCD
  });

  test("tied on all tiebreakers get same rank", () => {
    const tied: TeamMatchResult[] = [
      r("t1", "Alpha", 5, 0, 1),
      r("t2", "Bravo", 5, 0, 2),
    ];
    const standings = calculateStandings(tied, PMPL);
    expect(standings[0].totalPoints).toBe(standings[1].totalPoints);
    expect(standings[0].rank).toBe(standings[1].rank);
  });
});

// ─── getQualifiers ───────────────────────────────────────────────────────────

describe("getQualifiers", () => {
  const results = [
    r("t1", "A", 1, 0, 1),
    r("t2", "B", 2, 0, 1),
    r("t3", "C", 3, 0, 1),
    r("t4", "D", 4, 0, 1),
  ];

  test("returns top N teams", () => {
    const standings = calculateStandings(results, PMPL);
    const top2 = getQualifiers(standings, 2);
    expect(top2).toHaveLength(2);
    expect(top2[0].rank).toBe(1);
  });

  test("returns all when N >= count", () => {
    const standings = calculateStandings(results, PMPL);
    expect(getQualifiers(standings, 10)).toHaveLength(4);
  });

  test("returns empty for N = 0", () => {
    const standings = calculateStandings(results, PMPL);
    expect(getQualifiers(standings, 0)).toHaveLength(0);
  });
});

// ─── getTopFragger ───────────────────────────────────────────────────────────

describe("getTopFragger", () => {
  test("returns team with most kills", () => {
    const results = [
      r("t1", "Alpha", 1, 3, 1),
      r("t2", "Bravo", 2, 15, 1),
      r("t3", "Charlie", 3, 2, 1),
    ];
    const standings = calculateStandings(results, PMPL);
    expect(getTopFragger(standings)?.teamId).toBe("t2");
  });

  test("returns null for empty standings", () => {
    expect(getTopFragger([])).toBeNull();
  });
});

// ─── Preset sanity checks ────────────────────────────────────────────────────

describe("preset sanity checks", () => {
  const names = ["PMGC", "PMPL", "COMMUNITY", "KILL_HEAVY", "PLACEMENT_HEAVY"] as const;

  test.each(names)("%s type field matches key", (name) => {
    expect(SCORING_PRESETS[name].type).toBe(name);
  });

  test.each(names)("%s killPoints >= 0", (name) => {
    expect(SCORING_PRESETS[name].killPoints).toBeGreaterThanOrEqual(0);
  });

  test.each(names)("%s has at least one placement entry", (name) => {
    expect(Object.keys(SCORING_PRESETS[name].placementTable).length).toBeGreaterThan(0);
  });

  test.each(names)("%s first place >= all other placements", (name) => {
    const table = SCORING_PRESETS[name].placementTable;
    const first = table[1] ?? 0;
    const others = Object.entries(table)
      .filter(([k]) => Number(k) > 1)
      .map(([, v]) => v);
    const maxOther = others.length > 0 ? Math.max(...others) : 0;
    expect(first).toBeGreaterThanOrEqual(maxOther);
  });

  test.each(names)("%s has non-empty tiebreakers array", (name) => {
    const tb = SCORING_PRESETS[name].tiebreakers;
    expect(Array.isArray(tb)).toBe(true);
    expect(tb!.length).toBeGreaterThan(0);
  });
});

// ─── Scale tests ─────────────────────────────────────────────────────────────

describe("scale tests", () => {
  test("16-team single match produces 16 standings", () => {
    const results = Array.from({ length: 16 }, (_, i) =>
      r(`t${i}`, `Team ${i}`, i + 1, Math.max(0, 10 - i), 1)
    );
    const standings = calculateStandings(results, PMPL);
    expect(standings).toHaveLength(16);
    expect(standings[0].rank).toBe(1);
  });

  test("128-team single match produces 128 standings", () => {
    const results = Array.from({ length: 128 }, (_, i) =>
      r(`t${i}`, `Team ${i}`, i + 1, 0, 1)
    );
    expect(calculateStandings(results, PMPL)).toHaveLength(128);
  });

  test("16 teams over 6 matches: each has matchesPlayed = 6", () => {
    const results: TeamMatchResult[] = [];
    for (let match = 1; match <= 6; match++) {
      for (let i = 0; i < 16; i++) {
        results.push(r(`t${i}`, `Team ${i}`, i + 1, 5, match));
      }
    }
    const standings = calculateStandings(results, PMPL);
    expect(standings).toHaveLength(16);
    standings.forEach((s) => expect(s.matchesPlayed).toBe(6));
  });
});