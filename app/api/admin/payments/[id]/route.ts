import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: id.trim() },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            isPro: true,
            proExpiresAt: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("[GET /api/admin/payments/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    const paymentId = id.trim();

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

    const { action, adminNote } = body as Record<string, unknown>;

    if (!action || !["APPROVE", "REJECT"].includes(String(action))) {
      return NextResponse.json(
        { error: "action must be APPROVE or REJECT" },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, status: true, userId: true },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (existingPayment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Payment is already " + existingPayment.status },
        { status: 409 }
      );
    }

    const now = new Date();

    if (String(action) === "APPROVE") {
      const PRO_DURATION_DAYS = 30;
      const proExpiresAt = new Date(now);
      proExpiresAt.setDate(proExpiresAt.getDate() + PRO_DURATION_DAYS);

      const [updatedPayment] = await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "APPROVED",
            reviewedAt: now,
            reviewedBy: session.user.id,
            adminNote:
              adminNote && typeof adminNote === "string"
                ? adminNote.trim()
                : null,
          },
        }),
        prisma.user.update({
          where: { id: existingPayment.userId },
          data: {
            isPro: true,
            proGrantedAt: now,
            proGrantedBy: session.user.id,
            proExpiresAt: proExpiresAt,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: "APPROVED",
        payment: updatedPayment,
        proExpiresAt: proExpiresAt.toISOString(),
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REJECTED",
        reviewedAt: now,
        reviewedBy: session.user.id,
        adminNote:
          adminNote && typeof adminNote === "string"
            ? adminNote.trim()
            : null,
      },
    });

    return NextResponse.json({
      success: true,
      action: "REJECTED",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("[PATCH /api/admin/payments/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}