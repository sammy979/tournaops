// app/api/admin/payments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { action, rejectionReason, adminNote } = await req.json()
    const paymentId = params.id

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    })

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    if (payment.status !== "PENDING") {
      return NextResponse.json({ error: "Payment has already been reviewed" }, { status: 409 })
    }

    if (action === "approve") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: session.userId,
            adminNote: adminNote || null,
          },
        })

        await tx.user.update({
          where: { id: payment.userId },
          data: {
            isPro: true,
            proGrantedAt: new Date(),
            proExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            proGrantedBy: session.userId,
            proSource: "PAYMENT",
          },
        })

        try {
          await (tx as any).auditLog?.create({
            data: {
              action: "PAYMENT_APPROVED",
              actorId: session.userId,
              targetId: paymentId,
              metadata: JSON.stringify({
                userId: payment.userId,
                method: payment.method,
                amount: payment.amount,
              }),
            },
          })
        } catch {}
      })

      return NextResponse.json({ message: "Payment approved and Pro activated" })
    }

    if (action === "reject") {
      if (!rejectionReason) {
        return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
          reviewedBy: session.userId,
          rejectionReason: String(rejectionReason).slice(0, 500),
          adminNote: adminNote || null,
        },
      })

      try {
        await (prisma as any).auditLog?.create({
          data: {
            action: "PAYMENT_REJECTED",
            actorId: session.userId,
            targetId: paymentId,
            metadata: JSON.stringify({
              reason: rejectionReason,
              userId: payment.userId,
            }),
          },
        })
      } catch {}

      return NextResponse.json({ message: "Payment rejected" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err) {
    await logSystemError(err, { route: "/api/admin/payments/[id]", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}