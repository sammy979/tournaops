import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { validateTournamentInput } from "@/lib/validation";
import { logError } from "@/lib/logger";
import { generateTournamentPlan, toLegacyStageConfig } from "@/lib/tournament-generator";
import type { TournamentTemplateKey } from "@/lib/tournament-templates";
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
        overlayToken: true,
        format: true,
        game: true,
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
        : ["Erangel", "Miramar", "Sanhok", "Rondo"];

    const scoringRule: Prisma.InputJsonValue =
      data.scoringRule && typeof data.scoringRule === "object"
        ? (data.scoringRule as Prisma.InputJsonValue)
        : {
            name: "Community Standard",
            killPoints: 1,
            placementPoints: {
              1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
              6: 2, 7: 1, 8: 1, 9: 0, 10: 0,
              11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
            },
            wwcdBonus: 0,
          };

    const templateKey =
      typeof data.templateKey === "string"
        ? (data.templateKey as TournamentTemplateKey)
        : null;

    let stagesConfig: any[] = Array.isArray(data.stages) ? data.stages : [];

    // If no explicit stages are supplied but a template is supplied, generate stages server-side
    if (stagesConfig.length === 0 && templateKey && templateKey !== "CUSTOM") {
      const plan = generateTournamentPlan({
        templateKey,
        teamCount: maxTeams,
        mapRotation,
      });
      stagesConfig = toLegacyStageConfig(plan);
    }

    const useStageMode = stagesConfig.length > 0;

    const teamsPerLobby = 16;
    const numLobbies = Math.max(1, Math.ceil(maxTeams / teamsPerLobby));
    const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];

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

    // Create tournament first
    const tournament = await prisma.tournament.create({
      data: {
        slug: generateSlug(name),
        name,
        description: ((data.description as string | undefined) || "").trim(),
        prizePool: ((data.prizePool as string | undefined) || "").trim(),
        discord: ((data.discord as string | undefined) || "").trim(),
        rules: ((data.rules as string | undefined) || "").trim(),
        format: typeof data.format === "string" ? data.format : undefined,
        game: typeof data.game === "string" ? data.game : "pubg_mobile",
        maxTeams,
        scoringRule,
        mapRotation,
        userId: session.userId,
        ...(useStageMode
          ? {}
          : {
              rounds: { create: roundsData },
              matches: { create: matchesData },
            }),
      },
      include: {
        teams: true,
        matches: true,
        rounds: true,
      },
    });

    // If stage mode, create stages + groups + matches on the server in the same request
    if (useStageMode) {
      for (let sIdx = 0; sIdx < stagesConfig.length; sIdx++) {
        const stageConfig: any = stagesConfig[sIdx];
        const numGroups = Number(stageConfig.numGroups || stageConfig.groups || 1);
        const teamsPerGroup = Number(stageConfig.teamsPerGroup || 16);
        const matchesPerGroup = Number(stageConfig.matchesPerGroup || stageConfig.matches || 4);
        const stageName = String(stageConfig.name || `Stage ${sIdx + 1}`);
        const totalTeams = Number(stageConfig.totalTeams || numGroups * teamsPerGroup);

        const stage = await prisma.stage.create({
          data: {
            tournamentId: tournament.id,
            name: stageName,
            type: stageConfig.type || "GROUP_STAGE",
            order: sIdx,
            status: sIdx === 0 ? "ACTIVE" : "DRAFT",
            numGroups,
            teamsPerGroup,
            matchesPerGroup,
            totalTeams,
            qualificationRule:
              (stageConfig.qualificationRule as Prisma.InputJsonValue) ||
              ({
                type: "TOP_N_PER_GROUP",
                count: Math.max(1, Math.floor(teamsPerGroup / 2)),
              } as Prisma.InputJsonValue),
            teamsAdvancing: Number(stageConfig.teamsAdvancing || 0),
            scoringRule: scoringRule as Prisma.InputJsonValue,
            mapRotation,
            groups: {
              create: Array.from({ length: numGroups }, (_, gIdx) => ({
                name: numGroups === 1 ? "Main Group" : `Group ${String.fromCharCode(65 + gIdx)}`,
                order: gIdx,
                teamIds: [],
                matchIds: [],
                status: "PENDING",
              })),
            },
          },
          include: { groups: true },
        });

        const stageMatches: Prisma.MatchCreateManyInput[] = [];
        for (let gIdx = 0; gIdx < numGroups; gIdx++) {
          const group = stage.groups[gIdx];
          for (let mIdx = 0; mIdx < matchesPerGroup; mIdx++) {
            stageMatches.push({
              tournamentId: tournament.id,
              stageId: stage.id,
              groupId: group.id,
              roundId: "no-round",
              lobbyId: `stage_${stage.id}_group_${group.id}`,
              name:
                numGroups === 1
                  ? `${stageName} - Match ${mIdx + 1}`
                  : `${stageName} - ${group.name} - Match ${mIdx + 1}`,
              map: mapRotation[mIdx % mapRotation.length],
              status: "pending",
              matchNumber: mIdx + 1,
            });
          }
        }

        if (stageMatches.length > 0) {
          await prisma.match.createMany({ data: stageMatches });
        }
      }
    }

    const fullTournament = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: {
        teams: true,
        matches: true,
        rounds: true,
        stages: {
          include: { groups: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        tournament: fullTournament,
        generatedFromTemplate: !!templateKey && !Array.isArray(data.stages),
      },
      { status: 201 }
    );
  } catch (err) {
    logError(err, "TOURNAMENTS_CREATE");
    return NextResponse.json(
      { error: "Failed to create tournament. Please try again." },
      { status: 500 }
    );
  }
}