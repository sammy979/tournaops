import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.TOURNAOPS_API_SECRET;

    if (!expectedSecret) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    if (token !== expectedSecret) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.parseResult || !data.parseResult.slots) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log("Discord bot slot list received:", {
      guild: data.discordGuildName,
      channel: data.discordChannelName,
      slots: data.parseResult.totalDetected,
    });

    return NextResponse.json({
      success: true,
      messageId: data.discordMessageId,
      slotsDetected: data.parseResult.totalDetected,
    });

  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "TournaOps Discord API endpoint", version: "1.0" });
}