"use client";
import type { Tournament, Team, Match, TeamMatchResult, PlayerMatchStats, ScoringRule, Player } from "@/types/tournament";
import { getCurrentUser } from "@/lib/auth/auth";

const TOURNAMENTS_KEY = "tournaops_tournaments";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 50) + "-" + Math.random().toString(36).substr(2, 5);
}

// Default PUBG/BR scoring
const DEFAULT_SCORING: ScoringRule = {
  placements: {
    1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
    11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0
  },
  killPoints: 1,
  assistPoints: 0,
  winnerBonus: 5,
};

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TOURNAMENTS_KEY) || "[]"); } catch { return []; }
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
  if (idx >= 0) all[idx] = { ...tournament, updatedAt: new Date().toISOString() };
  else all.push(tournament);
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(all));
}

export function deleteTournament(id: string): void {
  const all = getAllTournaments().filter(t => t.id !== id);
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(all));
}

export function createTournament(data: {
  name: string; description: string; game: string; format: any;
  bestOf: any; maxTeams: number; teams: any[]; playersPerTeam?: number;
  scoringRule?: ScoringRule;
}): Tournament {
  const user = getCurrentUser();
  if (!user) throw new Error("Not logged in");

  const playersPerTeam = data.playersPerTeam || 4;

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
    scoringRule: data.scoringRule || DEFAULT_SCORING,
    teams: data.teams.map((t: any, i: number) => ({
      id: generateId(),
      name: t.name || `Team ${i + 1}`,
      tag: t.tag || `T${i + 1}`,
      logo: t.logo,
      seed: i + 1,
      players: Array.from({ length: playersPerTeam }, (_, j) => ({
        id: generateId(),
        name: `Player ${j + 1}`,
        ign: `${(t.name || `Team${i + 1}`).replace(/\s/g, "")}_P${j + 1}`,
        role: j === 0 ? "IGL" : j === 1 ? "Fragger" : j === 2 ? "Support" : "Lurker",
      })),
      wins: 0, losses: 0, points: 0,
      totalKills: 0, totalDeaths: 0, totalDamage: 0,
      matchesPlayed: 0,
      placementPoints: 0, killPoints: 0, bonusPoints: 0, penaltyPoints: 0,
      placements: [], avgPlacement: 0,
    })),
    matches: [],
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerColor: ["from-indigo-500 to-purple-500", "from-purple-500 to-pink-500", "from-cyan-500 to-blue-500"][Math.floor(Math.random() * 3)],
  };

  // Generate matches
  if (data.format === "battle_royale") {
    const matchCount = data.bestOf || 4;
    for (let i = 1; i <= matchCount; i++) {
      tournament.matches.push({
        id: generateId(),
        matchNumber: i,
        round: i,
        status: "scheduled",
        bestOf: 1,
        score1: 0, score2: 0,
        results: [],
      });
    }
  } else if (data.format === "single_elim") {
    tournament.matches = generateSingleElim(tournament.teams, data.bestOf);
  } else if (data.format === "round_robin") {
    tournament.matches = generateRoundRobin(tournament.teams, data.bestOf);
  } else {
    tournament.matches = generateSingleElim(tournament.teams, data.bestOf);
  }

  saveTournament(tournament);
  return tournament;
}

// BR Match result submission
export function submitMatchResults(
  tournamentId: string,
  matchId: string,
  results: TeamMatchResult[]
): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;

  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return null;

  match.results = results;
  match.status = "completed";

  // Find MVP, top killer, top damage
  let topKiller = { id: "", kills: 0 };
  let topDamage = { id: "", damage: 0 };

  results.forEach(r => {
    r.players.forEach(p => {
      if (p.kills > topKiller.kills) topKiller = { id: p.playerId, kills: p.kills };
      if (p.damage > topDamage.damage) topDamage = { id: p.playerId, damage: p.damage };
    });
  });

  match.topKillerId = topKiller.id;
  match.topDamageId = topDamage.id;
  match.mvpPlayerId = topKiller.id;

  // Update team cumulative stats
  results.forEach(r => {
    const team = tournament.teams.find(t => t.id === r.teamId);
    if (!team) return;

    team.matchesPlayed++;
    team.totalKills += r.kills;
    team.totalDeaths += r.deaths;
    team.totalDamage += r.damage;
    team.placementPoints += r.placementPoints;
    team.killPoints += r.killPoints;
    team.bonusPoints += r.bonusPoints;
    team.penaltyPoints += r.penaltyPoints;
    team.points += r.totalPoints;
    team.placements.push(r.placement);
    team.avgPlacement = team.placements.reduce((a, b) => a + b, 0) / team.placements.length;

    if (r.placement === 1) team.wins++;
  });

  saveTournament(tournament);
  return tournament;
}

// Calculate leaderboard
export function getLeaderboard(tournament: Tournament): any[] {
  return [...tournament.teams]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return a.avgPlacement - b.avgPlacement;
    })
    .map((team, i) => ({
      rank: i + 1,
      previousRank: i + 1,
      team,
      matchesPlayed: team.matchesPlayed,
      wins: team.wins,
      totalKills: team.totalKills,
      totalDeaths: team.totalDeaths,
      totalDamage: team.totalDamage,
      placementPoints: team.placementPoints,
      killPoints: team.killPoints,
      bonusPoints: team.bonusPoints,
      penaltyPoints: team.penaltyPoints,
      totalPoints: team.points,
      avgPlacement: team.avgPlacement || 0,
      kd: team.totalDeaths > 0 ? +(team.totalKills / team.totalDeaths).toFixed(2) : team.totalKills,
      rankChange: "same" as const,
    }));
}

// Get top players across tournament
export function getTopPlayers(tournament: Tournament): {
  topKillers: any[];
  topDamage: any[];
  topKD: any[];
} {
  const playerStats: Record<string, any> = {};

  tournament.matches.forEach(match => {
    if (!match.results) return;
    match.results.forEach(result => {
      result.players.forEach(p => {
        if (!playerStats[p.playerId]) {
          playerStats[p.playerId] = {
            id: p.playerId,
            name: p.name,
            ign: p.ign,
            teamId: result.teamId,
            teamName: result.teamName,
            kills: 0, deaths: 0, assists: 0, damage: 0,
            headshots: 0, knockdowns: 0, matches: 0,
          };
        }
        const s = playerStats[p.playerId];
        s.kills += p.kills;
        s.deaths += p.deaths;
        s.assists += p.assists;
        s.damage += p.damage;
        s.headshots += p.headshots;
        s.knockdowns += p.knockdowns;
        s.matches++;
      });
    });
  });

  const all = Object.values(playerStats);

  return {
    topKillers: [...all].sort((a: any, b: any) => b.kills - a.kills).slice(0, 10),
    topDamage: [...all].sort((a: any, b: any) => b.damage - a.damage).slice(0, 10),
    topKD: [...all]
      .map((p: any) => ({ ...p, kd: p.deaths > 0 ? +(p.kills / p.deaths).toFixed(2) : p.kills }))
      .sort((a: any, b: any) => b.kd - a.kd)
      .slice(0, 10),
  };
}

// Auto-generate match results (for demo/testing)
export function generateRandomResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return [];

  const placements = [...tournament.teams].sort(() => Math.random() - 0.5);

  return placements.map((team, idx) => {
    const placement = idx + 1;
    const kills = Math.floor(Math.random() * 12);
    const deaths = Math.floor(Math.random() * 4) + (placement > 5 ? 4 : 0);
    const damage = kills * 150 + Math.floor(Math.random() * 600);
    const assists = Math.floor(Math.random() * 5);

    const placementPts = tournament.scoringRule.placements[placement] || 0;
    const killPts = kills * tournament.scoringRule.killPoints;
    const bonusPts = placement === 1 ? tournament.scoringRule.winnerBonus : 0;

    return {
      teamId: team.id,
      teamName: team.name,
      placement,
      kills,
      deaths,
      assists,
      damage,
      placementPoints: placementPts,
      killPoints: killPts,
      bonusPoints: bonusPts,
      penaltyPoints: 0,
      totalPoints: placementPts + killPts + bonusPts,
      players: team.players.map(p => ({
        playerId: p.id,
        name: p.name,
        ign: p.ign,
        kills: Math.floor(Math.random() * (kills / 2 + 2)),
        deaths: Math.floor(Math.random() * 2),
        assists: Math.floor(Math.random() * 3),
        damage: Math.floor(Math.random() * (damage / 2 + 200)),
        headshots: Math.floor(Math.random() * 3),
        knockdowns: Math.floor(Math.random() * 4),
        survived: placement <= 3 && Math.random() > 0.3,
      })),
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// BRACKET HELPERS
// ═══════════════════════════════════════════════════════════════
function generateSingleElim(teams: any[], bestOf: any): any[] {
  const matches: any[] = [];
  const rounds = Math.ceil(Math.log2(teams.length));
  const totalSlots = Math.pow(2, rounds);
  const paddedTeams: any[] = [...teams];
  while (paddedTeams.length < totalSlots) paddedTeams.push(null);
  let matchNum = 1;
  const roundMatches: any[][] = [];

  const r1: any[] = [];
  for (let i = 0; i < totalSlots / 2; i++) {
    const m: any = {
      id: generateId(), matchNumber: matchNum++, round: 1,
      team1: paddedTeams[i * 2] || undefined,
      team2: paddedTeams[i * 2 + 1] || undefined,
      score1: 0, score2: 0, status: "scheduled", bestOf, bracket: "winners",
    };
    if (m.team1 && !m.team2) { m.winner = m.team1; m.status = "completed"; }
    else if (!m.team1 && m.team2) { m.winner = m.team2; m.status = "completed"; }
    r1.push(m); matches.push(m);
  }
  roundMatches.push(r1);

  for (let round = 2; round <= rounds; round++) {
    const rMs: any[] = [];
    const prev = roundMatches[round - 2];
    for (let i = 0; i < prev.length / 2; i++) {
      const m: any = { id: generateId(), matchNumber: matchNum++, round, score1: 0, score2: 0, status: "scheduled", bestOf, bracket: "winners" };
      prev[i * 2].nextMatchId = m.id;
      prev[i * 2 + 1].nextMatchId = m.id;
      rMs.push(m); matches.push(m);
    }
    roundMatches.push(rMs);
  }

  matches.forEach(m => {
    if (m.status === "completed" && m.winner && m.nextMatchId) {
      const next = matches.find(x => x.id === m.nextMatchId);
      if (next) { if (!next.team1) next.team1 = m.winner; else next.team2 = m.winner; }
    }
  });

  return matches;
}

function generateRoundRobin(teams: any[], bestOf: any): any[] {
  const matches: any[] = [];
  const n = teams.length;
  const players = n % 2 !== 0 ? [...teams, null] : [...teams];
  const totalRounds = players.length - 1;
  const arr = [...players];
  let matchNum = 1;

  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < players.length / 2; i++) {
      const t1 = arr[i]; const t2 = arr[arr.length - 1 - i];
      if (t1 && t2) {
        matches.push({ id: generateId(), matchNumber: matchNum++, round, team1: t1, team2: t2, score1: 0, score2: 0, status: "scheduled", bestOf });
      }
    }
    const last = arr.pop()!; arr.splice(1, 0, last);
  }
  return matches;
}

export function updateMatchWinner(tournamentId: string, matchId: string, winnerTeamId: string): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match || !match.team1 || !match.team2) return null;

  const winner = match.team1.id === winnerTeamId ? match.team1 : match.team2;
  const loser = match.team1.id === winnerTeamId ? match.team2 : match.team1;
  const winsNeeded = Math.ceil(match.bestOf / 2);

  match.winner = winner;
  match.score1 = winner.id === match.team1.id ? winsNeeded : 0;
  match.score2 = winner.id === match.team2.id ? winsNeeded : 0;
  match.status = "completed";

  const wTeam = tournament.teams.find(t => t.id === winner.id);
  const lTeam = tournament.teams.find(t => t.id === loser.id);
  if (wTeam) { wTeam.wins++; wTeam.points += 3; wTeam.matchesPlayed++; }
  if (lTeam) { lTeam.losses++; lTeam.matchesPlayed++; }

  if (match.nextMatchId) {
    const next = tournament.matches.find(m => m.id === match.nextMatchId);
    if (next) { if (!next.team1) next.team1 = winner; else if (!next.team2) next.team2 = winner; }
  }

  saveTournament(tournament);
  return tournament;
}