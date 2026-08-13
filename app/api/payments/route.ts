import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { transactionReference, proofUrl, note, method } = body as Record<string, unknown>;

    if (!transactionReference || typeof transactionReference !== "string" || transactionReference.trim() === "") {
      return NextResponse.json({ error: "transactionReference is required" }, { status: 400 });
    }

    const VALID_METHODS = ["KHALTI", "ESEWA", "BANK"];
    if (!method || !VALID_METHODS.includes(String(method))) {
      return NextResponse.json({ error: "method must be KHALTI, ESEWA, or BANK" }, { status: 400 });
    }

    const existing = await prisma.payment.findFirst({
      where: { userId: user.id, status: "PENDING" },
    });
    if (existing) return NextResponse.json({ error: "You already have a pending payment" }, { status: 409 });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: 299,
        currency: "NPR",
        method: String(method) as "KHALTI" | "ESEWA" | "BANK",
        status: "PENDING",
        transactionReference: transactionReference.trim(),
        proofUrl: proofUrl && typeof proofUrl === "string" ? proofUrl.trim() : null,
        note: note && typeof note === "string" ? note.trim() : null,
      },
    });

    return NextResponse.json({ success: true, payment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/payments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[GET /api/payments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}