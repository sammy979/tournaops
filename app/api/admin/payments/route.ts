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

    // Build where clause - only apply filters if they exist
    const where: Record<string, unknown> = {}
    if (status && ["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      where.status = status
    }
    if (method && ["ESEWA", "KHALTI", "BANK"].includes(method)) {
      where.method = method
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { username: { contains: search, mode: "insensitive" } } },
        { user: { displayName: { contains: search, mode: "insensitive" } } },
        { transactionReference: { contains: search, mode: "insensitive" } },
      ]
    }

    const [payments, total, summary] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
            },
          },
        },
      }),
      prisma.payment.count({ where }),
      prisma.payment.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ])

    // Map user field for backward compatibility
    const mappedPayments = payments.map((p) => ({
      ...p,
      user: p.user
        ? {
            id: p.user.id,
            email: p.user.email,
            name: p.user.displayName || p.user.username,
          }
        : null,
      reviewer: p.reviewer
        ? {
            id: p.reviewer.id,
            email: p.reviewer.email,
            name: p.reviewer.displayName || p.reviewer.username,
          }
        : null,
    }))

    return NextResponse.json({
      payments: mappedPayments,
      total,
      page,
      limit,
      summary,
    })
  } catch (err) {
    console.error("Admin payments error:", err)
    await logSystemError(err, {
      route: "/api/admin/payments",
      severity: "ERROR",
    })
    return NextResponse.json(
      {
        payments: [],
        total: 0,
        summary: [],
        error: "Failed to fetch payments",
      },
      { status: 500 }
    )
  }
}