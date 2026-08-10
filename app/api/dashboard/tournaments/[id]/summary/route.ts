// app/api/dashboard/tournaments/[id]/summary/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { checkTournamentHealth } from "@/lib/system-health/tournament-health"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const tournamentId = params.id
    const isSuperAdmin = session.role === "SUPER_ADMIN"

    const whereClause = isSuperAdmin
      ? { id: tournamentId }
      : { id: tournamentId, organizerId: session.userId }

    const tournament = await prisma.tournament.findFirst({
      where: whereClause,
      include: {
        teams: { select: { id: true, name: true } },
        stages: {
          orderBy: { order: "asc" },
          include: {
            matches: {
              orderBy: { scheduledAt: "asc" },
              include: {
                results: {
                  select: { id: true, verified: true, submittedAt: true },
                },
              },
            },
          },
        },
        _count: { select: { teams: true } },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 })
    }

    const allMatches = tournament.stages.flatMap((s) => s.matches)
    const completedMatches = allMatches.filter((m) => m.results.length > 0).length
    const pendingResultsMatches = allMatches.filter((m) =>
      m.results.some((r) => !r.verified)
    )

    const currentStage =
      tournament.stages.length > 0
        ? tournament.stages[tournament.stages.length - 1]
        : null

    const now = new Date()
    const upcomingMatch = allMatches
      .filter(
        (m) =>
          m.scheduledAt &&
          new Date(m.scheduledAt) > now &&
          m.results.length === 0
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime()
      )[0]

    const liveMatch = allMatches.find((m) => (m as any).status === "LIVE")
    const nextMatchRaw = liveMatch || upcomingMatch || null

    const health = await checkTournamentHealth(tournamentId)

    let recentActivity: unknown[] = []
    try {
      const auditModel = (prisma as any).auditLog
      if (auditModel) {
        const logs = await auditModel.findMany({
          where: { metadata: { contains: tournamentId } },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
        recentActivity = (logs || []).map(
          (log: { id: string; action: string; createdAt: Date; actorId: string }) => ({
            id: log.id,
            type: log.action,
            message: log.action
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c: string) => c.toUpperCase()),
            timestamp: log.createdAt,
            actor: log.actorId,
          })
        )
      }
    } catch {}

    const summary = {
      totalTeams: tournament._count.teams,
      totalMatches: allMatches.length,
      completedMatches,
      pendingResults: pendingResultsMatches.length,
      readyTeams: tournament.teams.length,
      warnings: health.issues.filter((i) => i.severity === "warning").length,
      discordConnected: !!(process.env.DISCORD_BOT_TOKEN),
      currentStage: currentStage?.name,
      status: (tournament as any).status || "DRAFT",
    }

    const pendingResultsPayload = pendingResultsMatches.slice(0, 10).map((m) => ({
      id: m.id,
      matchNumber: (m as any).matchNumber ?? 0,
      source: (m.results[0] as any)?.source || "MANUAL",
      status: "PENDING",
      submittedAt: (m.results[0] as any)?.submittedAt || m.scheduledAt || new Date(),
    }))

    const nextMatchPayload = nextMatchRaw
      ? {
          id: nextMatchRaw.id,
          matchNumber: (nextMatchRaw as any).matchNumber ?? 0,
          map: (nextMatchRaw as any).map,
          scheduledAt: nextMatchRaw.scheduledAt,
          teamCount: (nextMatchRaw as any).teams?.length,
          status: (nextMatchRaw as any).status || "SCHEDULED",
        }
      : null

    return NextResponse.json({
      summary,
      healthIssues: health.issues,
      pendingResults: pendingResultsPayload,
      nextMatch: nextMatchPayload,
      recentActivity,
    })
  } catch (err) {
    await logSystemError(err, {
      route: "/api/dashboard/tournaments/[id]/summary",
      severity: "ERROR",
    })
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 })
  }
}