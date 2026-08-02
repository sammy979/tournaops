// ═══════════════════════════════════════════════════════════════
// TOURNAOPS - PUBG MOBILE TOURNAMENT SYSTEM
// Clean, focused, PUBG Mobile only
// ═══════════════════════════════════════════════════════════════

// PUBG Mobile Constants
export const GAME_NAME = "PUBG Mobile";
export const TEAM_SIZE = 4;
export const LOBBY_SIZE = 16;
export const PLAYERS_PER_LOBBY = 64;

// PUBG Mobile Maps
export const MAPS = [
  "Erangel",
  "Miramar",
  "Sanhok",
  "Vikendi",
  "Livik",
  "Karakin",
  "Nusa",
] as const;

export type PubgMap = typeof MAPS[number];

// Map rotation based on match count
export const MAP_ROTATIONS: Record<number, string[]> = {
  3: ["Erangel", "Miramar", "Sanhok"],
  4: ["Erangel", "Miramar", "Sanhok", "Erangel"],
  5: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel"],
  6: ["Erangel", "Miramar", "Sanhok", "Erangel", "Miramar", "Erangel"],
  8: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel", "Miramar", "Sanhok", "Erangel"],
  10: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel", "Miramar"],
  12: ["Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel", "Miramar", "Sanhok", "Vikendi", "Erangel", "Miramar", "Sanhok", "Erangel"],
};

// Player roles in PUBG Mobile
export const PLAYER_ROLES = ["IGL", "Fragger", "Support", "Entry", "Sniper", "Assaulter", "Scout"] as const;
export type PlayerRole = typeof PLAYER_ROLES[number];

// ═══ SCORING SYSTEMS ═══
export interface ScoringRule {
  id: string;
  name: string;
  description: string;
  placements: Record<number, number>;
  killPoints: number;
  winnerBonus: number;
}

export const SCORING_SYSTEMS: ScoringRule[] = [
  {
    id: "pmgc",
    name: "PMGC Standard",
    description: "Official PUBG Mobile Global Championship scoring",
    placements: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
    killPoints: 1,
    winnerBonus: 0,
  },
  {
    id: "pmpl",
    name: "PMPL South Asia",
    description: "PUBG Mobile Pro League South Asia format",
    placements: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
    killPoints: 1,
    winnerBonus: 5,
  },
  {
    id: "community",
    name: "Community Standard",
    description: "Popular community tournament scoring",
    placements: { 1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1, 9: 1, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
    killPoints: 1,
    winnerBonus: 0,
  },
  {
    id: "kill_heavy",
    name: "Kill Heavy",
    description: "More points for kills. Aggressive gameplay rewarded.",
    placements: { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0 },
    killPoints: 2,
    winnerBonus: 0,
  },
];

// ═══ TOURNAMENT SIZE PRESETS ═══
export interface TournamentPreset {
  id: string;
  name: string;
  description: string;
  totalSlots: number;
  rounds: RoundConfig[];
}

export interface RoundConfig {
  name: string;
  matchCount: number;
  advanceTop: number;
}

export const TOURNAMENT_PRESETS: TournamentPreset[] = [
  {
    id: "scrim_16",
    name: "Scrim (16 Squads)",
    description: "1 lobby, 3 matches. Quick practice scrim.",
    totalSlots: 16,
    rounds: [
      { name: "Scrim", matchCount: 3, advanceTop: 0 },
    ],
  },
  {
    id: "small_32",
    name: "Small Tournament (32 Squads)",
    description: "2 lobbies → Grand Finals. Perfect for local events.",
    totalSlots: 32,
    rounds: [
      { name: "Qualifiers", matchCount: 3, advanceTop: 8 },
      { name: "Grand Finals", matchCount: 6, advanceTop: 0 },
    ],
  },
  {
    id: "medium_64",
    name: "Medium Tournament (64 Squads)",
    description: "4 lobbies → Grand Finals. Great for community tournaments.",
    totalSlots: 64,
    rounds: [
      { name: "Qualifiers", matchCount: 3, advanceTop: 4 },
      { name: "Grand Finals", matchCount: 6, advanceTop: 0 },
    ],
  },
  {
    id: "large_128",
    name: "Large Tournament (128 Squads)",
    description: "8 lobbies → Semi Finals → Grand Finals. PMGC-style format.",
    totalSlots: 128,
    rounds: [
      { name: "Group Stage", matchCount: 3, advanceTop: 4 },
      { name: "Semi Finals", matchCount: 4, advanceTop: 8 },
      { name: "Grand Finals", matchCount: 6, advanceTop: 0 },
    ],
  },
  {
    id: "mega_256",
    name: "Mega Tournament (256 Squads)",
    description: "16 lobbies → multiple elimination rounds. Massive event.",
    totalSlots: 256,
    rounds: [
      { name: "Open Qualifiers", matchCount: 3, advanceTop: 4 },
      { name: "Closed Qualifiers", matchCount: 4, advanceTop: 4 },
      { name: "Semi Finals", matchCount: 4, advanceTop: 8 },
      { name: "Grand Finals", matchCount: 6, advanceTop: 0 },
    ],
  },
  {
    id: "massive_400",
    name: "Massive Tournament (400 Squads)",
    description: "25 lobbies → 5 elimination rounds. Nation-level tournament.",
    totalSlots: 400,
    rounds: [
      { name: "Round 1 (Open)", matchCount: 3, advanceTop: 3 },
      { name: "Round 2 (Closed)", matchCount: 3, advanceTop: 4 },
      { name: "Quarter Finals", matchCount: 4, advanceTop: 8 },
      { name: "Semi Finals", matchCount: 4, advanceTop: 8 },
      { name: "Grand Finals", matchCount: 6, advanceTop: 0 },
    ],
  },
];

// ═══ DATA TYPES ═══
export interface Player {
  id: string;
  name: string;
  ign: string;
  uid?: string;
  role: PlayerRole;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  seed: number;
  lobby?: string;
  players: Player[];
  // Stats
  wins: number;
  wwcd: number;
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
  matchResults: MatchSummary[];
}

export interface MatchSummary {
  matchNumber: number;
  map: string;
  placement: number;
  kills: number;
  points: number;
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
  revives: number;
  survived: boolean;
  survivalTime: number;
}

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  teamTag: string;
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
  teamIds: string[];
  matchIds: string[];
}

export interface Round {
  id: string;
  number: number;
  name: string;
  status: "upcoming" | "live" | "completed";
  lobbies: Lobby[];
  matchesPerLobby: number;
  advanceTop: number;
  totalTeams: number;
}

export interface Match {
  id: string;
  matchNumber: number;
  globalMatchNumber: number;
  roundNumber: number;
  roundName: string;
  lobbyId: string;
  lobbyName: string;
  lobbyCode?: string;
  map: string;
  status: "scheduled" | "live" | "completed";
  teamsInMatch: string[];
  results?: TeamMatchResult[];
  mvpPlayerId?: string;
  topKillerId?: string;
  topDamageId?: string;
  completedAt?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description: string;
  status: "draft" | "registration" | "live" | "completed";
  totalSlots: number;
  totalPlayers: number;
  rounds: Round[];
  currentRound: number;
  teams: Team[];
  matches: Match[];
  scoringRule: ScoringRule;
  mapRotation: string[];
  presetId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  bannerColor: string;
  prizePool?: string;
  region?: string;
}