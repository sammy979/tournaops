export type TournamentFormat = "single_elim" | "double_elim" | "round_robin" | "swiss" | "battle_royale";
export type TournamentStatus = "draft" | "registration" | "upcoming" | "live" | "completed";
export type MatchStatus = "scheduled" | "live" | "completed";
export type BestOf = 1 | 3 | 5 | 7;

export interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  seed: number;
  players?: string[];
  wins: number;
  losses: number;
  points: number;
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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  bannerColor?: string;
  prizePool?: string;
}