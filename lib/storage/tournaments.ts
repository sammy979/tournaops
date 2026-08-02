"use client";
import type { Tournament, Team, Match, Round, Lobby, TeamMatchResult, PlayerMatchStats, ScoringRule, Player, MatchSummary, TournamentPreset, RoundConfig } from "@/types/tournament";
import { SCORING_SYSTEMS, TOURNAMENT_PRESETS, MAP_ROTATIONS, TEAM_SIZE, LOBBY_SIZE, PLAYER_ROLES } from "@/types/tournament";
import { getCurrentUser } from "@/lib/auth/auth";

const KEY = "tournaops_tournaments";
function gid(): string { return Date.now().toString(36) + Math.random().toString(36).substr(2, 9); }
function mkSlug(n: string): string { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 50) + "-" + Math.random().toString(36).substr(2, 5); }

export function getAllTournaments(): Tournament[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
export function getMyTournaments(): Tournament[] { const u = getCurrentUser(); return u ? getAllTournaments().filter(t => t.createdBy === u.id) : []; }
export function getTournamentById(id: string): Tournament | null { return getAllTournaments().find(t => t.id === id) || null; }
export function getTournamentBySlug(s: string): Tournament | null { return getAllTournaments().find(t => t.slug === s) || null; }
export function saveTournament(t: Tournament): void { if (typeof window === "undefined") return; const all = getAllTournaments(); const i = all.findIndex(x => x.id === t.id); if (i >= 0) all[i] = { ...t, updatedAt: new Date().toISOString() }; else all.push(t); localStorage.setItem(KEY, JSON.stringify(all)); }
export function deleteTournament(id: string): void { localStorage.setItem(KEY, JSON.stringify(getAllTournaments().filter(t => t.id !== id))); }

// ═══════════════════════════════════════════════════════════════
// CREATE PUBG MOBILE TOURNAMENT
// ═══════════════════════════════════════════════════════════════
export function createTournament(data: {
  name: string;
  description: string;
  presetId: string;
  scoringId: string;
  teamNames?: string[];
  prizePool?: string;
  region?: string;
}): Tournament {
  const user = getCurrentUser();
  if (!user) throw new Error("Not logged in");

  const preset = TOURNAMENT_PRESETS.find(p => p.id === data.presetId);
  if (!preset) throw new Error("Invalid preset");

  const scoring = SCORING_SYSTEMS.find(s => s.id === data.scoringId) || SCORING_SYSTEMS[0];

  // Create squads
  const teams: Team[] = Array.from({ length: preset.totalSlots }, (_, i) => ({
    id: gid(),
    name: data.teamNames?.[i]?.trim() || `Squad ${i + 1}`,
    tag: (data.teamNames?.[i]?.trim() || `S${i + 1}`).substring(0, 4).toUpperCase(),
    seed: i + 1,
    players: Array.from({ length: TEAM_SIZE }, (_, j) => ({
      id: gid(),
      name: `Player ${j + 1}`,
      ign: `${(data.teamNames?.[i]?.trim() || `S${i+1}`).replace(/\s/g, "").substring(0, 8)}_P${j + 1}`,
      role: PLAYER_ROLES[j] || "Entry",
    })),
    wins: 0, wwcd: 0, points: 0,
    totalKills: 0, totalDeaths: 0, totalDamage: 0,
    matchesPlayed: 0, placementPoints: 0, killPoints: 0,
    bonusPoints: 0, penaltyPoints: 0, placements: [], avgPlacement: 0,
    matchResults: [],
  }));

  // Build rounds with lobbies
  const rounds: Round[] = [];
  let availableIds = teams.map(t => t.id);
  let globalMatch = 1;
  const matches: Match[] = [];

  preset.rounds.forEach((rc, rIdx) => {
    const lobbyCount = Math.ceil(availableIds.length / LOBBY_SIZE);
    const shuffled = [...availableIds].sort(() => Math.random() - 0.5);
    const lobbies: Lobby[] = [];

    for (let l = 0; l < lobbyCount; l++) {
      const lobbyTeamIds = shuffled.slice(l * LOBBY_SIZE, (l + 1) * LOBBY_SIZE);
      const lobbyId = gid();
      const lobbyName = `Lobby ${String.fromCharCode(65 + l)}`;
      const matchIds: string[] = [];

      // Assign lobby to teams
      lobbyTeamIds.forEach(tid => {
        const team = teams.find(t => t.id === tid);
        if (team) team.lobby = lobbyName;
      });

      // Create matches for this lobby (only for round 1)
      if (rIdx === 0) {
        const mapRotation = MAP_ROTATIONS[rc.matchCount] || MAP_ROTATIONS[3];
        for (let m = 0; m < rc.matchCount; m++) {
          const matchId = gid();
          matchIds.push(matchId);
          matches.push({
            id: matchId,
            matchNumber: m + 1,
            globalMatchNumber: globalMatch++,
            roundNumber: rIdx + 1,
            roundName: rc.name,
            lobbyId,
            lobbyName,
            map: mapRotation[m % mapRotation.length],
            status: "scheduled",
            teamsInMatch: lobbyTeamIds,
          });
        }
      }

      lobbies.push({ id: lobbyId, name: lobbyName, teamIds: lobbyTeamIds, matchIds });
    }

    rounds.push({
      id: gid(),
      number: rIdx + 1,
      name: rc.name,
      status: rIdx === 0 ? "live" : "upcoming",
      lobbies,
      matchesPerLobby: rc.matchCount,
      advanceTop: rc.advanceTop,
      totalTeams: availableIds.length,
    });

    if (rc.advanceTop > 0) {
      availableIds = availableIds.slice(0, lobbyCount * rc.advanceTop);
    }
  });

  const tournament: Tournament = {
    id: gid(),
    slug: mkSlug(data.name),
    name: data.name,
    description: data.description || "PUBG Mobile Tournament",
    status: "live",
    totalSlots: preset.totalSlots,
    totalPlayers: preset.totalSlots * TEAM_SIZE,
    rounds,
    currentRound: 1,
    teams,
    matches,
    scoringRule: scoring,
    mapRotation: MAP_ROTATIONS[preset.rounds[0].matchCount] || MAP_ROTATIONS[3],
    presetId: data.presetId,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bannerColor: "from-yellow-500 to-orange-500",
    prizePool: data.prizePool,
    region: data.region || "South Asia",
  };

  saveTournament(tournament);
  return tournament;
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT MATCH RESULTS
// ═══════════════════════════════════════════════════════════════
export function submitMatchResults(tournamentId: string, matchId: string, results: TeamMatchResult[]): Tournament | null {
  const tournament = getTournamentById(tournamentId);
  if (!tournament) return null;
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return null;

  results.sort((a, b) => a.placement - b.placement);
  match.results = results;
  match.status = "completed";
  match.completedAt = new Date().toISOString();

  let topK = { id: "", v: 0 };
  let topD = { id: "", v: 0 };
  results.forEach(r => r.players.forEach(p => {
    if (p.kills > topK.v) topK = { id: p.playerId, v: p.kills };
    if (p.damage > topD.v) topD = { id: p.playerId, v: p.damage };
  }));
  match.topKillerId = topK.id;
  match.topDamageId = topD.id;
  match.mvpPlayerId = topK.id;

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
    team.avgPlacement = +(team.placements.reduce((a, b) => a + b, 0) / team.placements.length).toFixed(1);
    if (r.placement === 1) { team.wins++; team.wwcd++; }
    team.matchResults.push({
      matchNumber: match.globalMatchNumber,
      map: match.map,
      placement: r.placement,
      kills: r.kills,
      points: r.totalPoints,
    });
  });

  saveTournament(tournament);
  return tournament;
}

// ═══════════════════════════════════════════════════════════════
// DEMO RESULTS GENERATOR
// ═══════════════════════════════════════════════════════════════
export function generateDemoResults(tournament: Tournament, matchId: string): TeamMatchResult[] {
  const match = tournament.matches.find(m => m.id === matchId);
  if (!match) return [];
  const teamIds = match.teamsInMatch || [];
  const teams = tournament.teams.filter(t => teamIds.includes(t.id));
  if (teams.length === 0) return [];

  const shuffled = [...teams].sort(() => Math.random() - 0.5);

  return shuffled.map((team, idx) => {
    const placement = idx + 1;
    const kills = Math.floor(Math.random() * 12) + (placement <= 3 ? 4 : 0);
    const deaths = placement > 10 ? TEAM_SIZE : Math.floor(Math.random() * TEAM_SIZE);
    const damage = kills * 200 + Math.floor(Math.random() * 1000);
    const ppPts = tournament.scoringRule.placements[placement] || 0;
    const kPts = kills * tournament.scoringRule.killPoints;
    const bPts = placement === 1 ? tournament.scoringRule.winnerBonus : 0;

    let rk = kills;
    const players: PlayerMatchStats[] = team.players.map((p, pi) => {
      const last = pi === team.players.length - 1;
      const pk = last ? Math.max(0, rk) : Math.min(rk, Math.floor(Math.random() * (kills / 2 + 3)));
      rk = Math.max(0, rk - pk);
      return {
        playerId: p.id, name: p.name, ign: p.ign,
        kills: pk,
        deaths: placement > 8 || Math.random() > 0.6 ? 1 : 0,
        assists: Math.floor(Math.random() * 4),
        damage: pk * 250 + Math.floor(Math.random() * 600),
        headshots: Math.floor(Math.random() * Math.max(1, pk)),
        knockdowns: Math.floor(Math.random() * (pk + 3)),
        revives: Math.floor(Math.random() * 2),
        survived: placement <= 5 && Math.random() > 0.4,
        survivalTime: placement <= 5 ? 1800 + Math.floor(Math.random() * 300) : 600 + Math.floor(Math.random() * 1000),
      };
    });

    return {
      teamId: team.id, teamName: team.name, teamTag: team.tag,
      placement, kills, deaths, assists: players.reduce((a, p) => a + p.assists, 0), damage,
      placementPoints: ppPts, killPoints: kPts, bonusPoints: bPts, penaltyPoints: 0,
      totalPoints: ppPts + kPts + bPts,
      players,
    };
  });
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD
// ═══════════════════════════════════════════════════════════════
export function getLeaderboard(tournament: Tournament, lobbyFilter?: string): any[] {
  let teams = tournament.teams.filter(t => t.matchesPlayed > 0);
  if (lobbyFilter && lobbyFilter !== "all") {
    teams = teams.filter(t => t.lobby === lobbyFilter);
  }
  return teams
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wwcd !== a.wwcd) return b.wwcd - a.wwcd;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return (a.avgPlacement || 99) - (b.avgPlacement || 99);
    })
    .map((team, i) => ({
      rank: i + 1,
      team,
      matchesPlayed: team.matchesPlayed,
      wwcd: team.wwcd,
      totalKills: team.totalKills,
      totalDamage: team.totalDamage,
      placementPoints: team.placementPoints,
      killPoints: team.killPoints,
      totalPoints: team.points,
      avgPlacement: team.avgPlacement,
      kd: team.totalDeaths > 0 ? +(team.totalKills / team.totalDeaths).toFixed(2) : team.totalKills,
      matchResults: team.matchResults,
    }));
}

// ═══════════════════════════════════════════════════════════════
// TOP PLAYERS
// ═══════════════════════════════════════════════════════════════
export function getTopPlayers(tournament: Tournament): { topKillers: any[]; topDamage: any[]; topKD: any[] } {
  const stats: Record<string, any> = {};
  tournament.matches.forEach(match => {
    if (!match.results) return;
    match.results.forEach(r => r.players.forEach(p => {
      if (!stats[p.playerId]) stats[p.playerId] = { id: p.playerId, name: p.name, ign: p.ign, teamId: r.teamId, teamName: r.teamName, kills: 0, deaths: 0, assists: 0, damage: 0, headshots: 0, knockdowns: 0, matches: 0 };
      const s = stats[p.playerId];
      s.kills += p.kills; s.deaths += p.deaths; s.assists += p.assists;
      s.damage += p.damage; s.headshots += p.headshots; s.knockdowns += p.knockdowns; s.matches++;
    }));
  });
  const all = Object.values(stats);
  return {
    topKillers: [...all].sort((a: any, b: any) => b.kills - a.kills).slice(0, 10),
    topDamage: [...all].sort((a: any, b: any) => b.damage - a.damage).slice(0, 10),
    topKD: [...all].map((p: any) => ({ ...p, kd: p.deaths > 0 ? +(p.kills / p.deaths).toFixed(2) : p.kills })).sort((a: any, b: any) => b.kd - a.kd).slice(0, 10),
  };
}

// Stub for non-BR formats
export function updateMatchWinner(): Tournament | null { return null; }