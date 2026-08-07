import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const BUILT_IN_PRESETS = [
  {
    id: "builtin_pmgc",
    name: "PMGC Style",
    description: "Global Championship style scoring (VERIFY with official rules)",
    scoringRule: {
      placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      killPoints: 1,
      wwcdBonus: 0,
      top3Bonus: 0,
      tiebreakerOrder: ["points", "kills", "damage", "wwcd"],
    },
    isOfficial: false,
    officialSource: "PMGC-style reference (NOT verified as current official)",
    isBuiltIn: true,
  },
  {
    id: "builtin_pmpl",
    name: "PMPL Style",
    description: "Pro League South Asia style (VERIFY with official rules)",
    scoringRule: {
      placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      killPoints: 1,
      wwcdBonus: 5,
      top3Bonus: 0,
      tiebreakerOrder: ["points", "wwcd", "kills", "damage"],
    },
    isOfficial: false,
    officialSource: "PMPL-style reference (NOT verified as current official)",
    isBuiltIn: true,
  },
  {
    id: "builtin_community",
    name: "Community Standard",
    description: "Balanced community tournament scoring",
    scoringRule: {
      placementPoints: [12, 9, 7, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
      killPoints: 1,
      wwcdBonus: 0,
      top3Bonus: 0,
      tiebreakerOrder: ["points", "kills", "damage", "wwcd"],
    },
    isOfficial: false,
    isBuiltIn: true,
  },
  {
    id: "builtin_killheavy",
    name: "Kill Heavy",
    description: "Emphasis on eliminations - 2pts per kill",
    scoringRule: {
      placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      killPoints: 2,
      wwcdBonus: 0,
      top3Bonus: 0,
      tiebreakerOrder: ["kills", "points", "damage"],
    },
    isOfficial: false,
    isBuiltIn: true,
  },
];

export async function GET(req: NextRequest) {
  const session = await getSession();

  let userPresets: any[] = [];
  if (session) {
    userPresets = await prisma.userScoringPreset.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
    });
  }

  return NextResponse.json({
    builtIn: BUILT_IN_PRESETS,
    custom: userPresets,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();

  if (!data.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const scoringRule = {
    placementPoints: data.placementPoints ?? [],
    killPoints: data.killPoints ?? 1,
    wwcdBonus: data.wwcdBonus ?? 0,
    top3Bonus: data.top3Bonus ?? 0,
    perfectMatchBonus: data.perfectMatchBonus ?? 0,
    maxKillPoints: data.maxKillPoints ?? null,
    finalMatchMultiplier: data.finalMatchMultiplier ?? null,
    tiebreakerOrder: data.tiebreakerOrder ?? ["points", "wwcd", "kills", "damage"],
  };

  const preset = await prisma.userScoringPreset.create({
    data: {
      userId: session.userId,
      name: data.name,
      description: data.description ?? "",
      scoringRule,
      isDefault: data.isDefault ?? false,
    },
  });

  return NextResponse.json({ preset });
}