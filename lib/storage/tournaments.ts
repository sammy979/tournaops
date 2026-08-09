"use client";

import { Tournament, ScoringRule, TeamMatchResult, LeaderboardEntry } from "@/types/tournament";

// â”€â”€â”€ API HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function fetchTournaments(): Promise<Tournament[]> {
  try {
    const res = await fetch("/api/tournaments", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tournaments || [];
  } catch (e) {
    console.error("Fetch tournaments failed:", e);
    return [];
  }
}

async function fetchTournamentById(id: string): Promise<Tournament | undefined> {
  try {
    const res = await fetch(`/api/tournaments/${id}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.tournament;
  } catch {
    return undefined;
  }
}

async function fetchTournamentBySlug(slug: string): Promise<Tournament | undefined> {
  try {
    const all = await fetchTournaments();
    return all.find(t => t.slug === slug);
  } catch {
    return undefined;
  }
}

// â”€â”€â”€ SYNC-STYLE CACHED FUNCTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Note: These are async now but keep the same names for compat
// UI code will need to await these

let cache: Tournament[] = [];
let cacheTime = 0;
const CACHE_TTL = 3000;

async function loadCache(force = false): Promise<Tournament[]> {
  const now = Date.now();
  if (!force && cache.length > 0 && now - cacheTime < CACHE_TTL) return cache;
  cache = await fetchTournaments();
  cacheTime = now;
  return cache;
}

export function invalidateCache() {
  cache = [];
  cacheTime = 0;
}

// â”€â”€â”€ PUBLIC API (Async) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getAllTournaments(): Promise<Tournament[]> {
  return loadCache();
}

export async function getMyTournaments(): Promise<Tournament[]> {
  return loadCache();
}

export async function getTournamentById(id: string): Promise<Tournament | undefined> {
  return fetchTournamentById(id);
}

export async function getTournamentBySlug(slug: string): Promise<Tournament | undefined> {
  return fetchTournamentBySlug(slug);
}

export async function saveTournament(tournament: Tournament): Promise<Tournament | undefined> {
  try {
    const res = await fetch(`/api/tournaments/${tournament.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournament),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    invalidateCache();
    return data.tournament;
  } catch (e) {
    console.error("Save failed:", e);
    return undefined;
  }
}

export async function deleteTournament(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
    if (res.ok) invalidateCache();
    return res.ok;
  } catch {
    return false;
  }
}

export async function createTournament(data: {
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
}): Promise<Tournament | undefined> {
  try {
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error("Create failed:", err);
      return undefined;
    }
    const result = await res.json();
    invalidateCache();
    return result.tournament;
  } catch (e) {
    console.error("Create tournament failed:", e);
    return undefined;
  }
}

export async function submitMatchResults(
  tournamentId: string,
  matchId: string,
  results: TeamMatchResult[]
): Promise<Tournament | undefined> {
  try {
    const sortedResults = results.sort((a, b) => a.placement - b.placement);

    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
        results: sortedResults,
      }),
    });

    if (!res.ok) {
      console.error("Submit failed:", await res.text());
      return undefined;
    }

    const data = await res.json();
    invalidateCache();
    return data.tournament;
  } catch (e) {
    console.error("Submit results failed:", e);
    return undefined;
  }
}

// â”€â”€â”€ DEMO RESULTS (Client-side) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function generateDemoResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  try {
    const match = (tournament.matches ?? []).find(m => m.id === matchId);
    if (!match) return [];

    const lobby = (tournament.rounds ?? []).flatMap(r => r.lobbies).find(l => l.matchIds.includes(matchId));
    const lobbyTeams = lobby
      ? (tournament.teams ?? []).filter(t => lobby.teamIds.includes(t.id))
      : (tournament.teams ?? []).slice(0, 16);

    if (lobbyTeams.length === 0) return [];

    const shuffled = [...lobbyTeams].sort(() => Math.random() - 0.5);
    const scoring = tournament.scoringRule;

    return shuffled.map((team, idx) => {
      const placement = idx + 1;
      const placementPoints = scoring.placementPoints[placement - 1] || 0;

      const playerResults = (team.players || []).map(player => {
        const kills = placement <= 3 ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 4);
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
  } catch {
    return [];
  }
}

// â”€â”€â”€ LEADERBOARD (Pure client-side, from tournament data) â”€â”€â”€

export function getLeaderboard(tournament: Tournament, lobbyId?: string): LeaderboardEntry[] {
  try {
    if (!tournament?.matches) return [];

    const completedMatches = (tournament.matches ?? []).filter(m =>
      m?.status === "completed" && m.results && m.results.length > 0 &&
      (lobbyId ? m.lobbyId === lobbyId : true)
    );

    const teamMap: Record<string, LeaderboardEntry> = {};

    ((tournament.teams ?? []) || []).forEach(team => {
      if (!team?.id) return;
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
        if (!result?.teamId) return;
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
  } catch {
    return [];
  }
}

export function getTopPlayers(tournament: Tournament) {
  const empty = { topKillers: [], topDamage: [], topKD: [] };
  try {
    if (!tournament?.matches) return empty;

    const playerMap: Record<string, any> = {};

    (tournament.matches ?? []).forEach(match => {
      if (!match || match.status !== "completed" || !match.results) return;
      match.results.forEach(result => {
        if (!result?.playerResults) return;
        result.playerResults.forEach(pr => {
          if (!pr?.playerId) return;
          if (!playerMap[pr.playerId]) {
            playerMap[pr.playerId] = {
              playerName: pr.playerName || "Unknown",
              teamName: result.teamName || "Unknown",
              kills: 0, damage: 0, matches: 0,
            };
          }
          playerMap[pr.playerId].kills += pr.kills || 0;
          playerMap[pr.playerId].damage += pr.damage || 0;
          playerMap[pr.playerId].matches += 1;
        });
      });
    });

    const players = Object.values(playerMap);
    return {
      topKillers: [...players].sort((a: any, b: any) => b.kills - a.kills).slice(0, 10),
      topDamage: [...players].sort((a: any, b: any) => b.damage - a.damage).slice(0, 10),
      topKD: [...players].filter((p: any) => p.matches > 0).sort((a: any, b: any) => (b.kills / b.matches) - (a.kills / a.matches)).slice(0, 10),
    };
  } catch {
    return empty;
  }
}

export function getTournamentStats(tournament: Tournament) {
  try {
    if (!tournament) return { completedMatches: 0, totalMatches: 0, progress: 0, leader: "TBD", leaderPoints: 0, totalKills: 0, teamsCount: 0 };
    const completed = ((tournament.matches ?? []) || []).filter(m => m?.status === "completed").length;
    const total = ((tournament.matches ?? []) || []).length;
    const leaderboard = getLeaderboard(tournament);
    const leader = leaderboard[0];
    return {
      completedMatches: completed,
      totalMatches: total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
      leader: leader?.teamName || "TBD",
      leaderPoints: leader?.totalPoints || 0,
      totalKills: leaderboard.reduce((a, e) => a + (e.totalKills || 0), 0),
      teamsCount: ((tournament.teams ?? []) || []).length,
    };
  } catch {
    return { completedMatches: 0, totalMatches: 0, progress: 0, leader: "TBD", leaderPoints: 0, totalKills: 0, teamsCount: 0 };
  }
}