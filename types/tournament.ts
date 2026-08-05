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
  type: ScoringType;
  killPoints: number;
  placementPoints: PlacementPoints;
  wwcdBonus?: number;
  maxKillPoints?: number;
}

export interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  players?: Player[];
  seed?: number;
  groupId?: string;
  tournamentId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  pubgId?: string;
  role?: string;
  teamId: string;
}

export interface Match {
  id: string;
  matchNumber: number;
  map?: string;
  status: "pending" | "live" | "completed";
  results?: MatchResult[];
  roundId?: string;
  stageId?: string;
  scheduledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchResult {
  id: string;
  matchId: string;
  teamId: string;
  team?: Team;
  placement: number;
  kills: number;
  points?: number;
  wwcd?: boolean;
}

export interface Round {
  id: string;
  name: string;
  roundNumber: number;
  matches: Match[];
  tournamentId: string;
}

export interface Stage {
  id: string;
  name: string;
  type: "qualifier" | "semi-final" | "grand-final";
  status: "pending" | "active" | "completed";
  order: number;
  maxAdvancing?: number;
  tournamentId: string;
  groups?: StageGroup[];
  createdAt?: string;
}

export interface StageGroup {
  id: string;
  name: string;
  stageId: string;
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
}

export interface BracketMatch {
  id: string;
  round: number;
  position: number;
  teamA?: Team | null;
  teamB?: Team | null;
  winner?: Team | null;
  score?: {
    teamA: number;
    teamB: number;
  };
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description?: string;
  game: string;
  status: TournamentStatus;
  format: TournamentFormat;
  prizePool?: number;
  maxTeams: number;
  scoringRule?: ScoringRule;
  mapRotation?: string[];
  overlayToken?: string;
  isPublic: boolean;
  discord?: string;
  rules?: string;
  bannerImage?: string;
  brandingData?: Record<string, unknown>;
  scheduleData?: Record<string, unknown>;
  registrationData?: Record<string, unknown>;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  teams?: Team[];
  rounds?: Round[];
  stages?: Stage[];
}

export interface TournamentWithStats extends Tournament {
  _count?: {
    teams: number;
    rounds: number;
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
    description: "High kill points — aggressive play rewarded",
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
    description: "High placement points — survival rewarded",
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