import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Request body must be a JSON object" },
        { status: 400 }
      );
    }

    const {
      transactionReference,
      proofUrl,
      note,
      method,
    } = body as Record<string, unknown>;

    if (!transactionReference || typeof transactionReference !== "string" || transactionReference.trim() === "") {
      return NextResponse.json(
        { error: "transactionReference is required" },
        { status: 400 }
      );
    }

    const VALID_METHODS = ["KHALTI", "ESEWA", "BANK"];
    if (!method || !VALID_METHODS.includes(String(method))) {
      return NextResponse.json(
        { error: "method must be one of: KHALTI, ESEWA, BANK" },
        { status: 400 }
      );
    }

    const LOCKED_AMOUNT = 299;

    const existingPending = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "You already have a pending payment under review" },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true, proExpiresAt: true },
    });

    if (
      user?.isPro &&
      user.proExpiresAt &&
      user.proExpiresAt > new Date()
    ) {
      return NextResponse.json(
        { error: "You already have an active Pro subscription" },
        { status: 409 }
      );
    }

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: LOCKED_AMOUNT,
        currency: "NPR",
        method: String(method) as "KHALTI" | "ESEWA" | "BANK",
        status: "PENDING",
        transactionReference: transactionReference.trim(),
        proofUrl: proofUrl && typeof proofUrl === "string" ? proofUrl.trim() : null,
        note: note && typeof note === "string" ? note.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          transactionReference: payment.transactionReference,
          createdAt: payment.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/payments] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        amount: true,
        currency: true,
        method: true,
        status: true,
        transactionReference: true,
        proofUrl: true,
        note: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[GET /api/payments] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}