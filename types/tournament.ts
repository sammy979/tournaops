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

// AI Types
export interface AIAnalysis {
  summary: string;
  topTeams: string[];
  insights: string[];
  recommendations: string[];
}

// Overlay Types
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