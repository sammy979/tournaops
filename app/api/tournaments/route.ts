import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

// GET all tournaments for logged-in user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournaments = await prisma.tournament.findMany({
    where: { userId: session.userId },
    include: { teams: true, matches: true, rounds: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tournaments });
}

// POST create tournament
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();

    if (!data.name || !data.maxTeams) {
      return NextResponse.json({ error: "Name and maxTeams required" }, { status: 400 });
    }

    // Generate teams
    const teamsData = Array.from({ length: data.maxTeams }, (_, i) => ({
      name: `Team ${i + 1}`,
      tag: `T${i + 1}`,
      seed: i + 1,
      players: Array.from({ length: 4 }, (_, j) => ({
        id: Math.random().toString(36).substring(2, 10),
        name: `Player ${j + 1}`,
        ign: `Player${i + 1}_${j + 1}`,
        role: ["IGL", "Fragger", "Support", "Entry"][j],
      })),
    }));

    // Generate rounds + matches
    const teamsPerLobby = 16;
    const numLobbies = Math.max(1, Math.ceil(data.maxTeams / teamsPerLobby));
    const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];

    const roundsData: any[] = [];
    const matchesData: any[] = [];

    for (let r = 0; r < Math.max(1, data.rounds || 1); r++) {
      const lobbiesThisRound = r === 0 ? numLobbies : Math.max(1, Math.ceil(numLobbies / Math.pow(2, r)));
      const lobbies: any[] = [];

      for (let l = 0; l < lobbiesThisRound; l++) {
        const lobbyId = `lobby_${r}_${l}`;
        const startIdx = l * teamsPerLobby;
        const matchIds: string[] = [];

        for (let m = 0; m < Math.max(1, data.matchesPerLobby || 4); m++) {
          const matchId = `match_${r}_${l}_${m}`;
          matchesData.push({
            id: matchId,
            name: `Match ${m + 1}`,
            roundId: `round_${r}`,
            lobbyId,
            map: data.mapRotation?.[m % data.mapRotation.length] || "Erangel",
            status: "pending",
            matchNumber: m + 1,
          });
          matchIds.push(matchId);
        }

        lobbies.push({
          id: lobbyId,
          name: lobbiesThisRound === 1 ? "Main Lobby" : `Lobby ${l + 1}`,
          teamIds: [], // filled below after team IDs known
          matchIds,
        });
      }

      roundsData.push({
        id: `round_${r}`,
        name: roundNames[r] || `Round ${r + 1}`,
        type: "qualifier",
        matchesPerLobby: data.matchesPerLobby || 4,
        order: r,
        lobbies,
      });
    }

    const tournament = await prisma.tournament.create({
      data: {
        slug: generateSlug(data.name),
        name: data.name,
        description: data.description || "",
        prizePool: data.prizePool || "",
        discord: data.discord || "",
        rules: data.rules || "",
        maxTeams: data.maxTeams,
        scoringRule: data.scoringRule,
        mapRotation: data.mapRotation || ["Erangel"],
        userId: session.userId,
        teams: { create: teamsData },
        rounds: { create: roundsData.map(r => ({ ...r, id: undefined })) },
        matches: { create: matchesData.map(m => ({ ...m, id: undefined })) },
      },
      include: { teams: true, matches: true, rounds: true },
    });

    // Now fill lobby teamIds properly
    const teamIds = tournament.teams.map(t => t.id);
    const updatedRounds = tournament.rounds.map((round) => {
      const lobbies = (round.lobbies as any[]).map((lobby: any, lIdx: number) => {
        const startIdx = lIdx * teamsPerLobby;
        return {
          ...lobby,
          teamIds: teamIds.slice(startIdx, startIdx + teamsPerLobby),
        };
      });
      return prisma.round.update({
        where: { id: round.id },
        data: { lobbies },
      });
    });
    await Promise.all(updatedRounds);

    const finalTournament = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: { teams: true, matches: true, rounds: true },
    });

    return NextResponse.json({ tournament: finalTournament });
  } catch (err: any) {
    console.error("Create tournament error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}