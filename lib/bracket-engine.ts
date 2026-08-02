import { nanoid } from "nanoid";
import type { Tournament, Team, Match, TournamentFormat, BestOf, SeedingType } from "@/types/tournament";

// Seed teams based on selected type
export function seedTeams(teams: Team[], type: SeedingType): Team[] {
  const seeded = [...teams];
  
  if (type === "random") {
    for (let i = seeded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
    }
  } else if (type === "ranked") {
    seeded.sort((a, b) => (a.seed || 999) - (b.seed || 999));
  }
  
  return seeded.map((t, i) => ({ ...t, seed: i + 1 }));
}

// Generate single elimination bracket
export function generateSingleElim(teams: Team[], bestOf: BestOf): Match[] {
  const matches: Match[] = [];
  const rounds = Math.ceil(Math.log2(teams.length));
  const totalSlots = Math.pow(2, rounds);
  
  // Pad with byes if needed
  const paddedTeams: (Team | null)[] = [...teams];
  while (paddedTeams.length < totalSlots) {
    paddedTeams.push(null);
  }
  
  // Standard bracket seeding (1 vs 16, 8 vs 9, etc.)
  const seedOrder = generateSeedOrder(totalSlots);
  const seededSlots = seedOrder.map(idx => paddedTeams[idx - 1]);
  
  // Round 1
  let currentRoundMatches: Match[] = [];
  for (let i = 0; i < totalSlots / 2; i++) {
    const match: Match = {
      id: nanoid(8),
      round: 1,
      position: i,
      team1: seededSlots[i * 2],
      team2: seededSlots[i * 2 + 1],
      score1: 0,
      score2: 0,
      isComplete: false,
      bestOf,
      bracket: "winners"
    };
    
    // Auto-advance if bye
    if (match.team1 && !match.team2) {
      match.winner = match.team1;
      match.isComplete = true;
    } else if (match.team2 && !match.team1) {
      match.winner = match.team2;
      match.isComplete = true;
    }
    
    currentRoundMatches.push(match);
    matches.push(match);
  }
  
  // Subsequent rounds
  for (let round = 2; round <= rounds; round++) {
    const nextRoundMatches: Match[] = [];
    for (let i = 0; i < currentRoundMatches.length / 2; i++) {
      const match: Match = {
        id: nanoid(8),
        round,
        position: i,
        team1: null,
        team2: null,
        score1: 0,
        score2: 0,
        isComplete: false,
        bestOf,
        bracket: "winners"
      };
      
      // Link previous matches to this one
      currentRoundMatches[i * 2].nextMatchId = match.id;
      currentRoundMatches[i * 2 + 1].nextMatchId = match.id;
      
      nextRoundMatches.push(match);
      matches.push(match);
    }
    currentRoundMatches = nextRoundMatches;
  }
  
  // Propagate byes forward
  matches.forEach(m => {
    if (m.isComplete && m.winner && m.nextMatchId) {
      advanceWinner(matches, m);
    }
  });
  
  return matches;
}

// Standard bracket seed order (1v16, 8v9, 4v13, 5v12, ...)
function generateSeedOrder(size: number): number[] {
  if (size === 2) return [1, 2];
  if (size === 4) return [1, 4, 2, 3];
  
  const rounds = Math.log2(size);
  let result = [1, 2];
  
  for (let r = 1; r < rounds; r++) {
    const newResult: number[] = [];
    const sum = Math.pow(2, r + 1) + 1;
    result.forEach(seed => {
      newResult.push(seed);
      newResult.push(sum - seed);
    });
    result = newResult;
  }
  
  return result;
}

// Generate round robin matches
export function generateRoundRobin(teams: Team[], bestOf: BestOf): Match[] {
  const matches: Match[] = [];
  const n = teams.length;
  const isOdd = n % 2 !== 0;
  const players = isOdd ? [...teams, null] : [...teams];
  const totalRounds = players.length - 1;
  const matchesPerRound = players.length / 2;
  
  const arr = [...players];
  
  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const t1 = arr[i];
      const t2 = arr[arr.length - 1 - i];
      
      if (t1 && t2) {
        matches.push({
          id: nanoid(8),
          round,
          position: i,
          team1: t1,
          team2: t2,
          score1: 0,
          score2: 0,
          isComplete: false,
          bestOf,
          bracket: "winners"
        });
      }
    }
    
    // Rotate (keep first fixed)
    const last = arr.pop()!;
    arr.splice(1, 0, last);
  }
  
  return matches;
}

// Advance winner to next match
export function advanceWinner(matches: Match[], completedMatch: Match): Match[] {
  if (!completedMatch.winner || !completedMatch.nextMatchId) return matches;
  
  const nextMatch = matches.find(m => m.id === completedMatch.nextMatchId);
  if (!nextMatch) return matches;
  
  // Determine which slot based on position
  const isFirstSlot = completedMatch.position % 2 === 0;
  
  if (isFirstSlot) {
    nextMatch.team1 = completedMatch.winner;
  } else {
    nextMatch.team2 = completedMatch.winner;
  }
  
  return matches;
}

// Create initial tournament
export function createTournament(
  name: string,
  game: string,
  teamCount: number,
  format: TournamentFormat,
  bestOf: BestOf,
  seedingType: SeedingType
): Tournament {
  const teams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
    id: nanoid(8),
    name: `Team ${i + 1}`,
    seed: i + 1
  }));
  
  let matches: Match[] = [];
  
  if (format === "single_elim") {
    matches = generateSingleElim(seedTeams(teams, seedingType), bestOf);
  } else if (format === "round_robin") {
    matches = generateRoundRobin(teams, bestOf);
  } else if (format === "swiss") {
    // Swiss = round robin for first round; pair by wins after that
    matches = generateSwissRound(teams, 1, bestOf);
  } else if (format === "double_elim") {
    matches = generateSingleElim(seedTeams(teams, seedingType), bestOf); // simplified
  }
  
  return {
    id: nanoid(12),
    name,
    game,
    format,
    teamCount,
    bestOf,
    seedingType,
    teams,
    matches,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true
  };
}

// Swiss format - pairs by current record
export function generateSwissRound(teams: Team[], round: number, bestOf: BestOf): Match[] {
  const matches: Match[] = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      matches.push({
        id: nanoid(8),
        round,
        position: Math.floor(i / 2),
        team1: shuffled[i],
        team2: shuffled[i + 1],
        score1: 0,
        score2: 0,
        isComplete: false,
        bestOf,
        bracket: "winners"
      });
    }
  }
  
  return matches;
}

// Calculate standings for round robin / swiss
export function calculateStandings(tournament: Tournament): any[] {
  const standings = tournament.teams.map(team => ({
    team,
    wins: 0,
    losses: 0,
    draws: 0,
    points: 0,
    scoreFor: 0,
    scoreAgainst: 0
  }));
  
  tournament.matches.forEach(match => {
    if (!match.isComplete || !match.team1 || !match.team2) return;
    
    const t1 = standings.find(s => s.team.id === match.team1!.id);
    const t2 = standings.find(s => s.team.id === match.team2!.id);
    
    if (!t1 || !t2) return;
    
    t1.scoreFor += match.score1;
    t1.scoreAgainst += match.score2;
    t2.scoreFor += match.score2;
    t2.scoreAgainst += match.score1;
    
    if (match.winner?.id === match.team1.id) {
      t1.wins++;
      t2.losses++;
      t1.points += 3;
    } else if (match.winner?.id === match.team2.id) {
      t2.wins++;
      t1.losses++;
      t2.points += 3;
    }
  });
  
  return standings.sort((a, b) => 
    b.points - a.points || 
    (b.scoreFor - b.scoreAgainst) - (a.scoreFor - a.scoreAgainst)
  );
}