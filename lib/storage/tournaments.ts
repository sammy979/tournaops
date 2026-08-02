"use client";
import type { Tournament, Team, Match, Round, Lobby, TeamMatchResult, ScoringRule, Player } from "@/types/tournament";
import { GAME_CONFIGS, SCORING_PRESETS } from "@/types/tournament";
import { getCurrentUser } from "@/lib/auth/auth";

const TOURNAMENTS_KEY = "tournaops_tournaments";

function gid(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
function slug(name: string): string { return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50) + "-" + Math.random().toString(36).substr(2, 5); }

export function getAllTournaments(): Tournament[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(TOURNAMENTS_KEY) || "[]"); } catch { return []; }
}

export function getMyTournaments(): Tournament[] {
  const user = getCurrentUser();
  return user ? getAllTournaments().filter(t => t.createdBy === user.id) : [];
}

export function getTournamentById(id: string): Tournament | null {
  return getAllTournaments().find(t => t.id === id) || null;
}

export function getTournamentBySlug(s: string): Tournament | null {
  return getAllTournaments().find(t => t.slug === s) || null;
}

export function saveTournament(t: Tournament): void {
  if (typeof window === "undefined") return;
  const all = getAllTournaments();
  const idx = all.findIndex(x => x.id === t.id);
  if (idx >= 0) all[idx] = { ...t, updatedAt: new Date().toISOString() };
  else all.push(t);
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(all));
}

export function deleteTournament(id: string): void {
  localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(getAllTournaments().filter(t => t.id !== id)));
}

// ═══════════════════════════════════════════════════════════════
// CREATE TOURNAMENT WITH REAL ESPORTS STRUCTURE
// ═══════════════════════════════════════════════════════════════
export function createTournament(data: {
  name: string;
  description: string;
  game: string;
  format: any;
  totalSlots: number;
  matchesPerRound: number;
  totalRounds: number;
  scoringPreset: string;
  teamNames?: string[];
}): Tournament {
  const user = getCurrentUser();
  if (!user) throw new Error("Not logged in");

  const gameConfig = GAME_CONFIGS[data.game] || GAME_CONFIGS["Custom"];
  const scoring = SCORING_PRESETS[data.scoringPreset] || SCORING_PRESETS.pmgc;
  const playersPerSlot = gameConfig.teamSize;
  const slotsPerLobby = gameConfig.lobbySize;
  const totalLobbies = Math.ceil(data.totalSlots / slotsPerLobby);

  // Generate teams (slots)
  const teams: Team[] = Array.from({ length: data.totalSlots }, (_, i) => ({
    id: gid(),
    name: data.teamNames?.[i]?.trim() || `Team ${i + 1}`,
    tag: data.teamNames?.[i]?.trim()?.substring(0, 3)?.toUpperCase() || `T${i + 1}`,
    seed: i + 1,
    lobby: `Lobby ${String.fromCharCode(65 + (i % totalLobbies))}`,
    players: Array.from({ length: playersPerSlot }, (_, j) => ({
      id: gid(),
      name: `Player ${j + 1}`,
      ign: `${data.teamNames?.[i]?.trim()?.replace(/\s/g, "") || `T${i+1}`}_P${j + 1}`,
      role: j === 0 ? "IGL" : j === 1 ? "Fragger" : j === 2 ? "Support" : "Entry",
    })),
    wins: 0, losses: 0, points: 0,
    totalKills: 0, totalDeaths: 0, totalDamage: 0,
    matchesPlayed: 0, placementPoints: 0, killPoints: 0,
    bonusPoints: 0, penaltyPoints: 0, placements: [], avgPlacement: 0,
  }));

  // Generate rounds with lobbies
  const rounds: Round[] = [];
  let remainingTeams = [...teams];
  let currentLobbies = totalLobbies;

  for (let r = 1; r <= data.totalRounds; r++) {
    const lobbyCount = Math.ceil(remainingTeams.length / slotsPerLobby);
    const lobbies: Lobby[] = [];
    
    for (let l = 0; l < lobbyCount; l++) {
      const lobbyTeams = remainingTeams.slice(l * slotsPerLobby, (l + 1) * slotsPerLobby);
      lobbies.push({
        id: gid(),
        name: `Lobby ${String.fromCharCode(65 + l)}`,
        teams: lobbyTeams.map(t => t.id),
        matches: [],
      });
    }

    const advanceCount = r < data.totalRounds 
      ? Math.ceil(remainingTeams.length / (2 * lobbyCount))
      : 0;

    rounds.push({
      id: gid(),
      number: r,
      name: r === data.totalRounds ? "Grand Finals" : r === data.totalRounds - 1 ? "Semi Finals" : `Round ${r} (Qualifiers)`,
      lobbies,
      matchesPerLobby: data.matchesPerRound,
      advanceCount,
      status: r === 1 ? "live" : "upcoming",
    });

    // For next round, take top N from each lobby
    if (r < data.totalRounds) {
      remainingTeams = remainingTeams.slice(0, lobbyCount * advanceCount);
    }
  }

  // Generate all matches for Round 1
  const matches: Match[] = [];
  let matchNum = 1;
  
  rounds[0].lobbies.forEach(lobby => {
    for (let m = 1; m <= data.matchesPerRound; m++) {
      const matchId = gid();
      lobby.matches.push(matchId);
      matches.push({
        id: matchId,
        matchNumber: matchNum++,
        round: 1,
        roundId: rounds[0].id,
        lobbyId: lobby.id,
        lobbyName: lobby.name,
        status: "scheduled",
        bestOf: 1,
        score1: 0, score2: 0,
        teamsInMatch: lobby.teams,
        results: [],
      });
    }
  });

  const tournament: Tournament = {
    id: gid(),
    slug: slug(data.name),
    name: data.name,
    description: data.description,
    game: data.game,
    format: data.format,
    status: "live",
    totalSlots: data.totalSlots,
    playersPerSlot: playersPerSlot,
    totalPlayers: data.totalSlots * playersPerSlot,
    slotsPerLobby: slotsPerLobby,
    totalLobbies: totalLobbies,
    rounds,
    matchesPerRound: data.matchesPerRound,
    totalRounds: data.totalRounds,
    teams,
    matches,
    scoringRule: scoring,
    seedingMethod: "random",
    tiebreakers: ["Total Points", "Total Kills", "Best Placement"],
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerColor: ["from-indigo-500 to-purple-500", "from-purple-500 to-pink-500", "from-cyan-500 to-blue-500"][Math.floor(Math.random() * 3)],
  };

  saveTournament(tournament);
  return tournament;
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT MATCH RESULTS (BR FORMAT)
// ═══════════════════════════════════════════════════════════════
export function submitMatchResults(tournamentId: string, matchId: string, results: TeamMatchResult[]): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;

  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return null;

  match.results = results;
  match.status = "completed";

  // Find top performers
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

// ═══════════════════════════════════════════════════════════════
// GENERATE RANDOM RESULTS (FOR DEMO)
// ═══════════════════════════════════════════════════════════════
export function generateRandomResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return [];

  // Get teams in this match (from lobby)
  const teamIds = match.teamsInMatch || [];
  const teams = tournament.teams.filter(t => teamIds.includes(t.id));
  
  // If no teams assigned, use all teams (fallback)
  const matchTeams = teams.length > 0 ? teams : tournament.teams;
  const shuffled = [...matchTeams].sort(() => Math.random() - 0.5);

  return shuffled.map((team, idx) => {
    const placement = idx + 1;
    const teamKills = Math.floor(Math.random() * 15) + (placement <= 3 ? 3 : 0);
    const teamDeaths = placement > 8 ? team.players.length : Math.floor(Math.random() * team.players.length);
    const teamDamage = teamKills * 180 + Math.floor(Math.random() * 800);

    const placementPts = tournament.scoringRule.placements[placement] || 0;
    const killPts = teamKills * tournament.scoringRule.killPoints;
    const bonusPts = placement === 1 ? tournament.scoringRule.winnerBonus : 0;

    // Distribute stats among players
    let remainingKills = teamKills;
    const players = team.players.map((p, pIdx) => {
      const isLast = pIdx === team.players.length - 1;
      const pKills = isLast ? remainingKills : Math.min(remainingKills, Math.floor(Math.random() * (teamKills / 2 + 2)));
      remainingKills -= pKills;
      
      return {
        playerId: p.id,
        name: p.name,
        ign: p.ign,
        kills: pKills,
        deaths: Math.random() > 0.5 ? 1 : 0,
        assists: Math.floor(Math.random() * 4),
        damage: Math.floor(pKills * 200 + Math.random() * 500),
        headshots: Math.floor(Math.random() * pKills),
        knockdowns: Math.floor(Math.random() * (pKills + 2)),
        survived: placement <= 5 && Math.random() > 0.3,
      };
    });

    return {
      teamId: team.id,
      teamName: team.name,
      placement,
      kills: teamKills,
      deaths: teamDeaths,
      assists: players.reduce((a, p) => a + p.assists, 0),
      damage: teamDamage,
      placementPoints: placementPts,
      killPoints: killPts,
      bonusPoints: bonusPts,
      penaltyPoints: 0,
      totalPoints: placementPts + killPts + bonusPts,
      players,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════
export function getLeaderboard(tournament: Tournament): any[] {
  return [...tournament.teams]
    .filter(t => t.matchesPlayed > 0)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return (a.avgPlacement || 99) - (b.avgPlacement || 99);
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
      rankChange: "same",
    }));
}

// ═══════════════════════════════════════════════════════════════
// TOP PLAYERS
// ═══════════════════════════════════════════════════════════════
export function getTopPlayers(tournament: Tournament): { topKillers: any[]; topDamage: any[]; topKD: any[] } {
  const stats: Record<string, any> = {};
  tournament.matches.forEach(match => {
    if (!match.results) return;
    match.results.forEach(r => {
      r.players.forEach(p => {
        if (!stats[p.playerId]) {
          stats[p.playerId] = { id: p.playerId, name: p.name, ign: p.ign, teamId: r.teamId, teamName: r.teamName, kills: 0, deaths: 0, assists: 0, damage: 0, headshots: 0, knockdowns: 0, matches: 0 };
        }
        const s = stats[p.playerId];
        s.kills += p.kills; s.deaths += p.deaths; s.assists += p.assists;
        s.damage += p.damage; s.headshots += p.headshots; s.knockdowns += p.knockdowns;
        s.matches++;
      });
    });
  });

  const all = Object.values(stats);
  return {
    topKillers: [...all].sort((a: any, b: any) => b.kills - a.kills).slice(0, 10),
    topDamage: [...all].sort((a: any, b: any) => b.damage - a.damage).slice(0, 10),
    topKD: [...all].map((p: any) => ({ ...p, kd: p.deaths > 0 ? +(p.kills / p.deaths).toFixed(2) : p.kills })).sort((a: any, b: any) => b.kd - a.kd).slice(0, 10),
  };
}

// For bracket formats
export function updateMatchWinner(tournamentId: string, matchId: string, winnerTeamId: string): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match || !match.team1 || !match.team2) return null;

  const winner = match.team1.id === winnerTeamId ? match.team1 : match.team2;
  match.winner = winner;
  match.score1 = winner.id === match.team1.id ? 1 : 0;
  match.score2 = winner.id === match.team2.id ? 1 : 0;
  match.status = "completed";

  const wTeam = tournament.teams.find(t => t.id === winner.id);
  if (wTeam) { wTeam.wins++; wTeam.points += 3; wTeam.matchesPlayed++; }

  if (match.nextMatchId) {
    const next = tournament.matches.find(m => m.id === match.nextMatchId);
    if (next) { if (!next.team1) next.team1 = winner; else if (!next.team2) next.team2 = winner; }
  }

  saveTournament(tournament);
  return tournament;
}