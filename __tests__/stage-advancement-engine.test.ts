/**
 * Stage Advancement Engine Tests
 * Tests lib/stage-advancement-engine.ts pure logic functions.
 * advanceStage() and triggerAutoAdvanceIfComplete() require a real DB
 * so they are integration-tested manually. Only pure functions are unit-tested here.
 */

import { checkStageCompletion } from "@/lib/stage-advancement-engine";

// checkStageCompletion calls prisma — we mock it
jest.mock("@/lib/prisma", () => ({
  prisma: {
    stage: {
      findUnique: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";

const mockStage = jest.mocked(prisma.stage.findUnique);
const mockMatches = jest.mocked(prisma.match.findMany);

function makeStage(overrides: any = {}) {
  return {
    id: "stage-1",
    name: "Qualifiers",
    type: "QUALIFIER",
    status: "ACTIVE",
    isLocked: false,
    numGroups: 2,
    teamsPerGroup: 4,
    matchesPerGroup: 4,
    totalTeams: 8,
    order: 1,
    groups: [
      { id: "g1", teamIds: ["t1", "t2", "t3", "t4"], matchIds: ["m1", "m2", "m3", "m4"] },
      { id: "g2", teamIds: ["t5", "t6", "t7", "t8"], matchIds: ["m5", "m6", "m7", "m8"] },
    ],
    ...overrides,
  };
}

function makeMatch(id: string, status: string, hasResults: boolean) {
  return {
    id,
    status,
    results: hasResults ? [{ teamId: "t1", placement: 1, kills: 5, totalPoints: 20 }] : [],
  };
}

describe("checkStageCompletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns complete=true when all matches completed with results", async () => {
    (mockStage as any).mockResolvedValue(makeStage());
    (mockMatches as any).mockResolvedValue([
      makeMatch("m1", "completed", true),
      makeMatch("m2", "completed", true),
      makeMatch("m3", "completed", true),
      makeMatch("m4", "completed", true),
      makeMatch("m5", "completed", true),
      makeMatch("m6", "completed", true),
      makeMatch("m7", "completed", true),
      makeMatch("m8", "completed", true),
    ]);

    const result = await checkStageCompletion("stage-1");
    expect(result.isComplete).toBe(true);
    expect(result.completedMatches).toBe(8);
    expect(result.totalMatches).toBe(8);
  });

  test("returns complete=false when some matches pending", async () => {
    (mockStage as any).mockResolvedValue(makeStage());
    (mockMatches as any).mockResolvedValue([
      makeMatch("m1", "completed", true),
      makeMatch("m2", "completed", true),
      makeMatch("m3", "pending", false),
      makeMatch("m4", "pending", false),
      makeMatch("m5", "completed", true),
      makeMatch("m6", "completed", true),
      makeMatch("m7", "completed", true),
      makeMatch("m8", "pending", false),
    ]);

    const result = await checkStageCompletion("stage-1");
    expect(result.isComplete).toBe(false);
    expect(result.completedMatches).toBe(5);
    // pendingMatches field not in return shape — verified via isComplete + completedMatches
  });

  test("returns complete=false when stage has no matches", async () => {
    (mockStage as any).mockResolvedValue(makeStage());
    (mockMatches as any).mockResolvedValue([]);

    const result = await checkStageCompletion("stage-1");
    expect(result.isComplete).toBe(false);
    expect(result.totalMatches).toBe(0);
  });

  test("returns complete=false when stage not found", async () => {
    (mockStage as any).mockResolvedValue(null);
    (mockMatches as any).mockResolvedValue([]);

    const result = await checkStageCompletion("nonexistent");
    expect(result.isComplete).toBe(false);
  });

  test("completed match with empty results does not count", async () => {
    (mockStage as any).mockResolvedValue(makeStage());
    (mockMatches as any).mockResolvedValue([
      makeMatch("m1", "completed", false), // status=completed but no results
      makeMatch("m2", "completed", true),
    ]);

    const result = await checkStageCompletion("stage-1");
    expect(result.isComplete).toBe(false);
    expect(result.completedMatches).toBe(1);
  });

  test("locked stage with all matches returns completion status", async () => {
    (mockStage as any).mockResolvedValue(makeStage({ isLocked: true }));
    (mockMatches as any).mockResolvedValue([
      makeMatch("m1", "completed", true),
      makeMatch("m2", "completed", true),
    ]);

    const result = await checkStageCompletion("stage-1");
    expect(result.isComplete).toBe(true);
  });
});