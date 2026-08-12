import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        isPro: true,
        proExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const latestPayment = await prisma.payment.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        method: true,
        amount: true,
        currency: true,
        planDuration: true,
        rejectionReason: true,
        approvedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      isPro: user.isPro,
      proExpiresAt: user.proExpiresAt,
      latestPayment,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
  }
}