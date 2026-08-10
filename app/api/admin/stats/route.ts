// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"

export async function GET(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    // Run all counts in parallel
    const [
      totalUsers,
      totalTournaments,
      totalTeams,
      totalMatches,
      proUsers,
      liveTournaments,
      pendingPayments,
      approvedPayments,
      totalPayments,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.tournament.count().catch(() => 0),
      prisma.team.count().catch(() => 0),
      (prisma as any).match?.count?.().catch(() => 0) ?? 0,
      prisma.user.count({ where: { isPro: true } }).catch(() => 0),
      prisma.tournament.count({
        where: { status: { in: ["live", "LIVE", "registration"] } },
      }).catch(() => 0),
      (prisma as any).payment?.count?.({ where: { status: "PENDING" } }).catch(() => 0) ?? 0,
      (prisma as any).payment?.count?.({ where: { status: "APPROVED" } }).catch(() => 0) ?? 0,
      (prisma as any).payment?.count?.().catch(() => 0) ?? 0,
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          displayName: true,
          isPro: true,
          role: true,
          createdAt: true,
        },
      }).catch(() => []),
    ])

    // Total revenue from approved payments
    let totalRevenue = 0
    try {
      const revenue = await (prisma as any).payment?.aggregate?.({
        where: { status: "APPROVED" },
        _sum: { amount: true },
      })
      totalRevenue = revenue?._sum?.amount || 0
    } catch {}

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTournaments,
        totalTeams,
        totalMatches,
        proUsers,
        liveTournaments,
        pendingPayments,
        approvedPayments,
        totalPayments,
        totalRevenue,
      },
      recentUsers,
    })
  } catch (err) {
    console.error("Admin stats error:", err)
    return NextResponse.json({
      stats: {
        totalUsers: 0,
        totalTournaments: 0,
        totalTeams: 0,
        totalMatches: 0,
        proUsers: 0,
        liveTournaments: 0,
        pendingPayments: 0,
        approvedPayments: 0,
        totalPayments: 0,
        totalRevenue: 0,
      },
      recentUsers: [],
      error: "Failed to fetch stats",
    }, { status: 500 })
  }
}