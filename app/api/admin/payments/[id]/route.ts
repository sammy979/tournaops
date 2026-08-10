// app/api/admin/payments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"
import { PRO_PRICE } from "@/lib/pricing"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Auth check (API style)
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle both Next.js versions of params
    const resolvedParams = await Promise.resolve(params)
    const paymentId = resolvedParams.id

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
    }

    // Parse body
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { action, rejectionReason, adminNote } = body || {}

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Load payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: `Payment already ${payment.status.toLowerCase()}` },
        { status: 409 }
      )
    }

    // ─── APPROVE ────────────────────────────────────────────
    if (action === "approve") {
      // Calculate Pro expiry
      let newExpiryDate: Date
      try {
        const currentUser = await prisma.user.findUnique({
          where: { id: payment.userId },
          select: { proExpiresAt: true, isPro: true },
        })

        const now = new Date()
        const baseDate =
          currentUser?.isPro &&
          currentUser.proExpiresAt &&
          new Date(currentUser.proExpiresAt) > now
            ? new Date(currentUser.proExpiresAt)
            : now

        const days = PRO_PRICE?.durationDays || 30
        newExpiryDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
      } catch (err) {
        console.error("[approve] Error calculating expiry:", err)
        return NextResponse.json(
          { error: "Failed to calculate Pro expiry" },
          { status: 500 }
        )
      }

      // Update payment first
      try {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedBy: session.userId,
            adminNote: adminNote ? String(adminNote).slice(0, 500) : null,
          },
        })
      } catch (err) {
        console.error("[approve] Failed to update payment:", err)
        return NextResponse.json(
          { error: "Failed to update payment status" },
          { status: 500 }
        )
      }

      // Then update user (separately so if this fails we know payment is still marked)
      try {
        // Build data dynamically to skip fields that might not exist yet
        const userUpdateData: Record<string, unknown> = {
          isPro: true,
          proGrantedAt: new Date(),
          proExpiresAt: newExpiryDate,
          proGrantedBy: session.userId,
        }

        // Only add proSource if the field exists (backwards compat)
        try {
          userUpdateData.proSource = "PAYMENT"
        } catch {}

        await prisma.user.update({
          where: { id: payment.userId },
          data: userUpdateData,
        })
      } catch (err: any) {
        console.error("[approve] Failed to update user Pro status:", err?.message)

        // If proSource enum failed, retry without it
        if (err?.message?.includes("proSource")) {
          try {
            await prisma.user.update({
              where: { id: payment.userId },
              data: {
                isPro: true,
                proGrantedAt: new Date(),
                proExpiresAt: newExpiryDate,
                proGrantedBy: session.userId,
              },
            })
          } catch (retryErr) {
            console.error("[approve] Retry also failed:", retryErr)
            // Roll back payment status
            await prisma.payment.update({
              where: { id: paymentId },
              data: { status: "PENDING", reviewedAt: null, reviewedBy: null },
            }).catch(() => {})

            return NextResponse.json(
              { error: "Failed to activate Pro for user" },
              { status: 500 }
            )
          }
        } else {
          // Roll back payment status
          await prisma.payment.update({
            where: { id: paymentId },
            data: { status: "PENDING", reviewedAt: null, reviewedBy: null },
          }).catch(() => {})

          return NextResponse.json(
            { error: "Failed to activate Pro: " + (err?.message || "unknown") },
            { status: 500 }
          )
        }
      }

      // Audit log (best effort)
      try {
        await (prisma as any).auditLog?.create({
          data: {
            action: "PAYMENT_APPROVED",
            actorId: session.userId,
            targetId: paymentId,
            metadata: JSON.stringify({
              userId: payment.userId,
              method: payment.method,
              amount: payment.amount,
              durationDays: PRO_PRICE?.durationDays || 30,
              newExpiryDate: newExpiryDate.toISOString(),
            }),
          },
        })
      } catch {}

      return NextResponse.json({
        message: "Payment approved and Pro activated",
        expiresAt: newExpiryDate,
      })
    }

    // ─── REJECT ─────────────────────────────────────────────
    if (action === "reject") {
      if (!rejectionReason || !String(rejectionReason).trim()) {
        return NextResponse.json(
          { error: "Rejection reason is required" },
          { status: 400 }
        )
      }

      try {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "REJECTED",
            reviewedAt: new Date(),
            reviewedBy: session.userId,
            rejectionReason: String(rejectionReason).slice(0, 500),
            adminNote: adminNote ? String(adminNote).slice(0, 500) : null,
          },
        })
      } catch (err) {
        console.error("[reject] Failed to update payment:", err)
        return NextResponse.json(
          { error: "Failed to reject payment" },
          { status: 500 }
        )
      }

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
  } catch (err: any) {
    console.error("PATCH /api/admin/payments/[id] fatal:", err)
    await logSystemError(err, {
      route: "/api/admin/payments/[id]",
      severity: "ERROR",
    })
    return NextResponse.json(
      { error: "Failed to process payment: " + (err?.message || "unknown error") },
      { status: 500 }
    )
  }
}