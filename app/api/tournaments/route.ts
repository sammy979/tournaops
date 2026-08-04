import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { validateTournamentInput } from "@/lib/validation";
import { logError } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
  const suffix = Math.random().toString(36).substring(2, 7);
  return base + "-" + suffix;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const tournaments = await prisma.tournament.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        status: true,
        maxTeams: true,
        isPublic: true,
        prizePool: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { teams: true, matches: true, stages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tournaments });
  } catch (err) {
    logError(err, "TOURNAMENTS_GET");
    return NextResponse.json({ error: "Failed to load tournaments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let data: Record<string, unknown>;
    try {
      data = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const validation = validateTournamentInput(data);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0], details: validation.errors },
        { status: 422 }
      );
    }

    const name = (data.name as string).trim();
    const maxTeams = Math.min(400, Math.max(2, Number(data.maxTeams)));
    const matchesPerLobby = Math.min(10, Math.max(1, Number(data.matchesPerLobby) || 4));
    const numRounds = Math.min(5, Math.max(1, Number(data.rounds) || 1));
    const mapRotation: string[] =
      Array.isArray(data.mapRotation) && data.mapRotation.length > 0
        ? (data.mapRotation as string[]).slice(0, 10)
        : ["Erangel"];

    const scoringRule: Prisma.InputJsonValue =
      data.scoringRule && typeof data.scoringRule === "object"
        ? (data.scoringRule as Prisma.InputJsonValue)
        : {
            name: "Community Standard",
            killPoints: 1,
            placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
            wwcdBonus: 0,
          };

    const teamsPerLobby = 16;
    const numLobbies = Math.max(1, Math.ceil(maxTeams / teamsPerLobby));
    const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];

    // Build rounds with properly typed lobbies for Prisma JSON field
    const roundsData: Prisma.RoundCreateWithoutTournamentInput[] = [];
    const matchesData: Prisma.MatchCreateWithoutTournamentInput[] = [];

    for (let r = 0; r < numRounds; r++) {
      const lobbiesThisRound =
        r === 0 ? numLobbies : Math.max(1, Math.ceil(numLobbies / Math.pow(2, r)));

      const lobbies: Prisma.InputJsonValue[] = [];
      const roundTempId = "round_" + r;

      for (let l = 0; l < lobbiesThisRound; l++) {
        const lobbyId = "lobby_" + r + "_" + l;
        const matchIds: string[] = [];

        for (let m = 0; m < matchesPerLobby; m++) {
          matchesData.push({
            name: "Match " + (m + 1),
            roundId: roundTempId,
            lobbyId,
            map: mapRotation[m % mapRotation.length],
            status: "pending",
            matchNumber: m + 1,
          });
          matchIds.push("match_" + r + "_" + l + "_" + m);
        }

        lobbies.push({
          id: lobbyId,
          name: lobbiesThisRound === 1 ? "Main Lobby" : "Lobby " + (l + 1),
          teamIds: [] as string[],
          matchIds,
        } as Prisma.InputJsonValue);
      }

      roundsData.push({
        name: roundNames[r] || "Round " + (r + 1),
        type: "qualifier",
        matchesPerLobby,
        order: r,
        lobbies: lobbies as Prisma.InputJsonValue,
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        slug: generateSlug(name),
        name,
        description: ((data.description as string | undefined) || "").trim(),
        prizePool: ((data.prizePool as string | undefined) || "").trim(),
        discord: ((data.discord as string | undefined) || "").trim(),
        rules: ((data.rules as string | undefined) || "").trim(),
        maxTeams,
        scoringRule,
        mapRotation,
        userId: session.userId,
        rounds: { create: roundsData },
        matches: { create: matchesData },
      },
      include: {
        teams: true,
        matches: true,
        rounds: true,
      },
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (err) {
    logError(err, "TOURNAMENTS_CREATE");
    return NextResponse.json(
      { error: "Failed to create tournament. Please try again." },
      { status: 500 }
    );
  }
}
