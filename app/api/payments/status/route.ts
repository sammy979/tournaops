import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PRO_FEATURES, FREE_FEATURES } from "@/lib/dodo";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.userId) {
      return NextResponse.json({ 
        error: "Not authenticated",
        isPro: false,
        features: FREE_FEATURES,
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        isPro: true,
        dodoSubscriptionId: true,
        dodoCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        isPro: false,
        features: FREE_FEATURES,
      }, { status: 404 });
    }

    const tournamentCount = await prisma.tournament.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      isPro: user.isPro,
      hasSubscription: !!user.dodoSubscriptionId,
      features: user.isPro ? PRO_FEATURES : FREE_FEATURES,
      usage: {
        tournaments: tournamentCount,
        limit: user.isPro ? PRO_FEATURES.maxTournaments : FREE_FEATURES.maxTournaments,
      },
    });
  } catch (error: any) {
    console.error("Payment status error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch status",
      isPro: false,
      features: FREE_FEATURES,
    }, { status: 500 });
  }
}