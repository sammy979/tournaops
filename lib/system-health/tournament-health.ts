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

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        teams: true,
        stages: {
          include: {
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

    // Teams check
    if (tournament.teams.length === 0) {
      issues.push({
        type: "NO_TEAMS",
        severity: "warning",
        message: "No teams registered",
        link: `/dashboard/tournaments/${tournamentId}/teams`,
        tournamentId,
      })
    }

    // Duplicate teams check
    const teamNames = tournament.teams.map((t: any) => (t.name || "").toLowerCase())
    const uniqueNames = new Set(teamNames)
    if (teamNames.length !== uniqueNames.size) {
      issues.push({
        type: "DUPLICATE_TEAMS",
        severity: "error",
        message: `Duplicate team names detected`,
        link: `/dashboard/tournaments/${tournamentId}/teams`,
        tournamentId,
      })
    }

    // Stages check
    for (const stage of tournament.stages) {
      const stageMatches = stage.matches || []
      const matchesWithoutResults = stageMatches.filter((m: any) => !m.results || m.results.length === 0)
      if (matchesWithoutResults.length > 0 && stageMatches.length > 0) {
        issues.push({
          type: "MISSING_RESULTS",
          severity: "warning",
          message: `Stage "${stage.name}": ${matchesWithoutResults.length} match(es) missing results`,
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
  } catch (err) {
    return {
      tournamentId,
      tournamentName: "Error",
      healthy: false,
      issues: [{ type: "CHECK_FAILED", severity: "error", message: "Health check failed", tournamentId }],
      checkedAt: new Date(),
    }
  }
}

export async function checkAllTournamentsHealth(): Promise<TournamentHealthResult[]> {
  try {
    const tournaments = await prisma.tournament.findMany({ select: { id: true } })
    const results = await Promise.allSettled(tournaments.map((t: { id: string }) => checkTournamentHealth(t.id)))
    return results
      .filter((r): r is PromiseFulfilledResult<TournamentHealthResult> => r.status === "fulfilled")
      .map((r) => r.value)
  } catch {
    return []
  }
}