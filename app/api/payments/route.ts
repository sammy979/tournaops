// app/api/payments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payments = await prisma.payment.findMany({
      where: { userId: session.userId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true, amount: true, currency: true, method: true,
        transactionReference: true, status: true, submittedAt: true,
        reviewedAt: true, rejectionReason: true, adminNote: true,
      },
    })

    return NextResponse.json({ payments })
  } catch (err) {
    await logSystemError(err, { route: "/api/payments", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { method, amount, transactionReference, proofUrl, note } = body

    if (!method || !amount || !transactionReference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["ESEWA", "KHALTI", "BANK"].includes(method)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 })
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const sanitizedRef = String(transactionReference).trim().slice(0, 100)
    if (!sanitizedRef) {
      return NextResponse.json({ error: "Invalid transaction reference" }, { status: 400 })
    }

    const existing = await prisma.payment.findFirst({
      where: { transactionReference: sanitizedRef, userId: session.userId },
    })
    if (existing) {
      return NextResponse.json(
        { error: "This transaction reference has already been submitted" },
        { status: 409 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        amount: Number(amount),
        currency: "NPR",
        method,
        transactionReference: sanitizedRef,
        proofUrl: proofUrl || null,
        note: note ? String(note).slice(0, 500) : null,
        status: "PENDING",
        submittedAt: new Date(),
      },
    })

    try {
      await (prisma as any).auditLog?.create({
        data: {
          action: "PAYMENT_SUBMITTED",
          actorId: session.userId,
          targetId: payment.id,
          metadata: JSON.stringify({ method, amount, transactionReference: sanitizedRef }),
        },
      })
    } catch {}

    return NextResponse.json({ payment, message: "Payment submitted successfully" }, { status: 201 })
  } catch (err) {
    await logSystemError(err, { route: "/api/payments", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 })
  }
}