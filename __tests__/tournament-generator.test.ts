/**
 * Tournament Generator Tests
 * Written against the ACTUAL API of lib/tournament-generator.ts
 *
 * Key facts from source inspection:
 * - generateTournamentPlan() requires { templateKey, teamCount }
 * - Returns: { stages, summary, warnings, templateKey, templateLabel, teamCount, mapRotation }
 * - stages[n] has: name, type, numGroups, teamsPerGroup, matchesPerGroup, totalTeams, teamsAdvancing, qualificationRule
 * - NO .order field on stages
 * - NO .groups array on stages (groups = numGroups integer)
 * - summary has: stageCount, totalMatches, firstStageGroups, firstStageCapacity
 * - QUICK_16 with 16 teams = 1 stage (single lobby by design)
 * - CUP_32 with 32 teams = 2 stages
 * - CUP_64 with 64 teams = 3 stages
 * - CUP_128 with 128 teams = 4 stages
 */

import {
  generateTournamentPlan,
  toLegacyStageConfig,
} from "@/lib/tournament-generator";
import type { TournamentTemplateKey } from "@/lib/tournament-templates";

// Helper so every call has the required templateKey
function plan(templateKey: TournamentTemplateKey, teamCount: number) {
  return generateTournamentPlan({ templateKey, teamCount });
}

// ─── Result shape ────────────────────────────────────────────────────────────

describe("result shape", () => {
  test("has required top-level fields", () => {
    const result = plan("QUICK_16", 16);
    expect(typeof result.templateKey).toBe("string");
    expect(typeof result.templateLabel).toBe("string");
    expect(typeof result.teamCount).toBe("number");
    expect(Array.isArray(result.stages)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.mapRotation)).toBe(true);
    expect(typeof result.summary).toBe("object");
  });

  test("summary has correct numeric fields", () => {
    const result = plan("QUICK_16", 16);
    expect(typeof result.summary.stageCount).toBe("number");
    expect(typeof result.summary.totalMatches).toBe("number");
    expect(typeof result.summary.firstStageGroups).toBe("number");
    expect(typeof result.summary.firstStageCapacity).toBe("number");
  });

  test("summary.stageCount matches stages.length", () => {
    const result = plan("CUP_32", 32);
    expect(result.summary.stageCount).toBe(result.stages.length);
  });

  test("summary.totalMatches > 0", () => {
    const result = plan("QUICK_16", 16);
    expect(result.summary.totalMatches).toBeGreaterThan(0);
  });

  test("mapRotation has at least one map", () => {
    const result = plan("QUICK_16", 16);
    expect(result.mapRotation.length).toBeGreaterThan(0);
  });
});

// ─── Stage shape ─────────────────────────────────────────────────────────────

describe("stage shape", () => {
  test("each stage has name, type, numGroups, teamsPerGroup, matchesPerGroup", () => {
    const result = plan("CUP_32", 32);
    for (const stage of result.stages) {
      expect(typeof stage.name).toBe("string");
      expect(typeof stage.type).toBe("string");
      expect(typeof stage.numGroups).toBe("number");
      expect(typeof stage.teamsPerGroup).toBe("number");
      expect(typeof stage.matchesPerGroup).toBe("number");
      expect(typeof stage.totalTeams).toBe("number");
      expect(typeof stage.teamsAdvancing).toBe("number");
      expect(typeof stage.qualificationRule).toBe("object");
    }
  });

  test("stage name is non-empty", () => {
    const result = plan("CUP_64", 64);
    for (const stage of result.stages) {
      expect(stage.name.trim().length).toBeGreaterThan(0);
    }
  });

  test("numGroups >= 1 for every stage", () => {
    const result = plan("CUP_128", 128);
    for (const stage of result.stages) {
      expect(stage.numGroups).toBeGreaterThanOrEqual(1);
    }
  });

  test("teamsPerGroup >= 1 for every stage", () => {
    const result = plan("CUP_128", 128);
    for (const stage of result.stages) {
      expect(stage.teamsPerGroup).toBeGreaterThanOrEqual(1);
    }
  });

  test("matchesPerGroup >= 1 for every stage", () => {
    const result = plan("CUP_128", 128);
    for (const stage of result.stages) {
      expect(stage.matchesPerGroup).toBeGreaterThanOrEqual(1);
    }
  });

  test("totalTeams = numGroups * teamsPerGroup", () => {
    const result = plan("CUP_64", 64);
    for (const stage of result.stages) {
      expect(stage.totalTeams).toBe(stage.numGroups * stage.teamsPerGroup);
    }
  });

  test("qualificationRule has valid type and positive count", () => {
    const result = plan("CUP_32", 32);
    const validTypes = ["TOP_N_PER_GROUP", "TOP_N_OVERALL"];
    for (const stage of result.stages) {
      expect(validTypes).toContain(stage.qualificationRule.type);
      expect(stage.qualificationRule.count).toBeGreaterThan(0);
    }
  });
});

// ─── Stage counts per template ───────────────────────────────────────────────

describe("stage counts per template", () => {
  test("QUICK_16 with 16 teams = 1 stage (single lobby by design)", () => {
    expect(plan("QUICK_16", 16).stages).toHaveLength(1);
  });

  test("CUP_32 with 32 teams = 2 stages", () => {
    expect(plan("CUP_32", 32).stages).toHaveLength(2);
  });

  test("CUP_64 with 64 teams = 3 stages", () => {
    expect(plan("CUP_64", 64).stages).toHaveLength(3);
  });

  test("CUP_128 with 128 teams = 4 stages", () => {
    expect(plan("CUP_128", 128).stages).toHaveLength(4);
  });

  test("PMPL_STYLE with 32 teams = 2 stages", () => {
    expect(plan("PMPL_STYLE", 32).stages).toHaveLength(2);
  });

  test("PMGC_STYLE with 64 teams = 3 stages", () => {
    expect(plan("PMGC_STYLE", 64).stages).toHaveLength(3);
  });

  test("COMMUNITY_CUP with 16 teams = 1 stage (single group fits all)", () => {
    expect(plan("COMMUNITY_CUP", 16).stages).toHaveLength(1);
  });

  test("COMMUNITY_CUP with 32 teams = 2 stages", () => {
    expect(plan("COMMUNITY_CUP", 32).stages).toHaveLength(2);
  });
});

// ─── First stage capacity via summary ────────────────────────────────────────

describe("first stage capacity", () => {
  test("QUICK_16 firstStageCapacity >= 16", () => {
    expect(plan("QUICK_16", 16).summary.firstStageCapacity).toBeGreaterThanOrEqual(16);
  });

  test("CUP_32 firstStageCapacity >= 32", () => {
    expect(plan("CUP_32", 32).summary.firstStageCapacity).toBeGreaterThanOrEqual(32);
  });

  test("CUP_64 firstStageCapacity >= 64", () => {
    expect(plan("CUP_64", 64).summary.firstStageCapacity).toBeGreaterThanOrEqual(64);
  });

  test("CUP_128 firstStageCapacity >= 128", () => {
    expect(plan("CUP_128", 128).summary.firstStageCapacity).toBeGreaterThanOrEqual(128);
  });

  test("firstStageGroups matches first stage numGroups", () => {
    const result = plan("CUP_64", 64);
    expect(result.summary.firstStageGroups).toBe(result.stages[0].numGroups);
  });

  test("firstStageCapacity = firstStageGroups * firstStage.teamsPerGroup", () => {
    const result = plan("CUP_32", 32);
    const expected = result.stages[0].numGroups * result.stages[0].teamsPerGroup;
    expect(result.summary.firstStageCapacity).toBe(expected);
  });
});

// ─── Total matches ────────────────────────────────────────────────────────────

describe("total matches", () => {
  test("summary.totalMatches equals sum of numGroups*matchesPerGroup", () => {
    const result = plan("CUP_64", 64);
    const expected = result.stages.reduce(
      (sum, s) => sum + s.numGroups * s.matchesPerGroup,
      0
    );
    expect(result.summary.totalMatches).toBe(expected);
  });

  test("QUICK_16: 1 group x 6 matches = 6 total", () => {
    expect(plan("QUICK_16", 16).summary.totalMatches).toBe(6);
  });

  test("CUP_32: 2 qualifier groups x 4 + 1 final x 6 = 14 total", () => {
    expect(plan("CUP_32", 32).summary.totalMatches).toBe(14);
  });
});

// ─── Warnings ────────────────────────────────────────────────────────────────

describe("warnings", () => {
  test("no capacity warning when team count exactly matches capacity", () => {
    const result = plan("QUICK_16", 16);
    const capWarnings = result.warnings.filter(
      (w) => w.code === "FIRST_STAGE_CAPACITY_EXCEEDS_TEAM_COUNT"
    );
    expect(capWarnings).toHaveLength(0);
  });

  test("capacity warning fires when stage capacity > team count", () => {
    // QUICK_16 capacity = 16 but only 8 teams
    const result = plan("QUICK_16", 8);
    const capWarnings = result.warnings.filter(
      (w) => w.code === "FIRST_STAGE_CAPACITY_EXCEEDS_TEAM_COUNT"
    );
    expect(capWarnings.length).toBeGreaterThan(0);
  });

  test("team count clamped warning fires for > 128", () => {
    const result = plan("CUP_128", 200);
    const clampWarnings = result.warnings.filter(
      (w) => w.code === "TEAM_COUNT_CLAMPED"
    );
    expect(clampWarnings.length).toBeGreaterThan(0);
  });

  test("warnings is always an array", () => {
    expect(Array.isArray(plan("CUP_32", 32).warnings)).toBe(true);
  });
});

// ─── Team count handling ──────────────────────────────────────────────────────

describe("team count handling", () => {
  const cases: Array<[TournamentTemplateKey, number]> = [
    ["QUICK_16", 4],
    ["QUICK_16", 8],
    ["QUICK_16", 16],
    ["CUP_32", 32],
    ["CUP_64", 64],
    ["CUP_128", 128],
  ];

  test.each(cases)(
    "%s with %d teams does not throw",
    (templateKey, teamCount) => {
      expect(() => plan(templateKey, teamCount)).not.toThrow();
    }
  );

  test("clamps teamCount > 128 to 128 without throwing", () => {
    const result = plan("CUP_128", 300);
    expect(result.teamCount).toBe(128);
  });

  test("clamps teamCount = 0 to default without throwing", () => {
    expect(() => plan("QUICK_16", 0)).not.toThrow();
  });
});

// ─── toLegacyStageConfig ──────────────────────────────────────────────────────

describe("toLegacyStageConfig", () => {
  test("returns array of same length as stages", () => {
    const result = plan("CUP_64", 64);
    const legacy = toLegacyStageConfig(result);
    expect(legacy).toHaveLength(result.stages.length);
  });

  test("each legacy stage has name, type, groups, teamsPerGroup, matches", () => {
    const result = plan("CUP_32", 32);
    const legacy = toLegacyStageConfig(result);
    for (const stage of legacy) {
      expect(typeof stage.name).toBe("string");
      expect(typeof stage.type).toBe("string");
      expect(typeof stage.groups).toBe("number");
      expect(typeof stage.teamsPerGroup).toBe("number");
      expect(typeof stage.matches).toBe("number");
      expect(typeof stage.totalTeams).toBe("number");
      expect(typeof stage.teamsAdvancing).toBe("number");
    }
  });

  test("legacy.groups = stage.numGroups", () => {
    const result = plan("CUP_64", 64);
    const legacy = toLegacyStageConfig(result);
    result.stages.forEach((stage, i) => {
      expect(legacy[i].groups).toBe(stage.numGroups);
    });
  });

  test("legacy.matches = stage.matchesPerGroup", () => {
    const result = plan("CUP_32", 32);
    const legacy = toLegacyStageConfig(result);
    result.stages.forEach((stage, i) => {
      expect(legacy[i].matches).toBe(stage.matchesPerGroup);
    });
  });
});

// ─── Golden 16-team acceptance ────────────────────────────────────────────────

describe("golden 16-team acceptance", () => {
  test("QUICK_16 with 16 teams: Main Event, 1 group, 6 matches", () => {
    const result = plan("QUICK_16", 16);
    expect(result.stages).toHaveLength(1);
    expect(result.stages[0].name).toBe("Main Event");
    expect(result.stages[0].numGroups).toBe(1);
    expect(result.stages[0].matchesPerGroup).toBe(6);
    expect(result.summary.totalMatches).toBe(6);
    expect(result.teamCount).toBe(16);
  });

  test("CUP_32 final stage is GRAND_FINAL type", () => {
    const result = plan("CUP_32", 32);
    const lastStage = result.stages[result.stages.length - 1];
    expect(lastStage.type).toBe("GRAND_FINAL");
  });

  test("CUP_64 final stage is single-group GRAND_FINAL", () => {
    const result = plan("CUP_64", 64);
    const lastStage = result.stages[result.stages.length - 1];
    expect(lastStage.type).toBe("GRAND_FINAL");
    expect(lastStage.numGroups).toBe(1);
  });

  test("CUP_128 group count decreases from first to last stage", () => {
    const result = plan("CUP_128", 128);
    const groupCounts = result.stages.map((s) => s.numGroups);
    expect(groupCounts[0]).toBeGreaterThan(groupCounts[groupCounts.length - 1]);
  });

  test("PMGC_STYLE with 32 teams: League Stage then Grand Final", () => {
    const result = plan("PMGC_STYLE", 32);
    expect(result.stages).toHaveLength(2);
    expect(result.stages[0].name).toBe("League Stage");
    expect(result.stages[1].name).toBe("Grand Final");
  });
});