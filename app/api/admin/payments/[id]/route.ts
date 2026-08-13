import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAdmin(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Payment ID required" }, { status: 400 });

    const payment = await prisma.payment.findUnique({
      where: { id: id.trim() },
      include: {
        user: { select: { id: true, displayName: true, email: true, isPro: true, proExpiresAt: true } },
      },
    });

    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[GET /api/admin/payments/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAdmin(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Payment ID required" }, { status: 400 });

    const paymentId = id.trim();

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { action, adminNote } = body as Record<string, unknown>;

    if (!action || !["APPROVE", "REJECT"].includes(String(action))) {
      return NextResponse.json({ error: "action must be APPROVE or REJECT" }, { status: 400 });
    }

    const existing = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, status: true, userId: true },
    });

    if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (existing.status !== "PENDING") return NextResponse.json({ error: "Payment already " + existing.status }, { status: 409 });

    const now = new Date();
    const note = adminNote && typeof adminNote === "string" ? adminNote.trim() : null;

    if (String(action) === "APPROVE") {
      const proExpiresAt = new Date(now);
      proExpiresAt.setDate(proExpiresAt.getDate() + 30);

      const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: "APPROVED", reviewedAt: now, reviewedBy: user.id, adminNote: note },
        }),
        prisma.user.update({
          where: { id: existing.userId },
          data: { isPro: true, proGrantedAt: now, proGrantedBy: user.id, proExpiresAt },
        }),
      ]);

      return NextResponse.json({ success: true, action: "APPROVED", payment: updatedPayment });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", reviewedAt: now, reviewedBy: user.id, adminNote: note },
    });

    return NextResponse.json({ success: true, action: "REJECTED", payment: updatedPayment });
  } catch (error) {
    console.error("[PATCH /api/admin/payments/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}