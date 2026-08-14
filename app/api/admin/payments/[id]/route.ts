import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.isAdmin && user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
    });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    return NextResponse.json({ payment });
  } catch (error) {
    console.error("GET /api/admin/payments/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch payment" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.isAdmin && user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    const { status, adminNote, rejectionReason } = body;
    const VALID = ["PENDING", "APPROVED", "REJECTED"];
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: user.id,
        ...(adminNote !== undefined && { adminNote }),
        ...(rejectionReason !== undefined && { rejectionReason }),
        updatedAt: new Date(),
      },
    });
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPro: true,
          proGrantedAt: new Date(),
          proGrantedBy: user.id,
          proExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
    if (status === "REJECTED") {
      await prisma.user.update({
        where: { id: payment.userId },
        data: { isPro: false },
      });
    }
    return NextResponse.json({ payment: updated });
  } catch (error) {
    console.error("PATCH /api/admin/payments/[id]:", error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}