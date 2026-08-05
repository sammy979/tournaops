import { NextRequest, NextResponse } from "next/server";
import { dodo, DODO_CONFIG } from "@/lib/dodo";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isPro) {
      return NextResponse.json({ error: "Already Pro member" }, { status: 400 });
    }

    // Create subscription checkout
    const subscription = await dodo.subscriptions.create({
      product_id: DODO_CONFIG.productId,
      quantity: 1,
      payment_link: true,
      return_url: DODO_CONFIG.returnUrl,
      customer: {
        email: user.email,
        name: user.displayName || user.username,
      },
      billing: {
        city: "Kathmandu",
        country: "NP",
        state: "Bagmati",
        street: "N/A",
        zipcode: "44600",
      },
      metadata: {
        userId: user.id,
        source: "tournaops_upgrade",
      },
    });

    return NextResponse.json({ 
      url: subscription.payment_link,
      subscriptionId: subscription.subscription_id,
    });
  } catch (error: any) {
    console.error("Dodo checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Checkout failed" },
      { status: 500 }
    );
  }
}