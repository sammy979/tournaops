import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify super admin — server-side, not client-trusted
    const authError = await requireSuperAdmin(req);
    if (authError) return authError;

    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentId = params.id;
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    const body = await req.json();
    const { action, rejectionReason, adminNote } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be approve or reject" },
        { status: 400 }
      );
    }

    if (
      action === "reject" &&
      (!rejectionReason || String(rejectionReason).trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Fetch payment — never trust client-supplied userId
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isPro: true,
            proExpiresAt: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Prevent double-processing
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        {
          error: `Payment has already been ${payment.status.toLowerCase()}. Cannot process again.`,
        },
        { status: 409 }
      );
    }

    const now = new Date();
    const reviewerId = session.userId;

    if (action === "approve") {
      // Calculate pro expiry — 1 month from now (Rs 299/month)
      const proExpiresAt = new Date(now);
      proExpiresAt.setMonth(proExpiresAt.getMonth() + 1);

      // Atomic transaction — approve payment and upgrade correct user only
      await prisma.$transaction(async (tx) => {
        // Update payment to APPROVED
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "APPROVED",
            reviewedAt: now,
            reviewedBy: reviewerId,
            adminNote: adminNote ? String(adminNote).trim() : null,
          },
        });

        // Upgrade ONLY the user who owns this payment
        // userId comes from DB payment record — never from client
        await tx.user.update({
          where: { id: payment.userId },
          data: {
            isPro: true,
            proGrantedAt: now,
            proExpiresAt,
            proGrantedBy: reviewerId,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: "Payment approved and user upgraded to Pro",
        payment: { id: paymentId, status: "APPROVED" },
        user: {
          id: payment.userId,
          isPro: true,
          proExpiresAt,
        },
      });
    }

    // action === "reject"
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REJECTED",
        reviewedAt: now,
        reviewedBy: reviewerId,
        rejectionReason: String(rejectionReason).trim(),
        adminNote: adminNote ? String(adminNote).trim() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment rejected",
      payment: {
        id: paymentId,
        status: "REJECTED",
        rejectionReason: String(rejectionReason).trim(),
      },
    });
  } catch (error) {
    console.error("[admin/payments/id] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to process payment action" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authError = await requireSuperAdmin(req);
    if (authError) return authError;

    const paymentId = params.id;
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            isPro: true,
            proExpiresAt: true,
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
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[admin/payments/id] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}