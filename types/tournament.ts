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

// Bracket team type
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
  // Support both naming conventions
  teamA?: Team | BracketTeam | null;
  teamB?: Team | BracketTeam | null;
  team1?: Team | BracketTeam | null;
  team2?: Team | BracketTeam | null;
  winner?: Team | BracketTeam | null;
  score?: {
    teamA: number;
    teamB: number;
  };
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
// ============================================================

export const SCORING_PRESETS = {
  PMGC: {
    name: "PMGC (Official)",
    description: "PUBG Mobile Global Championship scoring",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
      6: 2, 7: 1, 8: 1, 9: 0, 10: 0,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  PMPL: {
    name: "PMPL (Official)",
    description: "PUBG Mobile Pro League scoring",
    killPoints: 1,
    wwcdBonus: 0,
    placementPoints: {
      1: 12, 2: 9, 3: 8, 4: 7, 5: 6,
      6: 5, 7: 4, 8: 3, 9: 2, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  COMMUNITY: {
    name: "Community",
    description: "Balanced scoring for community tournaments",
    killPoints: 1,
    wwcdBonus: 3,
    placementPoints: {
      1: 15, 2: 12, 3: 10, 4: 8, 5: 6,
      6: 4, 7: 3, 8: 2, 9: 1, 10: 1,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  KILL_HEAVY: {
    name: "Kill Heavy",
    description: "High kill points - aggressive play rewarded",
    killPoints: 3,
    wwcdBonus: 0,
    placementPoints: {
      1: 10, 2: 6, 3: 5, 4: 4, 5: 3,
      6: 2, 7: 1, 8: 1, 9: 0, 10: 0,
      11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0,
    },
  },
  PLACEMENT_HEAVY: {
    name: "Placement Heavy",
    description: "High placement points - survival rewarded",
    killPoints: 1,
    wwcdBonus: 5,
    placementPoints: {
      1: 25, 2: 20, 3: 16, 4: 13, 5: 11,
      6: 9, 7: 7, 8: 6, 9: 5, 10: 4,
      11: 3, 12: 2, 13: 1, 14: 1, 15: 0, 16: 0,
    },
  },
  CUSTOM: {
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