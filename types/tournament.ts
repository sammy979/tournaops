// TournaOps — PUBG Mobile Tournament Types

export type GameType = "pubg_mobile";
export type TournamentStatus = "draft" | "live" | "completed" | "cancelled";
export type MatchStatus = "pending" | "live" | "completed";
export type PlayerRole = "IGL" | "Fragger" | "Support" | "Entry" | "Sniper" | "Assaulter" | "Scout";

export interface Player {
  id: string;
  name: string;
  ign?: string;
  role?: PlayerRole;
  photo?: string;
  uid?: string;
}

export interface Team {
  id: string;
  name: string;
  logo?: string;
  tag?: string;
  players: Player[];
  seed?: number;
  contact?: string;
}

export interface PlayerMatchResult {
  playerId: string;
  playerName: string;
  kills: number;
  damage: number;
  survived: boolean;
  assists: number;
  revives?: number;
  headshotKills?: number;
}

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  placement: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  kills: number;
  damage: number;
  wwcd: boolean;
  playerResults: PlayerMatchResult[];
}

export interface Match {
  id: string;
  name: string;
  roundId: string;
  lobbyId: string;
  map: string;
  status: MatchStatus;
  results?: TeamMatchResult[];
  startTime?: string;
  endTime?: string;
  matchNumber?: number;
}

export interface Lobby {
  id: string;
  name: string;
  teamIds: string[];
  matchIds: string[];
}

export interface Round {
  id: string;
  name: string;
  type: "qualifier" | "semifinal" | "final" | "grand_final" | "scrim";
  lobbies: Lobby[];
  matchesPerLobby: number;
  advanceTop?: number;
  order: number;
}

export interface ScoringRule {
  name: string;
  placementPoints: number[];
  killPoints: number;
  wwcdBonus?: number;
  maxKillPoints?: number;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  totalPoints: number;
  placementPoints: number;
  killPoints: number;
  totalKills: number;
  totalDamage: number;
  matchesPlayed: number;
  wwcds: number;
  matchResults: Record<string, {
    placement: number;
    kills: number;
    placementPoints: number;
    killPoints: number;
    totalPoints: number;
    damage: number;
  }>;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description?: string;
  game: GameType;
  status: TournamentStatus;
  format: string;
  prizePool?: string;
  maxTeams: number;
  teams: Team[];
  rounds: Round[];
  matches: Match[];
  scoringRule: ScoringRule;
  mapRotation: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  overlayToken?: string;
  isPublic?: boolean;
  discord?: string;
  rules?: string;
  bannerImage?: string;
}

// ─── SCORING PRESETS ────────────────────────────────────────────────────────

export const SCORING_PRESETS: Record<string, ScoringRule> = {
  pmgc: {
    name: "PMGC Standard",
    placementPoints: [15, 12, 10, 8, 6, 4, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
  },
  pmpl: {
    name: "PMPL South Asia",
    placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    wwcdBonus: 5,
  },
  community: {
    name: "Community Standard",
    placementPoints: [12, 9, 7, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
  },
  kill_heavy: {
    name: "Kill Heavy",
    placementPoints: [10, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 2,
  },
  battlegrounds: {
    name: "Battlegrounds Mobile",
    placementPoints: [10, 7, 5, 4, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    killPoints: 1,
    maxKillPoints: 6,
  },
};

// ─── MAP CONFIG ─────────────────────────────────────────────────────────────

export const PUBG_MAPS = [
  { id: "erangel", name: "Erangel", size: "8x8", type: "Classic" },
  { id: "miramar", name: "Miramar", size: "8x8", type: "Classic" },
  { id: "sanhok", name: "Sanhok", size: "4x4", type: "Classic" },
  { id: "vikendi", name: "Vikendi", size: "6x6", type: "Classic" },
  { id: "livik", name: "Livik", size: "2x2", type: "Small" },
  { id: "karakin", name: "Karakin", size: "2x2", type: "Small" },
  { id: "nusa", name: "Nusa", size: "1x1", type: "Small" },
];

// ─── TOURNAMENT PRESETS ──────────────────────────────────────────────────────

export const TOURNAMENT_PRESETS = {
  scrim_16: {
    label: "Scrim (16 squads)",
    maxTeams: 16,
    lobbiesPerRound: 1,
    matchesPerLobby: 3,
    rounds: 1,
  },
  small_32: {
    label: "Small (32 squads)",
    maxTeams: 32,
    lobbiesPerRound: 2,
    matchesPerLobby: 4,
    rounds: 2,
  },
  medium_64: {
    label: "Medium (64 squads)",
    maxTeams: 64,
    lobbiesPerRound: 4,
    matchesPerLobby: 4,
    rounds: 2,
  },
  large_128: {
    label: "Large (128 squads)",
    maxTeams: 128,
    lobbiesPerRound: 8,
    matchesPerLobby: 4,
    rounds: 3,
  },
  mega_256: {
    label: "Mega (256 squads)",
    maxTeams: 256,
    lobbiesPerRound: 16,
    matchesPerLobby: 4,
    rounds: 4,
  },
  massive_400: {
    label: "Massive (400 squads)",
    maxTeams: 400,
    lobbiesPerRound: 25,
    matchesPerLobby: 4,
    rounds: 5,
  },
};

export const PLAYER_ROLES: PlayerRole[] = [
  "IGL", "Fragger", "Support", "Entry", "Sniper", "Assaulter", "Scout"
];

// ─── BRACKET TYPES (1v1 elimination bracket) ────────────────────────────────

export interface BracketTeam {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
  tag?: string;
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  bestOf: number;
  team1?: BracketTeam | null;
  team2?: BracketTeam | null;
  score1: number;
  score2: number;
  winner?: BracketTeam | null;
  isComplete: boolean;
  nextMatchId?: string | null;
}

export type TournamentFormat = "single_elimination" | "double_elimination" | "round_robin" | "swiss";
export type BestOf = 1 | 3 | 5;
export type SeedingType = "random" | "seeded" | "manual";

// ─── STANDINGS ───────────────────────────────────────────────────────────────

export interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  points: number;
  previousRank?: number;
}

