import { Tournament, Team, Match, Round, Lobby, TeamMatchResult, LeaderboardEntry, ScoringRule } from "@/types/tournament";

const STORAGE_KEY = "tournaops_tournaments";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);
}

function getStorage(): Tournament[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setStorage(data: Tournament[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getAllTournaments(): Tournament[] {
  return getStorage().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getMyTournaments(): Tournament[] {
  const all = getStorage();
  try {
    const raw = localStorage.getItem("tournaops_current_user");
    if (!raw) return all;
    const user = JSON.parse(raw);
    return all.filter(t => t.createdBy === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return all;
  }
}

export function getTournamentById(id: string): Tournament | undefined {
  return getStorage().find(t => t.id === id);
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  return getStorage().find(t => t.slug === slug);
}

export function saveTournament(tournament: Tournament): Tournament {
  const all = getStorage();
  const idx = all.findIndex(t => t.id === tournament.id);
  const updated = { ...tournament, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push(updated);
  }
  setStorage(all);
  return updated;
}

export function deleteTournament(id: string): void {
  const all = getStorage().filter(t => t.id !== id);
  setStorage(all);
}

// ─── CREATE TOURNAMENT ────────────────────────────────────────────────────────

export function createTournament(data: {
  name: string;
  description?: string;
  prizePool?: string;
  maxTeams: number;
  scoringRule: ScoringRule;
  mapRotation: string[];
  matchesPerLobby: number;
  rounds: number;
  discord?: string;
  rules?: string;
}): Tournament {
  const userId = (() => {
    try {
      const raw = localStorage.getItem("tournaops_current_user");
      return raw ? JSON.parse(raw).id : "anonymous";
    } catch { return "anonymous"; }
  })();

  const id = generateId();
  const slug = generateSlug(data.name);
  const overlayToken = generateId();

  // Generate teams (placeholder names)
  const teams: Team[] = Array.from({ length: data.maxTeams }, (_, i) => ({
    id: generateId(),
    name: `Team ${i + 1}`,
    tag: `T${i + 1}`,
    logo: undefined,
    players: Array.from({ length: 4 }, (_, j) => ({
      id: generateId(),
      name: `Player ${j + 1}`,
      ign: `Player${i + 1}_${j + 1}`,
      role: (["IGL", "Fragger", "Support", "Entry"] as const)[j],
    })),
    seed: i + 1,
  }));

  // Build rounds
  const teamsPerLobby = 16;
  const numLobbies = Math.ceil(data.maxTeams / teamsPerLobby);
  const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];
  const roundTypes = ["qualifier", "qualifier", "semifinal", "grand_final", "final"] as const;

  const rounds: Round[] = [];
  const matches: Match[] = [];

  for (let r = 0; r < data.rounds; r++) {
    const lobbies: Lobby[] = [];
    const lobbiesThisRound = r === 0 ? numLobbies : Math.max(1, Math.ceil(numLobbies / Math.pow(2, r)));

    for (let l = 0; l < lobbiesThisRound; l++) {
      const lobbyId = generateId();
      const startIdx = l * teamsPerLobby;
      const lobbyTeams = teams.slice(startIdx, startIdx + teamsPerLobby);
      const matchIds: string[] = [];

      for (let m = 0; m < data.matchesPerLobby; m++) {
        const mapIndex = m % data.mapRotation.length;
        const matchId = generateId();
        matches.push({
          id: matchId,
          name: `Match ${m + 1}`,
          roundId: `round_${r}`,
          lobbyId,
          map: data.mapRotation[mapIndex] || "Erangel",
          status: "pending",
          matchNumber: m + 1,
        });
        matchIds.push(matchId);
      }

      lobbies.push({
        id: lobbyId,
        name: lobbiesThisRound === 1 ? "Main Lobby" : `Lobby ${l + 1}`,
        teamIds: lobbyTeams.map(t => t.id),
        matchIds,
      });
    }

    rounds.push({
      id: `round_${r}`,
      name: roundNames[r] || `Round ${r + 1}`,
      type: roundTypes[r] || "qualifier",
      lobbies,
      matchesPerLobby: data.matchesPerLobby,
      advanceTop: r < data.rounds - 1 ? teamsPerLobby : undefined,
      order: r,
    });
  }

  const tournament: Tournament = {
    id,
    slug,
    name: data.name,
    description: data.description,
    game: "pubg_mobile",
    status: "draft",
    format: `${data.maxTeams} squads`,
    prizePool: data.prizePool,
    maxTeams: data.maxTeams,
    teams,
    rounds,
    matches,
    scoringRule: data.scoringRule,
    mapRotation: data.mapRotation,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    overlayToken,
    isPublic: true,
    discord: data.discord,
    rules: data.rules,
  };

  return saveTournament(tournament);
}

// ─── MATCH RESULTS ────────────────────────────────────────────────────────────

export function submitMatchResults(
  tournamentId: string,
  matchId: string,
  results: TeamMatchResult[]
): Tournament | undefined {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return undefined;

  const updatedMatches = tournament.matches.map(m => {
    if (m.id !== matchId) return m;
    return {
      ...m,
      status: "completed" as const,
      results: results.sort((a, b) => a.placement - b.placement),
      endTime: new Date().toISOString(),
    };
  });

  const updated = saveTournament({ ...tournament, matches: updatedMatches });
  return updated;
}

// ─── DEMO RESULTS ─────────────────────────────────────────────────────────────

export function generateDemoResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return [];

  const lobby = tournament.rounds.flatMap(r => r.lobbies).find(l => l.matchIds.includes(matchId));
  const lobbyTeams = lobby
    ? tournament.teams.filter(t => lobby.teamIds.includes(t.id))
    : tournament.teams.slice(0, 16);

  const shuffled = [...lobbyTeams].sort(() => Math.random() - 0.5);
  const scoring = tournament.scoringRule;

  return shuffled.map((team, idx) => {
    const placement = idx + 1;
    const placementPoints = scoring.placementPoints[placement - 1] || 0;

    const playerResults = team.players.map(player => {
      const kills = placement <= 3
        ? Math.floor(Math.random() * 6) + 1
        : Math.floor(Math.random() * 4);
      const damage = kills * (Math.floor(Math.random() * 150) + 100) + Math.floor(Math.random() * 300);
      return {
        playerId: player.id,
        playerName: player.name,
        kills,
        damage: Math.min(damage, 2000),
        survived: placement <= 3 || Math.random() > 0.6,
        assists: Math.floor(Math.random() * 3),
        revives: Math.floor(Math.random() * 3),
        headshotKills: Math.floor(kills * 0.3),
      };
    });

    const totalKills = playerResults.reduce((a, p) => a + p.kills, 0);
    const killPoints = totalKills * scoring.killPoints;
    const wwcdBonus = placement === 1 && scoring.wwcdBonus ? scoring.wwcdBonus : 0;
    const totalPoints = placementPoints + killPoints + wwcdBonus;
    const totalDamage = playerResults.reduce((a, p) => a + p.damage, 0);

    return {
      teamId: team.id,
      teamName: team.name,
      placement,
      placementPoints,
      killPoints,
      totalPoints,
      kills: totalKills,
      damage: totalDamage,
      wwcd: placement === 1,
      playerResults,
    };
  });
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

export function getLeaderboard(tournament: Tournament, lobbyId?: string): LeaderboardEntry[] {
  const completedMatches = tournament.matches.filter(m =>
    m.status === "completed" && m.results && m.results.length > 0 &&
    (lobbyId ? m.lobbyId === lobbyId : true)
  );

  const teamMap: Record<string, LeaderboardEntry> = {};

  // Initialize all teams
  tournament.teams.forEach(team => {
    teamMap[team.id] = {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      totalPoints: 0,
      placementPoints: 0,
      killPoints: 0,
      totalKills: 0,
      totalDamage: 0,
      matchesPlayed: 0,
      wwcds: 0,
      matchResults: {},
    };
  });

  // Aggregate results
  completedMatches.forEach(match => {
    if (!match.results) return;
    match.results.forEach(result => {
      if (!teamMap[result.teamId]) {
        teamMap[result.teamId] = {
          rank: 0,
          teamId: result.teamId,
          teamName: result.teamName,
          totalPoints: 0,
          placementPoints: 0,
          killPoints: 0,
          totalKills: 0,
          totalDamage: 0,
          matchesPlayed: 0,
          wwcds: 0,
          matchResults: {},
        };
      }

      const entry = teamMap[result.teamId];
      entry.totalPoints += result.totalPoints;
      entry.placementPoints += result.placementPoints;
      entry.killPoints += result.killPoints;
      entry.totalKills += result.kills;
      entry.totalDamage += result.damage || 0;
      entry.matchesPlayed += 1;
      if (result.wwcd) entry.wwcds += 1;
      entry.matchResults[match.id] = {
        placement: result.placement,
        kills: result.kills,
        placementPoints: result.placementPoints,
        killPoints: result.killPoints,
        totalPoints: result.totalPoints,
        damage: result.damage || 0,
      };
    });
  });

  // Sort and rank
  const sorted = Object.values(teamMap)
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return b.totalDamage - a.totalDamage;
    });

  sorted.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return sorted;
}

// ─── TOP PLAYERS ──────────────────────────────────────────────────────────────

export function getTopPlayers(tournament: Tournament): {
  topKillers: Array<{ playerName: string; teamName: string; kills: number; damage: number }>;
  topDamage: Array<{ playerName: string; teamName: string; kills: number; damage: number }>;
  topKD: Array<{ playerName: string; teamName: string; kills: number; damage: number }>;
} {
  const playerMap: Record<string, {
    playerName: string;
    teamName: string;
    kills: number;
    damage: number;
    matches: number;
  }> = {};

  tournament.matches.forEach(match => {
    if (match.status !== "completed" || !match.results) return;
    match.results.forEach(result => {
      if (!result.playerResults) return;
      result.playerResults.forEach(pr => {
        const key = pr.playerId;
        if (!playerMap[key]) {
          playerMap[key] = {
            playerName: pr.playerName,
            teamName: result.teamName,
            kills: 0,
            damage: 0,
            matches: 0,
          };
        }
        playerMap[key].kills += pr.kills;
        playerMap[key].damage += pr.damage || 0;
        playerMap[key].matches += 1;
      });
    });
  });

  const players = Object.values(playerMap);
  const topKillers = [...players].sort((a, b) => b.kills - a.kills).slice(0, 10);
  const topDamage = [...players].sort((a, b) => b.damage - a.damage).slice(0, 10);
  const topKD = [...players]
    .filter(p => p.matches > 0)
    .sort((a, b) => (b.kills / b.matches) - (a.kills / a.matches))
    .slice(0, 10);

  return { topKillers, topDamage, topKD };
}

// ─── STATS ───────────────────────────────────────────────────────────────────

export function getTournamentStats(tournament: Tournament) {
  const completed = tournament.matches.filter(m => m.status === "completed").length;
  const total = tournament.matches.length;
  const leaderboard = getLeaderboard(tournament);
  const leader = leaderboard[0];
  const totalKills = leaderboard.reduce((a, e) => a + e.totalKills, 0);

  return {
    completedMatches: completed,
    totalMatches: total,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    leader: leader?.teamName || "TBD",
    leaderPoints: leader?.totalPoints || 0,
    totalKills,
    teamsCount: tournament.teams.length,
  };
}
