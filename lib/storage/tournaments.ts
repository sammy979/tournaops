"use client";
import type { Tournament } from "@/types/tournament";
import { getCurrentUser } from "@/lib/auth/auth";

const TOURNAMENTS_KEY = "tournaops_tournaments";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50) + "-" + Math.random().toString(36).substr(2, 5);
}

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TOURNAMENTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getMyTournaments(): Tournament[] {
  const user = getCurrentUser();
  if (!user) return [];
  return getAllTournaments().filter(t => t.createdBy === user.id);
}

export function getTournamentById(id: string): Tournament | null {
  return getAllTournaments().find(t => t.id === id) || null;
}

export function getTournamentBySlug(slug: string): Tournament | null {
  return getAllTournaments().find(t => t.slug === slug) || null;
}

export function saveTournament(tournament: Tournament): void {
  if (typeof window === "undefined") return;
  const all = getAllTournaments();
  const idx = all.findIndex(t => t.id === tournament.id);
  if (idx >= 0) {
    all[idx] = { ...tournament, updatedAt: new Date().toISOString() };
  } else {
    all.push(tournament);
  }
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(all));
}

export function createTournament(data: {
  name: string;
  description: string;
  game: string;
  format: any;
  bestOf: any;
  maxTeams: number;
  teams: any[];
}): Tournament {
  const user = getCurrentUser();
  if (!user) throw new Error("Not logged in");

  const tournament: Tournament = {
    id: generateId(),
    slug: generateSlug(data.name),
    name: data.name,
    description: data.description,
    game: data.game,
    format: data.format,
    status: "upcoming",
    bestOf: data.bestOf,
    maxTeams: data.maxTeams,
    teams: data.teams.map((t: any, i: number) => ({
      id: generateId(),
      name: t.name || `Team ${i + 1}`,
      tag: t.tag,
      logo: t.logo,
      seed: i + 1,
      wins: 0,
      losses: 0,
      points: 0,
    })),
    matches: [],
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerColor: ["from-indigo-500 to-purple-500", "from-purple-500 to-pink-500", "from-cyan-500 to-blue-500"][Math.floor(Math.random() * 3)],
  };

  // Generate matches based on format
  tournament.matches = generateMatches(tournament);
  
  saveTournament(tournament);
  return tournament;
}

export function deleteTournament(id: string): void {
  const all = getAllTournaments().filter(t => t.id !== id);
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(all));
}

// ═══════════════════════════════════════════════════════════════
// MATCH GENERATION
// ═══════════════════════════════════════════════════════════════
function generateMatches(tournament: Tournament): any[] {
  const { format, teams, bestOf } = tournament;
  
  if (format === "single_elim") return generateSingleElim(teams, bestOf);
  if (format === "round_robin") return generateRoundRobin(teams, bestOf);
  if (format === "swiss") return generateSwiss(teams, bestOf);
  return generateSingleElim(teams, bestOf); // fallback
}

function generateSingleElim(teams: any[], bestOf: any): any[] {
  const matches: any[] = [];
  const rounds = Math.ceil(Math.log2(teams.length));
  const totalSlots = Math.pow(2, rounds);
  
  const paddedTeams: any[] = [...teams];
  while (paddedTeams.length < totalSlots) paddedTeams.push(null);
  
  let matchNum = 1;
  const roundMatches: any[][] = [];
  
  // Round 1
  const r1: any[] = [];
  for (let i = 0; i < totalSlots / 2; i++) {
    const match: any = {
      id: generateId(),
      matchNumber: matchNum++,
      round: 1,
      team1: paddedTeams[i * 2] || undefined,
      team2: paddedTeams[i * 2 + 1] || undefined,
      score1: 0,
      score2: 0,
      status: "scheduled",
      bestOf,
      bracket: "winners",
    };
    // Auto-win if only one team
    if (match.team1 && !match.team2) {
      match.winner = match.team1;
      match.status = "completed";
    } else if (!match.team1 && match.team2) {
      match.winner = match.team2;
      match.status = "completed";
    }
    r1.push(match);
    matches.push(match);
  }
  roundMatches.push(r1);
  
  // Subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const rMatches: any[] = [];
    const prevRound = roundMatches[round - 2];
    for (let i = 0; i < prevRound.length / 2; i++) {
      const match: any = {
        id: generateId(),
        matchNumber: matchNum++,
        round,
        score1: 0,
        score2: 0,
        status: "scheduled",
        bestOf,
        bracket: "winners",
      };
      prevRound[i * 2].nextMatchId = match.id;
      prevRound[i * 2 + 1].nextMatchId = match.id;
      rMatches.push(match);
      matches.push(match);
    }
    roundMatches.push(rMatches);
  }
  
  // Propagate byes
  matches.forEach(m => {
    if (m.status === "completed" && m.winner && m.nextMatchId) {
      const next = matches.find(x => x.id === m.nextMatchId);
      if (next) {
        if (!next.team1) next.team1 = m.winner;
        else next.team2 = m.winner;
      }
    }
  });
  
  return matches;
}

function generateRoundRobin(teams: any[], bestOf: any): any[] {
  const matches: any[] = [];
  const n = teams.length;
  const isOdd = n % 2 !== 0;
  const players = isOdd ? [...teams, null] : [...teams];
  const totalRounds = players.length - 1;
  const matchesPerRound = players.length / 2;
  const arr = [...players];
  let matchNum = 1;
  
  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const t1 = arr[i];
      const t2 = arr[arr.length - 1 - i];
      if (t1 && t2) {
        matches.push({
          id: generateId(),
          matchNumber: matchNum++,
          round,
          team1: t1,
          team2: t2,
          score1: 0,
          score2: 0,
          status: "scheduled",
          bestOf,
        });
      }
    }
    const last = arr.pop()!;
    arr.splice(1, 0, last);
  }
  
  return matches;
}

function generateSwiss(teams: any[], bestOf: any): any[] {
  // Simple: pair randomly for round 1, then by wins
  const matches: any[] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  let matchNum = 1;
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({
        id: generateId(),
        matchNumber: matchNum++,
        round: 1,
        team1: shuffled[i],
        team2: shuffled[i + 1],
        score1: 0,
        score2: 0,
        status: "scheduled",
        bestOf,
      });
    }
  }
  
  return matches;
}

// ═══════════════════════════════════════════════════════════════
// MATCH UPDATES
// ═══════════════════════════════════════════════════════════════
export function updateMatchWinner(tournamentId: string, matchId: string, winnerTeamId: string): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;
  
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match || !match.team1 || !match.team2) return null;
  
  const winner = match.team1.id === winnerTeamId ? match.team1 : match.team2;
  const winsNeeded = Math.ceil(match.bestOf / 2);
  
  match.winner = winner;
  match.score1 = winner.id === match.team1.id ? winsNeeded : 0;
  match.score2 = winner.id === match.team2.id ? winsNeeded : 0;
  match.status = "completed";
  
  // Update team stats
  const winnerTeam = tournament.teams.find(t => t.id === winner.id);
  const loser = match.team1.id === winner.id ? match.team2 : match.team1;
  const loserTeam = tournament.teams.find(t => t.id === loser.id);
  
  if (winnerTeam) {
    winnerTeam.wins++;
    winnerTeam.points += 3;
  }
  if (loserTeam) {
    loserTeam.losses++;
  }
  
  // Advance to next match
  if (match.nextMatchId) {
    const nextMatch = tournament.matches.find(m => m.id === match.nextMatchId);
    if (nextMatch) {
      if (!nextMatch.team1) nextMatch.team1 = winner;
      else if (!nextMatch.team2) nextMatch.team2 = winner;
    }
  }
  
  saveTournament(tournament);
  return tournament;
}

export function updateMatchScore(tournamentId: string, matchId: string, score1: number, score2: number): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;
  
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match || !match.team1 || !match.team2) return null;
  
  match.score1 = score1;
  match.score2 = score2;
  
  const winsNeeded = Math.ceil(match.bestOf / 2);
  if (score1 >= winsNeeded && score1 > score2) {
    return updateMatchWinner(tournamentId, matchId, match.team1.id);
  } else if (score2 >= winsNeeded && score2 > score1) {
    return updateMatchWinner(tournamentId, matchId, match.team2.id);
  }
  
  saveTournament(tournament);
  return tournament;
}