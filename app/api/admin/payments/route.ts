// app/api/admin/payments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const method = searchParams.get("method")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) where.status = status
    if (method && ["ESEWA", "KHALTI", "BANK"].includes(method)) where.method = method
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { transactionReference: { contains: search, mode: "insensitive" } },
      ]
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          reviewer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.payment.count({ where }),
    ])

    const summary = await prisma.payment.groupBy({
      by: ["status"],
      _count: { status: true },
    })

    return NextResponse.json({ payments, total, page, limit, summary })
  } catch (err) {
    await logSystemError(err, { route: "/api/admin/payments", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
