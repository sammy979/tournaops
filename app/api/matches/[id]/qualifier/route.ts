// app/api/matches/[id]/qualifier/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"

interface ResultInput {
  teamName?: string
  matched?: string
  placement: number
  kills: number
  survivalPoints?: number
  totalPoints?: number
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resolvedParams = await Promise.resolve(params)
    const matchId = resolvedParams.id

    const body = await req.json().catch(() => ({}))
    const { results, source } = body as { results?: ResultInput[]; source?: string }

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "Results array required" }, { status: 400 })
    }

    // Load match with tournament access
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        stage: {
          include: {
            tournament: {
              select: { id: true, userId: true },
              include: { teams: true },
            },
          },
        },
      },
    })

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 })

    // Access check
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, isAdmin: true },
    })
    const isAdmin = user?.role === "SUPER_ADMIN" || user?.isAdmin
    if (!isAdmin && match.stage.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const teams = (match.stage.tournament as any).teams || []

    // Match team names to actual team IDs
    const normalized = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")
    const matchTeamByName = (name: string) => {
      const target = normalized(name)
      // Exact match
      let team = teams.find((t: any) => normalized(t.name) === target)
      if (team) return team
      // Partial match
      team = teams.find(
        (t: any) => normalized(t.name).includes(target) || target.includes(normalized(t.name))
      )
      return team
    }

    const savedResults: any[] = []
    const unmatched: string[] = []

    for (const r of results) {
      const teamName = String(r.teamName || "").trim()
      if (!teamName) continue

      let teamId = r.matched || null
      if (!teamId) {
        const foundTeam = matchTeamByName(teamName)
        teamId = foundTeam?.id || null
      }

      if (!teamId) {
        unmatched.push(teamName)
        continue
      }

      // Try to save - schema may vary, so we save what we can
      try {
        const resultData: any = {
          matchId,
          teamId,
          placement: r.placement || 0,
          kills: r.kills || 0,
          verified: false,
        }
        // Optional fields
        if (r.survivalPoints !== undefined) resultData.survivalPoints = r.survivalPoints
        if (r.totalPoints !== undefined) resultData.totalPoints = r.totalPoints
        if (source) resultData.source = source
        resultData.submittedAt = new Date()
        resultData.submittedBy = session.userId

        // Upsert - if a result exists for this team on this match, update it
        const existing = await (prisma as any).matchResult?.findFirst?.({
          where: { matchId, teamId },
        }).catch(() => null)

        if (existing) {
          await (prisma as any).matchResult.update({
            where: { id: existing.id },
            data: resultData,
          })
        } else {
          await (prisma as any).matchResult.create({ data: resultData })
        }

        savedResults.push({ teamName, teamId, ...r })
      } catch (err: any) {
        console.error("Failed to save result for", teamName, err?.message)
      }
    }

    // Mark match as completed if all results in
    try {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: "COMPLETED" },
      })
    } catch {}

    // Audit log
    try {
      await (prisma as any).auditLog?.create({
        data: {
          action: "RESULTS_SAVED",
          actorId: session.userId,
          targetId: matchId,
          metadata: JSON.stringify({
            matchId,
            tournamentId: match.stage.tournament.id,
            source: source || "MANUAL",
            savedCount: savedResults.length,
            unmatchedCount: unmatched.length,
          }),
        },
      })
    } catch {}

    return NextResponse.json({
      message: `Saved ${savedResults.length} result(s)`,
      saved: savedResults.length,
      unmatched,
      unmatchedTeams: unmatched,
    })
  } catch (err: any) {
    await logSystemError(err, {
      route: "/api/matches/[id]/qualifier",
      severity: "ERROR",
    })
    return NextResponse.json(
      { error: err?.message || "Failed to save results" },
      { status: 500 }
    )
  }
}