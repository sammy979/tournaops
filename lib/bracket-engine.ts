import type { BracketTeam, BracketMatch, TournamentFormat, BestOf, SeedingType } from "@/types/tournament";

// ============================================================
// TournaOps Bracket Engine
// Generates single/double elimination brackets
// Uses BracketMatch — NOT the PUBG squad Match type
// ============================================================

export interface BracketConfig {
  format: TournamentFormat;
  bestOf: BestOf;
  seeding: SeedingType;
  teams: BracketTeam[];
}

export interface GeneratedBracket {
  matches: BracketMatch[];
  rounds: number;
  totalTeams: number;
  format: TournamentFormat;
}

// ── Generate single elimination bracket ──────────────────────
export function generateSingleElimination(
  teams: BracketTeam[],
  bestOf: BestOf = 3
): GeneratedBracket {
  const n = teams.length;
  if (n < 2) throw new Error("Need at least 2 teams");

  // Pad to next power of 2
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...teams];
  while (padded.length < size) {
    padded.push({ id: "bye_" + padded.length, name: "BYE", seed: 999 });
  }

  const matches: BracketMatch[] = [];
  let matchId = 1;
  const rounds = Math.log2(size);

  // Round 1
  for (let i = 0; i < size / 2; i++) {
    const t1 = padded[i * 2];
    const t2 = padded[i * 2 + 1];
    const isBye = t2.name === "BYE";

    matches.push({
      id: "m" + matchId++,
      round: 1,
      position: i,
      bestOf,
      team1: t1,
      team2: isBye ? null : t2,
      score1: 0,
      score2: 0,
      winner: isBye ? t1 : undefined,
      isComplete: isBye,
      nextMatchId: undefined,
    });
  }

  // Subsequent rounds
  for (let r = 2; r <= rounds; r++) {
    const matchesInRound = size / Math.pow(2, r);
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: "m" + matchId++,
        round: r,
        position: i,
        bestOf,
        team1: undefined,
        team2: undefined,
        score1: 0,
        score2: 0,
        winner: undefined,
        isComplete: false,
        nextMatchId: undefined,
      });
    }
  }

  // Wire nextMatchId
  for (let r = 1; r < rounds; r++) {
    const currentRound = matches.filter(m => m.round === r);
    const nextRound = matches.filter(m => m.round === r + 1);

    currentRound.forEach((match, idx) => {
      const nextMatch = nextRound[Math.floor(idx / 2)];
      if (nextMatch) {
        match.nextMatchId = nextMatch.id;
      }
    });
  }

  return {
    matches,
    rounds,
    totalTeams: n,
    format: ("squad" as any),
  };
}

// ── Advance winner to next match ──────────────────────────────
export function advanceWinner(
  matches: BracketMatch[],
  matchId: string,
  winner: BracketTeam
): BracketMatch[] {
  const updated = matches.map(m => ({ ...m }));

  const match = updated.find(m => m.id === matchId);
  if (!match) return updated;

  match.winner = winner;
  match.isComplete = true;

  if (match.nextMatchId) {
    const next = updated.find(m => m.id === match.nextMatchId);
    if (next) {
      const sibling = updated.find(
        m => m.round === match.round &&
          m.nextMatchId === match.nextMatchId &&
          m.id !== matchId
      );
      if (!sibling || sibling.isComplete) {
        if (!next.team1) {
          next.team1 = winner;
        } else {
          next.team2 = winner;
        }
      } else {
        if (match.position % 2 === 0) {
          next.team1 = winner;
        } else {
          next.team2 = winner;
        }
      }
    }
  }

  return updated;
}

// ── Update score ──────────────────────────────────────────────
export function updateMatchScore(
  matches: BracketMatch[],
  matchId: string,
  score1: number,
  score2: number
): BracketMatch[] {
  return matches.map(m => {
    if (m.id !== matchId) return m;

    const threshold = Math.ceil((m.bestOf ?? 1) / 2);
    let winner: BracketTeam | null = null;

    if (score1 >= threshold && score1 > score2) {
      winner = m.team1 || null;
    } else if (score2 >= threshold && score2 > score1) {
      winner = m.team2 || null;
    }

    return {
      ...m,
      score1,
      score2,
      winner,
      isComplete: winner !== null,
    };
  });
}

// ── Seed teams ────────────────────────────────────────────────
export function seedTeams(
  teams: BracketTeam[],
  seeding: SeedingType
): BracketTeam[] {
  if (seeding === "random") {
    return [...teams].sort(() => Math.random() - 0.5);
  }
  if (seeding === "seeded") {
    return [...teams].sort((a, b) => (a.seed || 999) - (b.seed || 999));
  }
  return [...teams];
}

// ── Get bracket stats ─────────────────────────────────────────
export function getBracketStats(bracket: GeneratedBracket): {
  completed: number;
  total: number;
  progress: number;
  champion: BracketTeam | null;
} {
  const completed = bracket.matches.filter(m => m.isComplete).length;
  const total = bracket.matches.length;
  const finalMatch = bracket.matches.find(m => m.round === bracket.rounds);
  const champion = finalMatch?.winner || null;

  return {
    completed,
    total,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    champion,
  };
}

// ── Generate full bracket ─────────────────────────────────────
export function generateBracket(config: BracketConfig): GeneratedBracket {
  const seeded = seedTeams(config.teams, config.seeding);

  switch (config.format) {
    case ("squad" as any):
      return generateSingleElimination(seeded, config.bestOf);
    default:
      return generateSingleElimination(seeded, config.bestOf);
  }
}