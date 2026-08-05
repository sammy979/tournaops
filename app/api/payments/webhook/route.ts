import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Webhook } from "standardwebhooks";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headers = {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
    };

    // Verify webhook signature
    const wh = new Webhook(process.env.DODO_WEBHOOK_SECRET!);
    let event: any;
    
    try {
      event = wh.verify(body, headers);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log("Dodo webhook received:", event.type);

    const data = event.data;
    const userId = data?.metadata?.userId;

    if (!userId) {
      console.warn("No userId in webhook metadata");
      return NextResponse.json({ received: true });
    }

    switch (event.type) {
      case "subscription.active":
      case "subscription.created":
      case "subscription.renewed":
      case "payment.succeeded":
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            dodoCustomerId: data.customer?.customer_id || null,
            dodoSubscriptionId: data.subscription_id || null,
          },
        });
        console.log(`User ${userId} upgraded to Pro`);
        break;

      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.failed":
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: false,
          },
        });
        console.log(`User ${userId} downgraded to Free`);
        break;

      case "payment.failed":
        console.warn(`Payment failed for user ${userId}`);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}