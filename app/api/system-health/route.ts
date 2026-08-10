// app/api/system-health/route.ts
import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { getAllServiceHealth } from "@/lib/system-health/health-checks"
import { prisma } from "@/lib/prisma"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const [services, errorCounts, pendingPayments] = await Promise.all([
      getAllServiceHealth(),
      prisma.systemError.groupBy({
        by: ["severity"],
        _count: { severity: true },
        where: {
          firstSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          resolved: false,
        },
      }),
      prisma.payment.count({ where: { status: "PENDING" } }),
    ])

    const counts = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 }
    for (const group of errorCounts) {
      counts[group.severity as keyof typeof counts] = group._count.severity
    }

    return NextResponse.json({ services, errorCounts: counts, pendingPayments, checkedAt: new Date() })
  } catch (err) {
    await logSystemError(err, { route: "/api/system-health", severity: "ERROR" })
    return NextResponse.json({ error: "Health check failed" }, { status: 500 })
  }
}
