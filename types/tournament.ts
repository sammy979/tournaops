// ============================================================
// TOURNAOPS — Central Type Definitions
// ============================================================

export type TournamentStatus = "draft" | "registration" | "live" | "completed" | "cancelled";
export type TournamentFormat = "solo" | "duo" | "squad";
export type ScoringType = "PMGC" | "PMPL" | "COMMUNITY" | "KILL_HEAVY" | "PLACEMENT_HEAVY" | "CUSTOM";

export interface PlacementPoints {
  [place: number]: number;
}

export interface ScoringRule {
  type?: ScoringType;
  name?: string;
  description?: string;
  killPoints: number;
  placementPoints: PlacementPoints;
  wwcdBonus?: number;
  maxKillPoints?: number;
}

export interface Player {
  id: string;
  name: string;
  ign?: string;
  pubgId?: string;
  role?: string;
  photo?: string;
  country?: string;
  countryFlag?: string;
  isCaptain?: boolean;
  isSubstitute?: boolean;
  teamId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerResult {
  playerId: string;
  playerName: string;
  kills: number;
  damage: number;
  survived?: boolean;
  assists?: number;
  revives?: number;
  headshotKills?: number;
}

// Alias for backward compatibility
export type PlayerMatchResult = PlayerResult;

export interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  banner?: string;
  country?: string;
  countryFlag?: string;
  players?: any[];
  playersList?: Player[];
  seed?: number;
  contact?: string;
  groupId?: string;
  tournamentId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BracketTeam {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  seed?: number;
}

export type BestOf = 1 | 3 | 5;
export type SeedingType = "random" | "seeded" | "manual";

export interface MatchResult {
  teamId: string;
  teamName?: string;
  placement: number;
  kills: number;
  damage?: number;
  points?: number;
  totalPoints?: number;
  placementPoints?: number;
  killPoints?: number;
  wwcd?: boolean;
  playerResults?: PlayerResult[];
}

export interface Match {
  id: string;
  name?: string;
  matchNumber?: number;
  map?: string;
  status: "pending" | "live" | "completed";
  results?: MatchResult[];
  roundId?: string;
  lobbyId?: string;
  stageId?: string;
  groupId?: string;
  startTime?: string;
  endTime?: string;
  screenshotUrl?: string;
  notes?: string;
  tournamentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Round {
  id: string;
  name: string;
  type?: string;
  order?: number;
  roundNumber?: number;
  matchesPerLobby?: number;
  advanceTop?: number;
  lobbies?: any[];
  matches?: Match[];
  tournamentId: string;
}

export interface Stage {
  id: string;
  name: string;
  type: string;
  status: string;
  order: number;
  numGroups?: number;
  teamsPerGroup?: number;
  matchesPerGroup?: number;
  totalTeams?: number;
  teamsAdvancing?: number;
  teamsEliminated?: number;
  maxAdvancing?: number;
  isLocked?: boolean;
  description?: string;
  tournamentId: string;
  groups?: StageGroup[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StageGroup {
  id: string;
  name: string;
  order?: number;
  stageId: string;
  teamIds?: string[];
  matchIds?: string[];
  status?: string;
  teams?: Team[];
}

export interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag?: string;
  totalPoints: number;
  totalKills: number;
  matchesPlayed: number;
  wwcdCount: number;
  averagePlacement?: number;
  previousRank?: number;
  wins?: number;
  losses?: number;
  points?: number;
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

export interface TeamMatchResult {
  teamId: string;
  teamName: string;
  placement: number;
  placementPoints: number;
  killPoints: number;
  totalPoints: number;
  kills: number;
  damage?: number;
  wwcd?: boolean;
  playerResults?: PlayerResult[];
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  teamA?: Team | BracketTeam | null;
  teamB?: Team | BracketTeam | null;
  team1?: Team | BracketTeam | null;
  team2?: Team | BracketTeam | null;
  winner?: Team | BracketTeam | null;
  score?: { teamA: number; teamB: number };
  score1?: number;
  score2?: number;
  bestOf?: BestOf;
  isComplete?: boolean;
  nextMatchId?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description?: string;
  game: string;
  status: TournamentStatus;
  format?: TournamentFormat;
  prizePool?: string;
  maxTeams: number;
  scoringRule?: ScoringRule | any;
  mapRotation?: string[];
  overlayToken?: string;
  isPublic: boolean;
  discord?: string;
  rules?: string;
  bannerImage?: string;
  trophyImage?: string;
  coverImage?: string;
  brandingData?: Record<string, any>;
  scheduleData?: any;
  registrationData?: any;
  sponsorLogos?: any;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  teams?: Team[];
  rounds?: Round[];
  matches?: Match[];
  stages?: Stage[];
}

export interface TournamentWithStats extends Tournament {
  _count?: {
    teams: number;
    rounds: number;
    matches: number;
  };
}

export interface AIAnalysis {
  summary: string;
  topTeams: string[];
  insights: string[];
  recommendations: string[];
}

export interface OverlayData {
  tournament: Tournament;
  currentMatch?: Match;
  standings?: Standing[];
  topFragger?: {
    player: string;
    team: string;
    kills: number;
  };
}

// ============================================================
// SCORING PRESETS
// These values are the SINGLE SOURCE OF TRUTH for tournament
// creation. They MUST match lib/scoring-engine.ts exactly.
// Do not change these values without also updating scoring-engine.ts.
// ============================================================

export const SCORING_PRESETS = {
  PMGC: {
    type: "PMGC" as ScoringType,
    name: "PMGC (Official)",
    description: "PUBG Mobile Global Championship scoring",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 12, 2: 9, 3: 8, 4: 7, 5: 6,
      6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  PMPL: {
    type: "PMPL" as ScoringType,
    name: "PMPL (Official)",
    description: "PUBG Mobile Pro League scoring",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
      6: 4, 7: 3, 8: 2, 9: 1, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  COMMUNITY: {
    type: "COMMUNITY" as ScoringType,
    name: "Community",
    description: "Balanced scoring for community tournaments",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
      6: 2, 7: 2, 8: 1, 9: 1, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  KILL_HEAVY: {
    type: "KILL_HEAVY" as ScoringType,
    name: "Kill Heavy",
    description: "High kill points — aggressive play rewarded",
    killPoints: 2,
    wwcdBonus: 3,
    placementPoints: {
      1: 8, 2: 5, 3: 4, 4: 3, 5: 2,
      6: 1, 7: 1, 8: 0, 9: 0, 10: 0,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  PLACEMENT_HEAVY: {
    type: "PLACEMENT_HEAVY" as ScoringType,
    name: "Placement Heavy",
    description: "High placement points — survival rewarded",
    killPoints: 1,
    wwcdBonus: 5,
    placementPoints: {
      1: 20, 2: 15, 3: 12, 4: 10, 5: 8,
      6: 6, 7: 5, 8: 4, 9: 3, 10: 2,
      11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  CUSTOM: {
    type: "CUSTOM" as ScoringType,
    name: "Custom",
    description: "Define your own scoring rules",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
      6: 2, 7: 1, 8: 1, 9: 0, 10: 0,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
} as const;

export type ScoringPresetKey = keyof typeof SCORING_PRESETS;