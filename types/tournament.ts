export type TournamentFormat = "single_elim" | "double_elim" | "round_robin" | "swiss";
export type BestOf = 1 | 3 | 5;
export type SeedingType = "random" | "manual" | "ranked";

export interface Team {
  id: string;
  name: string;
  logo?: string;
  seed?: number;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  team1?: Team | null;
  team2?: Team | null;
  score1: number;
  score2: number;
  winner?: Team | null;
  bestOf: BestOf;
  isComplete: boolean;
  nextMatchId?: string;
  bracket?: "winners" | "losers" | "final";
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  format: TournamentFormat;
  teamCount: number;
  bestOf: BestOf;
  seedingType: SeedingType;
  teams: Team[];
  matches: Match[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface Standing {
  team: Team;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  scoreFor: number;
  scoreAgainst: number;
}