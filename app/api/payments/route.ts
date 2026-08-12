import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PaymentSchema = z.object({
  method: z.enum(["ESEWA", "KHALTI", "BANK"]),
  amount: z.number().positive(),
  currency: z.string().default("NPR"),
  transactionReference: z.string().min(1).max(200),
  proofUrl: z.string().optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = PaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { method, amount, currency, transactionReference, proofUrl, note } = parsed.data;

    // Validate amount matches NPR pricing — Rs 299/month only
    if (Math.abs(amount - 299) > 1) {
      return NextResponse.json(
        { error: "Invalid amount. Expected Rs 299 for monthly Pro plan." },
        { status: 400 }
      );
    }

    // Check for duplicate transaction reference
    const existing = await prisma.payment.findFirst({
      where: { transactionReference },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Transaction reference already submitted." },
        { status: 409 }
      );
    }

    // Check for already pending payment from same user
    const pendingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.userId,
        status: "PENDING",
      },
    });
    if (pendingPayment) {
      return NextResponse.json(
        { error: "You already have a pending payment awaiting approval." },
        { status: 409 }
      );
    }

    // Check if user is already Pro
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isPro: true, proExpiresAt: true },
    });

    if (
      user?.isPro &&
      user.proExpiresAt &&
      new Date(user.proExpiresAt) > new Date()
    ) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription." },
        { status: 409 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.userId,
        method,
        amount,
        currency,
        transactionReference,
        proofUrl: proofUrl || null,
        note: note || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      status: payment.status,
      message: "Payment submitted successfully. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("[payments] POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit payment" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.userId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        method: true,
        amount: true,
        currency: true,
        status: true,
        transactionReference: true,
        rejectionReason: true,
        reviewedAt: true,
        submittedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[payments] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}