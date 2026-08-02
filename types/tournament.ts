// ═══════════════════════════════════════════════════════════════
// REAL ESPORTS TOURNAMENT SYSTEM
// 128 slots, 4 players per slot, lobbies, rounds, stages
// ═══════════════════════════════════════════════════════════════

export type TournamentFormat = "battle_royale" | "single_elim" | "double_elim" | "round_robin" | "swiss" | "group_stage";
export type TournamentStatus = "draft" | "registration" | "live" | "completed";
export type MatchStatus = "scheduled" | "live" | "completed";
export type SeedingMethod = "random" | "manual" | "ranked";

// Game configs with real team sizes
export const GAME_CONFIGS: Record<string, { teamSize: number; lobbySize: number; genre: string }> = {
  "PUBG Mobile": { teamSize: 4, lobbySize: 16, genre: "br" },
  "PUBG PC": { teamSize: 4, lobbySize: 16, genre: "br" },
  "Free Fire": { teamSize: 4, lobbySize: 12, genre: "br" },
  "Apex Legends": { teamSize: 3, lobbySize: 20, genre: "br" },
  "Fortnite": { teamSize: 4, lobbySize: 25, genre: "br" },
  "COD Warzone": { teamSize: 4, lobbySize: 20, genre: "br" },
  "Valorant": { teamSize: 5, lobbySize: 2, genre: "fps" },
  "CS2": { teamSize: 5, lobbySize: 2, genre: "fps" },
  "League of Legends": { teamSize: 5, lobbySize: 2, genre: "moba" },
  "Dota 2": { teamSize: 5, lobbySize: 2, genre: "moba" },
  "MLBB": { teamSize: 5, lobbySize: 2, genre: "moba" },
  "Overwatch 2": { teamSize: 5, lobbySize: 2, genre: "fps" },
  "Rocket League": { teamSize: 3, lobbySize: 2, genre: "sports" },
  "Rainbow Six": { teamSize: 5, lobbySize: 2, genre: "fps" },
  "Custom": { teamSize: 4, lobbySize: 16, genre: "br" },
};

// Valid slot counts for tournaments
export const SLOT_COUNTS = [8, 12, 16, 20, 24, 32, 48, 64, 96, 128, 256, 400];

// Real scoring presets
export const SCORING_PRESETS: Record<string, ScoringRule> = {
  pmgc: {
    name: "PUBG Standard (PMGC/PEL)",
    placements: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
    killPoints: 1, assistPoints: 0, winnerBonus: 0,
  },
  freefire: {
    name: "Free Fire (FFWS)",
    placements: { 1: 12, 2: 9, 3: 8, 4: 7, 5: 6, 6: 5, 7: 4, 8: 3, 9: 2, 10: 1, 11: 0, 12: 0 },
    killPoints: 1, assistPoints: 0, winnerBonus: 0,
  },
  algs: {
    name: "Apex Legends (ALGS)",
    placements: { 1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 3, 8: 2, 9: 2, 10: 2, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 0, 17: 0, 18: 0, 19: 0, 20: 0 },
    killPoints: 1, assistPoints: 0, winnerBonus: 0,
  },
  fncs: {
    name: "Fortnite (FNCS)",
    placements: { 1: 25, 2: 20, 3: 16, 4: 14, 5: 11, 6: 9, 7: 7, 8: 5, 9: 4, 10: 3, 11: 2, 12: 2, 13: 2, 14: 2, 15: 1, 16: 1 },
    killPoints: 1, assistPoints: 0, winnerBonus: 0,
  },
  pubg_kill_heavy: {
    name: "Kill-Heavy BR",
    placements: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0 },
    killPoints: 2, assistPoints: 0.5, winnerBonus: 5,
  },
  standard_elim: {
    name: "Standard Win/Loss",
    placements: { 1: 3, 2: 0 },
    killPoints: 0, assistPoints: 0, winnerBonus: 0,
  },
  custom: {
    name: "Custom Scoring",
    placements: {}, killPoints: 1, assistPoints: 0, winnerBonus: 0,
  },
};

export interface ScoringRule {
  name: string;
  placements: Record<number, number>;
  killPoints: number;
  assistPoints: number;
  winnerBonus: number;
}

export interface Player {
  id: string;
  name: string;
  ign: string;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  seed: number;
  group?: string;
  lobby?: string;
  players: Player[];
  // Cumulative stats across all matches
  wins: number;
  losses: number;
  points: number;
  totalKills: number;
  totalDeaths: number;
  totalDamage: number;
  matchesPlayed: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  placements: number[];
  avgPlacement: number;
}

export interface PlayerMatchStats {
  playerId: string;
  name: string;
  ign: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshots: number;
  knockdowns: number;
  survived: boolean;
}

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  placement: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  players: PlayerMatchStats[];
}

export interface Lobby {
  id: string;
  name: string;
  code?: string;
  teams: string[]; // team IDs
  matches: string[]; // match IDs
}

export interface Round {
  id: string;
  number: number;
  name: string;
  lobbies: Lobby[];
  matchesPerLobby: number;
  advanceCount: number; // top N teams advance from each lobby
  advanceTo?: string; // next round ID
  status: "upcoming" | "live" | "completed";
}

export interface Match {
  id: string;
  matchNumber: number;
  round: number;
  roundId?: string;
  lobbyId?: string;
  lobbyName?: string;
  lobbyCode?: string;
  bracket?: string;
  team1?: Team;
  team2?: Team;
  score1: number;
  score2: number;
  winner?: Team;
  status: MatchStatus;
  bestOf: number;
  scheduledAt?: string;
  nextMatchId?: string;
  results?: TeamMatchResult[];
  mvpPlayerId?: string;
  topKillerId?: string;
  topDamageId?: string;
  teamsInMatch?: string[]; // For BR: all team IDs in this match
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  // Slot system
  totalSlots: number;
  playersPerSlot: number;
  totalPlayers: number;
  // Lobby config
  slotsPerLobby: number;
  totalLobbies: number;
  // Round config
  rounds: Round[];
  matchesPerRound: number;
  totalRounds: number;
  // Data
  teams: Team[];
  matches: Match[];
  scoringRule: ScoringRule;
  seedingMethod: SeedingMethod;
  tiebreakers: string[];
  // Meta
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  bannerColor?: string;
  prizePool?: string;
  rules?: string;
  region?: string;
}