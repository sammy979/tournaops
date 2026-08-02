import { Tournament, Team, Match, Round, Lobby, TeamMatchResult, LeaderboardEntry, ScoringRule } from "@/types/tournament";

const STORAGE_KEY = "tournaops_tournaments";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);
}

/** Validate and repair tournament data */
function normalizeT(t: any): Tournament | null {
  if (!t || typeof t !== "object") return null;
  if (!t.id || !t.name) return null;

  return {
    id: t.id,
    slug: t.slug || generateSlug(t.name),
    name: t.name,
    description: t.description || "",
    game: t.game || "pubg_mobile",
    status: t.status || "draft",
    format: t.format || "",
    prizePool: t.prizePool || "",
    maxTeams: t.maxTeams || 16,
    teams: Array.isArray(t.teams) ? t.teams.filter((tm: any) => tm && tm.id).map((tm: any) => ({
      id: tm.id,
      name: tm.name || "Team",
      logo: tm.logo,
      tag: tm.tag,
      players: Array.isArray(tm.players) ? tm.players : [],
      seed: tm.seed,
      contact: tm.contact,
    })) : [],
    matches: Array.isArray(t.matches) ? t.matches.filter((m: any) => m && m.id).map((m: any) => ({
      id: m.id,
      name: m.name || "Match",
      roundId: m.roundId || "",
      lobbyId: m.lobbyId || "",
      map: m.map || "Erangel",
      status: m.status || "pending",
      results: Array.isArray(m.results) ? m.results : undefined,
      startTime: m.startTime,
      endTime: m.endTime,
      matchNumber: m.matchNumber,
    })) : [],
    rounds: Array.isArray(t.rounds) ? t.rounds.filter((r: any) => r && r.id).map((r: any) => ({
      id: r.id,
      name: r.name || "Round",
      type: r.type || "qualifier",
      lobbies: Array.isArray(r.lobbies) ? r.lobbies.filter((l: any) => l && l.id).map((l: any) => ({
        id: l.id,
        name: l.name || "Lobby",
        teamIds: Array.isArray(l.teamIds) ? l.teamIds : [],
        matchIds: Array.isArray(l.matchIds) ? l.matchIds : [],
      })) : [],
      matchesPerLobby: r.matchesPerLobby || 4,
      advanceTop: r.advanceTop,
      order: r.order || 0,
    })) : [],
    scoringRule: t.scoringRule || {
      name: "PMGC Standard",
      placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      killPoints: 1,
    },
    mapRotation: Array.isArray(t.mapRotation) ? t.mapRotation : ["Erangel"],
    createdBy: t.createdBy || "unknown",
    createdAt: t.createdAt || new Date().toISOString(),
    updatedAt: t.updatedAt || new Date().toISOString(),
    overlayToken: t.overlayToken,
    isPublic: t.isPublic !== undefined ? t.isPublic : true,
    discord: t.discord,
    rules: t.rules,
    bannerImage: t.bannerImage,
  };
}

function getStorage(): Tournament[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Normalize each tournament, filter out null (invalid) ones
    return parsed.map(normalizeT).filter((t): t is Tournament => t !== null);
  } catch (e) {
    console.error("Storage read error:", e);
    return [];
  }
}

function setStorage(data: Tournament[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Storage write error:", e);
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function getAllTournaments(): Tournament[] {
  try {
    return getStorage().sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch { return []; }
}

export function getMyTournaments(): Tournament[] {
  try {
    const all = getStorage();
    if (typeof window === "undefined") return all;
    const raw = localStorage.getItem("tournaops_current_user");
    if (!raw) return all;
    const user = JSON.parse(raw);
    if (!user || !user.id) return all;
    return all
      .filter(t => t.createdBy === user.id || t.createdBy === "anonymous" || t.createdBy === "unknown")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch { return []; }
}

export function getTournamentById(id: string): Tournament | undefined {
  try {
    return getStorage().find(t => t.id === id);
  } catch { return undefined; }
}

export function getTournamentBySlug(slug: string): Tournament | undefined {
  try {
    return getStorage().find(t => t.slug === slug);
  } catch { return undefined; }
}

export function saveTournament(tournament: Tournament): Tournament {
  try {
    const all = getStorage();
    const idx = all.findIndex(t => t.id === tournament.id);
    const updated = { ...tournament, updatedAt: new Date().toISOString() };
    if (idx >= 0) all[idx] = updated;
    else all.push(updated);
    setStorage(all);
    return updated;
  } catch (e) {
    console.error("Save failed:", e);
    return tournament;
  }
}

export function deleteTournament(id: string): void {
  try {
    const all = getStorage().filter(t => t.id !== id);
    setStorage(all);
  } catch (e) {
    console.error("Delete failed:", e);
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

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
      if (typeof window === "undefined") return "anonymous";
      const raw = localStorage.getItem("tournaops_current_user");
      return raw ? JSON.parse(raw).id : "anonymous";
    } catch { return "anonymous"; }
  })();

  const id = generateId();
  const slug = generateSlug(data.name);
  const overlayToken = generateId();

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

  const teamsPerLobby = 16;
  const numLobbies = Math.max(1, Math.ceil(data.maxTeams / teamsPerLobby));
  const roundNames = ["Qualifiers", "Round of 32", "Semi Finals", "Grand Finals", "Super Finals"];
  const roundTypes = ["qualifier", "qualifier", "semifinal", "grand_final", "final"] as const;

  const rounds: Round[] = [];
  const matches: Match[] = [];

  for (let r = 0; r < Math.max(1, data.rounds); r++) {
    const lobbies: Lobby[] = [];
    const lobbiesThisRound = r === 0 ? numLobbies : Math.max(1, Math.ceil(numLobbies / Math.pow(2, r)));

    for (let l = 0; l < lobbiesThisRound; l++) {
      const lobbyId = generateId();
      const startIdx = l * teamsPerLobby;
      const lobbyTeams = teams.slice(startIdx, startIdx + teamsPerLobby);
      const matchIds: string[] = [];

      for (let m = 0; m < Math.max(1, data.matchesPerLobby); m++) {
        const mapIndex = m % Math.max(1, data.mapRotation.length);
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
    id, slug,
    name: data.name,
    description: data.description || "",
    game: "pubg_mobile",
    status: "draft",
    format: `${data.maxTeams} squads`,
    prizePool: data.prizePool || "",
    maxTeams: data.maxTeams,
    teams, rounds, matches,
    scoringRule: data.scoringRule,
    mapRotation: data.mapRotation.length > 0 ? data.mapRotation : ["Erangel"],
    createdBy: userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    overlayToken,
    isPublic: true,
    discord: data.discord || "",
    rules: data.rules || "",
  };

  return saveTournament(tournament);
}

// ─── MATCH RESULTS ────────────────────────────────────────────────────────────

export function submitMatchResults(
  tournamentId: string,
  matchId: string,
  results: TeamMatchResult[]
): Tournament | undefined {
  try {
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

    return saveTournament({ ...tournament, matches: updatedMatches });
  } catch (e) {
    console.error("Submit results failed:", e);
    return undefined;
  }
}

// ─── DEMO RESULTS ─────────────────────────────────────────────────────────────

export function generateDemoResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  try {
    const match = tournament.matches.find(m => m.id === matchId);
    if (!match) return [];

    const lobby = tournament.rounds.flatMap(r => r.lobbies).find(l => l.matchIds.includes(matchId));
    const lobbyTeams = lobby
      ? tournament.teams.filter(t => lobby.teamIds.includes(t.id))
      : tournament.teams.slice(0, 16);

    if (lobbyTeams.length === 0) return [];

    const shuffled = [...lobbyTeams].sort(() => Math.random() - 0.5);
    const scoring = tournament.scoringRule;

    return shuffled.map((team, idx) => {
      const placement = idx + 1;
      const placementPoints = scoring.placementPoints[placement - 1] || 0;

      const playerResults = (team.players || []).map(player => {
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

      return {
        teamId: team.id,
        teamName: team.name,
        placement,
        placementPoints,
        killPoints,
        totalPoints: placementPoints + killPoints + wwcdBonus,
        kills: totalKills,
        damage: playerResults.reduce((a, p) => a + p.damage, 0),
        wwcd: placement === 1,
        playerResults,
      };
    });
  } catch (e) {
    console.error("Demo generation failed:", e);
    return [];
  }
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────

export function getLeaderboard(tournament: Tournament, lobbyId?: string): LeaderboardEntry[] {
  try {
    if (!tournament || !tournament.matches) return [];

    const completedMatches = tournament.matches.filter(m =>
      m && m.status === "completed" && m.results && m.results.length > 0 &&
      (lobbyId ? m.lobbyId === lobbyId : true)
    );

    const teamMap: Record<string, LeaderboardEntry> = {};

    (tournament.teams || []).forEach(team => {
      if (!team || !team.id) return;
      teamMap[team.id] = {
        rank: 0,
        teamId: team.id,
        teamName: team.name || "Unknown",
        totalPoints: 0, placementPoints: 0, killPoints: 0,
        totalKills: 0, totalDamage: 0, matchesPlayed: 0, wwcds: 0,
        matchResults: {},
      };
    });

    completedMatches.forEach(match => {
      if (!match.results) return;
      match.results.forEach(result => {
        if (!result || !result.teamId) return;

        if (!teamMap[result.teamId]) {
          teamMap[result.teamId] = {
            rank: 0,
            teamId: result.teamId,
            teamName: result.teamName || "Unknown",
            totalPoints: 0, placementPoints: 0, killPoints: 0,
            totalKills: 0, totalDamage: 0, matchesPlayed: 0, wwcds: 0,
            matchResults: {},
          };
        }

        const entry = teamMap[result.teamId];
        entry.totalPoints += result.totalPoints || 0;
        entry.placementPoints += result.placementPoints || 0;
        entry.killPoints += result.killPoints || 0;
        entry.totalKills += result.kills || 0;
        entry.totalDamage += result.damage || 0;
        entry.matchesPlayed += 1;
        if (result.wwcd) entry.wwcds += 1;
        entry.matchResults[match.id] = {
          placement: result.placement || 0,
          kills: result.kills || 0,
          placementPoints: result.placementPoints || 0,
          killPoints: result.killPoints || 0,
          totalPoints: result.totalPoints || 0,
          damage: result.damage || 0,
        };
      });
    });

    const sorted = Object.values(teamMap).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return b.totalDamage - a.totalDamage;
    });

    sorted.forEach((entry, idx) => { entry.rank = idx + 1; });
    return sorted;
  } catch (e) {
    console.error("Leaderboard failed:", e);
    return [];
  }
}

// ─── TOP PLAYERS ──────────────────────────────────────────────────────────────

export function getTopPlayers(tournament: Tournament) {
  const empty = { topKillers: [], topDamage: [], topKD: [] };

  try {
    if (!tournament || !tournament.matches) return empty;

    const playerMap: Record<string, any> = {};

    tournament.matches.forEach(match => {
      if (!match || match.status !== "completed" || !match.results) return;
      match.results.forEach(result => {
        if (!result || !result.playerResults) return;
        result.playerResults.forEach(pr => {
          if (!pr || !pr.playerId) return;
          const key = pr.playerId;
          if (!playerMap[key]) {
            playerMap[key] = {
              playerName: pr.playerName || "Unknown",
              teamName: result.teamName || "Unknown",
              kills: 0, damage: 0, matches: 0,
            };
          }
          playerMap[key].kills += pr.kills || 0;
          playerMap[key].damage += pr.damage || 0;
          playerMap[key].matches += 1;
        });
      });
    });

    const players = Object.values(playerMap);
    return {
      topKillers: [...players].sort((a: any, b: any) => b.kills - a.kills).slice(0, 10),
      topDamage: [...players].sort((a: any, b: any) => b.damage - a.damage).slice(0, 10),
      topKD: [...players].filter((p: any) => p.matches > 0).sort((a: any, b: any) => (b.kills / b.matches) - (a.kills / a.matches)).slice(0, 10),
    };
  } catch (e) {
    console.error("Top players failed:", e);
    return empty;
  }
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export function getTournamentStats(tournament: Tournament) {
  try {
    if (!tournament) return { completedMatches: 0, totalMatches: 0, progress: 0, leader: "TBD", leaderPoints: 0, totalKills: 0, teamsCount: 0 };

    const completed = (tournament.matches || []).filter(m => m && m.status === "completed").length;
    const total = (tournament.matches || []).length;
    const leaderboard = getLeaderboard(tournament);
    const leader = leaderboard[0];
    const totalKills = leaderboard.reduce((a, e) => a + (e.totalKills || 0), 0);

    return {
      completedMatches: completed,
      totalMatches: total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      leader: leader?.teamName || "TBD",
      leaderPoints: leader?.totalPoints || 0,
      totalKills,
      teamsCount: (tournament.teams || []).length,
    };
  } catch (e) {
    console.error("Stats failed:", e);
    return { completedMatches: 0, totalMatches: 0, progress: 0, leader: "TBD", leaderPoints: 0, totalKills: 0, teamsCount: 0 };
  }
}