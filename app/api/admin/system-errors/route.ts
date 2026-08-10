// app/api/admin/system-errors/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const severity = searchParams.get("severity")
    const resolved = searchParams.get("resolved")

    const where: Record<string, unknown> = {}
    if (severity) where.severity = severity
    if (resolved !== null && resolved !== undefined) where.resolved = resolved === "true"

    const errors = await prisma.systemError.findMany({
      where,
      orderBy: [{ severity: "desc" }, { lastSeenAt: "desc" }],
      take: 200,
    })

    return NextResponse.json({ errors })
  } catch (err) {
    await logSystemError(err, { route: "/api/admin/system-errors", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 })
  }
}
