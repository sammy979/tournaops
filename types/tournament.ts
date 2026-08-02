export type TournamentFormat = "single_elim" | "double_elim" | "round_robin" | "swiss" | "battle_royale";
export type TournamentStatus = "draft" | "registration" | "upcoming" | "live" | "completed";
export type MatchStatus = "scheduled" | "live" | "completed";
export type BestOf = 1 | 3 | 5 | 7;

export interface PlayerStats {
  id: string;
  name: string;
  ign: string;
  teamId: string;
  teamName: string;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  headshots: number;
  knockdowns: number;
  revives: number;
  matches: number;
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

export interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  seed: number;
  players: Player[];
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

export interface Player {
  id: string;
  name: string;
  ign: string;
  role?: string;
}

export interface ScoringRule {
  placements: Record<number, number>;
  killPoints: number;
  assistPoints: number;
  winnerBonus: number;
}

export interface Match {
  id: string;
  matchNumber: number;
  round: number;
  bracket?: "winners" | "losers" | "final";
  team1?: Team;
  team2?: Team;
  score1: number;
  score2: number;
  winner?: Team;
  status: MatchStatus;
  bestOf: BestOf;
  scheduledAt?: string;
  nextMatchId?: string;
  results?: TeamMatchResult[];
  mvpPlayerId?: string;
  topKillerId?: string;
  topDamageId?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  description: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  bestOf: BestOf;
  maxTeams: number;
  teams: Team[];
  matches: Match[];
  scoringRule: ScoringRule;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  bannerColor?: string;
  prizePool?: string;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  team: Team;
  matchesPlayed: number;
  wins: number;
  totalKills: number;
  totalDeaths: number;
  totalDamage: number;
  placementPoints: number;
  killPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  avgPlacement: number;
  kd: number;
  rankChange: "up" | "down" | "same";
}