// lib/system-health/tournament-health.ts
import { prisma } from "@/lib/prisma"

export interface TournamentHealthIssue {
  type: string
  severity: "warning" | "error" | "critical"
  message: string
  link?: string
  tournamentId: string
}

export interface TournamentHealthResult {
  tournamentId: string
  tournamentName: string
  healthy: boolean
  issues: TournamentHealthIssue[]
  checkedAt: Date
}

export async function checkTournamentHealth(tournamentId: string): Promise<TournamentHealthResult> {
  const issues: TournamentHealthIssue[] = []

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      teams: true,
      stages: {
        include: {
          groups: { include: { teams: true } },
          matches: { include: { results: true } },
        },
      },
    },
  })

  if (!tournament) {
    return {
      tournamentId,
      tournamentName: "Unknown",
      healthy: false,
      issues: [{ type: "NOT_FOUND", severity: "critical", message: "Tournament not found", tournamentId }],
      checkedAt: new Date(),
    }
  }

  // Check teams
  if (tournament.teams.length === 0) {
    issues.push({ type: "NO_TEAMS", severity: "warning", message: "No teams registered", link: `/dashboard/tournaments/${tournamentId}/teams`, tournamentId })
  }

  // Check duplicate teams
  const teamNames = tournament.teams.map((t: { name: string }) => t.name.toLowerCase())
  const duplicates = teamNames.filter((name: string, i: number) => teamNames.indexOf(name) !== i)
  if (duplicates.length > 0) {
    issues.push({ type: "DUPLICATE_TEAMS", severity: "error", message: `${duplicates.length} duplicate team name(s) detected`, link: `/dashboard/tournaments/${tournamentId}/teams`, tournamentId })
  }

  // Check stages
  for (const stage of tournament.stages) {
    if (stage.groups.length === 0) {
      issues.push({ type: "NO_GROUPS", severity: "warning", message: `Stage "${stage.name}" has no groups`, link: `/dashboard/tournaments/${tournamentId}/stages`, tournamentId })
    }

    for (const group of stage.groups) {
      if (group.teams.length === 0) {
        issues.push({ type: "EMPTY_GROUP", severity: "warning", message: `Group "${group.name}" has no teams assigned`, link: `/dashboard/tournaments/${tournamentId}/stages`, tournamentId })
      }
    }

    // Check missing results
    const matchesWithoutResults = stage.matches.filter((m: { results: unknown[] }) => m.results.length === 0)
    if (matchesWithoutResults.length > 0) {
      issues.push({
        type: "MISSING_RESULTS",
        severity: "warning",
        message: `${matchesWithoutResults.length} match(es) missing results`,
        link: `/dashboard/tournaments/${tournamentId}/match-results`,
        tournamentId,
      })
    }
  }

  return {
    tournamentId,
    tournamentName: tournament.name,
    healthy: issues.filter((i) => i.severity !== "warning").length === 0,
    issues,
    checkedAt: new Date(),
  }
}

export async function checkAllTournamentsHealth(): Promise<TournamentHealthResult[]> {
  const tournaments = await prisma.tournament.findMany({ select: { id: true } })
  const results = await Promise.allSettled(tournaments.map((t: { id: string }) => checkTournamentHealth(t.id)))
  return results
    .filter((r): r is PromiseFulfilledResult<TournamentHealthResult> => r.status === "fulfilled")
    .map((r) => r.value)
}
