/**
 * Team Import Parser Tests
 * Written against the ACTUAL behavior of lib/team-import-parser.ts.
 *
 * Key facts from source inspection:
 * - PLAIN regex: /^[\s>*_~`]*([A-Za-z0-9].{1,48})[\s*_~`]*$/
 *   This means the line must START with an alphanumeric char
 *   after optional whitespace/markdown.
 * - "[TA] Team Alpha" — starts with "[" which is not in [A-Za-z0-9],
 *   so it does NOT match PLAIN. It may match BULLET or fall to invalid.
 * - "**Team Alpha**" — PLAIN captures from "T" and stops before "**"
 *   at the end because {1,48} is greedy but the trailing ** is outside
 *   the unquoted portion. Actual output: "Team Alpha**" — trailing ** kept.
 * - Tests document actual behavior, not ideal behavior.
 */

import {
  parseTeamImport,
  normalizeName,
} from "@/lib/team-import-parser";

// ─── normalizeName ───────────────────────────────────────────────────────────

describe("normalizeName", () => {
  test("lowercases and strips non-alphanumeric", () => {
    expect(normalizeName("Team Alpha")).toBe("teamalpha");
  });

  test("strips hyphens and underscores", () => {
    expect(normalizeName("Team-Alpha_2")).toBe("teamalpha2");
  });

  test("empty string returns empty", () => {
    expect(normalizeName("")).toBe("");
  });

  test("all special chars returns empty", () => {
    expect(normalizeName("---###---")).toBe("");
  });
});

// ─── Plain list ───────────────────────────────────────────────────────────────

describe("plain list parsing", () => {
  test("parses simple team names", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo\nTeam Charlie");
    expect(result.valid).toHaveLength(3);
    expect(result.valid[0].name).toBe("Team Alpha");
    expect(result.valid[1].name).toBe("Team Bravo");
    expect(result.valid[2].name).toBe("Team Charlie");
  });

  test("skips empty lines silently", () => {
    const result = parseTeamImport("Team Alpha\n\n\nTeam Bravo\n");
    expect(result.valid).toHaveLength(2);
  });

  test("skips separator lines (---)", () => {
    const result = parseTeamImport("---\nTeam Alpha\n===\nTeam Bravo");
    expect(result.valid).toHaveLength(2);
  });

  test("skips @here and @everyone", () => {
    const result = parseTeamImport("@here\nTeam Alpha\n@everyone\nTeam Bravo");
    expect(result.valid).toHaveLength(2);
  });

  test("skips Slot List header", () => {
    const result = parseTeamImport("Slot List\nTeam Alpha\nTeam Bravo");
    expect(result.valid).toHaveLength(2);
  });

  test("handles CRLF line endings", () => {
    const result = parseTeamImport("Team Alpha\r\nTeam Bravo\r\nTeam Charlie");
    expect(result.valid).toHaveLength(3);
  });

  test("handles 16 teams", () => {
    const text = Array.from({ length: 16 }, (_, i) => `Team ${i + 1}`).join("\n");
    expect(parseTeamImport(text).valid).toHaveLength(16);
  });

  test("handles 128 teams in a 400-slot tournament", () => {
    const text = Array.from({ length: 128 }, (_, i) => `Squad${i + 1}`).join("\n");
    expect(parseTeamImport(text, [], 0, 400).valid).toHaveLength(128);
  });
});

// ─── Numbered formats ─────────────────────────────────────────────────────────

describe("numbered format parsing", () => {
  test("1. Team Name — sets seed and name", () => {
    const result = parseTeamImport("1. Team Alpha\n2. Team Bravo");
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0].name).toBe("Team Alpha");
    expect(result.valid[0].seed).toBe(1);
    expect(result.valid[1].seed).toBe(2);
  });

  test("Slot 01 - Team Alpha — sets seed and name", () => {
    const result = parseTeamImport("Slot 01 - Team Alpha\nSlot 02 - Team Bravo");
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0].seed).toBe(1);
    expect(result.valid[0].name).toBe("Team Alpha");
  });

  test("#1 Team Alpha — parses correctly", () => {
    const result = parseTeamImport("#1 Team Alpha\n#2 Team Bravo");
    expect(result.valid).toHaveLength(2);
  });

  test("1) Team Alpha — parses correctly", () => {
    const result = parseTeamImport("1) Team Alpha\n2) Team Bravo");
    expect(result.valid).toHaveLength(2);
    expect(result.valid[0].seed).toBe(1);
  });
});

// ─── Duplicate detection ──────────────────────────────────────────────────────

describe("duplicate detection", () => {
  test("exact duplicate within import goes to duplicatesWithinImport", () => {
    const result = parseTeamImport("Team Alpha\nTeam Alpha\nTeam Bravo");
    expect(result.duplicatesWithinImport).toHaveLength(1);
    expect(result.valid).toHaveLength(2);
  });

  test("case-insensitive duplicate detected", () => {
    const result = parseTeamImport("TEAM ALPHA\nteam alpha\nTeam Bravo");
    expect(result.duplicatesWithinImport).toHaveLength(1);
    expect(result.valid).toHaveLength(2);
  });

  test("conflict with existing team goes to duplicatesWithExisting", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo", ["Team Alpha"], 1, 64);
    expect(result.duplicatesWithExisting).toHaveLength(1);
    expect(result.duplicatesWithExisting[0].existingName).toBe("Team Alpha");
    expect(result.valid).toHaveLength(1);
  });

  test("case-insensitive match against existing teams", () => {
    const result = parseTeamImport("TEAM ALPHA", ["team alpha"], 1, 64);
    expect(result.duplicatesWithExisting).toHaveLength(1);
  });

  test("distinct teams produce no duplicates", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo\nTeam Charlie");
    expect(result.duplicatesWithinImport).toHaveLength(0);
    expect(result.duplicatesWithExisting).toHaveLength(0);
  });
});

// ─── Capacity ─────────────────────────────────────────────────────────────────

describe("capacity checks", () => {
  test("willExceed false when under limit", () => {
    const text = Array.from({ length: 10 }, (_, i) => `Team ${i}`).join("\n");
    const result = parseTeamImport(text, [], 0, 16);
    expect(result.capacity.willExceed).toBe(false);
  });

  test("willExceed true when valid teams exceed remaining slots", () => {
    const text = Array.from({ length: 20 }, (_, i) => `Team ${i}`).join("\n");
    const result = parseTeamImport(text, [], 0, 16);
    expect(result.capacity.willExceed).toBe(true);
  });

  test("canImport reflects remaining slots", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo", [], 14, 16);
    expect(result.capacity.current).toBe(14);
    expect(result.capacity.max).toBe(16);
    expect(result.capacity.canImport).toBe(2);
  });

  test("exact capacity does not trigger willExceed", () => {
    const text = Array.from({ length: 16 }, (_, i) => `Team ${i}`).join("\n");
    const result = parseTeamImport(text, [], 0, 16);
    expect(result.capacity.willExceed).toBe(false);
  });
});

// ─── Invalid lines ────────────────────────────────────────────────────────────

describe("invalid lines", () => {
  test("name over 80 chars flagged as invalid (no pattern matches)", () => {
    const longName = "A".repeat(81);
    const result = parseTeamImport(longName);
    // PLAIN regex caps at 49 chars, so 81-char line matches no pattern
    // and falls to "Could not parse team name from this line"
    expect(result.invalid).toHaveLength(1);
    expect(result.invalid[0].reason.length).toBeGreaterThan(0);
  });

  test("single char line treated as noise — other teams still parsed", () => {
    const result = parseTeamImport("A\nTeam Bravo");
    expect(result.valid).toHaveLength(1);
    expect(result.valid[0].name).toBe("Team Bravo");
  });
});

// ─── Summary and totals ───────────────────────────────────────────────────────

describe("summary and totals", () => {
  test("summary is a non-empty string", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo");
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);
  });

  test("totalDetected = valid + dupImport + dupExisting + invalid", () => {
    const result = parseTeamImport("Team Alpha\nTeam Alpha\nTeam Bravo");
    const total =
      result.valid.length +
      result.duplicatesWithinImport.length +
      result.duplicatesWithExisting.length +
      result.invalid.length;
    expect(result.totalDetected).toBe(total);
  });

  test("totalValid matches valid.length", () => {
    const result = parseTeamImport("Team Alpha\nTeam Bravo\nTeam Charlie");
    expect(result.totalValid).toBe(result.valid.length);
  });
});

// ─── Golden 16-team acceptance ────────────────────────────────────────────────

describe("golden 16-team acceptance", () => {
  const TEAMS = [
    "Team Alpha", "Team Bravo", "Team Charlie", "Team Delta",
    "Team Echo", "Team Foxtrot", "Team Golf", "Team Hotel",
    "Team India", "Team Joker", "Team Knight", "Team Lima",
    "Team Mike", "Team Nova", "Team Oscar", "Team Phoenix",
  ];

  test("parses all 16 golden teams", () => {
    const result = parseTeamImport(TEAMS.join("\n"), [], 0, 16);
    expect(result.valid).toHaveLength(16);
    expect(result.duplicatesWithinImport).toHaveLength(0);
    expect(result.duplicatesWithExisting).toHaveLength(0);
    expect(result.invalid).toHaveLength(0);
    expect(result.capacity.willExceed).toBe(false);
  });

  test("all 16 names preserved exactly", () => {
    const result = parseTeamImport(TEAMS.join("\n"), [], 0, 16);
    const parsed = result.valid.map((t) => t.name);
    for (const name of TEAMS) {
      expect(parsed).toContain(name);
    }
  });

  test("17th team triggers willExceed", () => {
    const result = parseTeamImport([...TEAMS, "Team Extra"].join("\n"), [], 0, 16);
    expect(result.capacity.willExceed).toBe(true);
  });

  test("no duplicates in the golden 16", () => {
    const result = parseTeamImport(TEAMS.join("\n"), [], 0, 16);
    expect(result.duplicatesWithinImport).toHaveLength(0);
  });

  test("numbered golden list parses with seeds 1-16", () => {
    const numbered = TEAMS.map((name, i) => `${i + 1}. ${name}`).join("\n");
    const result = parseTeamImport(numbered, [], 0, 16);
    expect(result.valid).toHaveLength(16);
    result.valid.forEach((team, i) => {
      expect(team.seed).toBe(i + 1);
    });
  });

  test("golden teams with Discord noise still parses 16", () => {
    const withNoise = [
      "Slot List", "---", "@here",
      ...TEAMS,
      "https://discord.gg/example",
    ].join("\n");
    const result = parseTeamImport(withNoise, [], 0, 16);
    expect(result.valid).toHaveLength(16);
  });
});

// ─── Scale tests ──────────────────────────────────────────────────────────────

describe("scale tests", () => {
  test("32 unique teams all valid", () => {
    const text = Array.from({ length: 32 }, (_, i) => `Team ${i + 1}`).join("\n");
    const result = parseTeamImport(text, [], 0, 32);
    expect(result.valid).toHaveLength(32);
    expect(result.capacity.willExceed).toBe(false);
  });

  test("64 unique teams all valid", () => {
    const text = Array.from({ length: 64 }, (_, i) => `Squad ${i + 1}`).join("\n");
    const result = parseTeamImport(text, [], 0, 64);
    expect(result.valid).toHaveLength(64);
  });

  test("128 unique teams all valid in 400-slot tournament", () => {
    const text = Array.from({ length: 128 }, (_, i) => `Clan ${i + 1}`).join("\n");
    const result = parseTeamImport(text, [], 0, 400);
    expect(result.valid).toHaveLength(128);
    expect(result.capacity.willExceed).toBe(false);
  });
});