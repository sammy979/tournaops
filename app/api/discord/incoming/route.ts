import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.TOURNAOPS_API_SECRET;

    if (!expectedSecret) return NextResponse.json({ error: "Not configured" }, { status: 500 });
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (authHeader.substring(7) !== expectedSecret) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const data = await req.json();
    if (!data.parseResult?.slots) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    // Check duplicate
    const existing = await prisma.discordImport.findUnique({
      where: { discordMessageId: data.discordMessageId },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        importId: existing.id,
      });
    }

    const imp = await prisma.discordImport.create({
      data: {
        discordMessageId: data.discordMessageId,
        discordChannelId: data.discordChannelId,
        discordChannelName: data.discordChannelName,
        discordGuildId: data.discordGuildId,
        discordGuildName: data.discordGuildName,
        discordUserId: data.discordUserId,
        discordUsername: data.discordUsername,
        discordUserAvatar: data.discordUserAvatar,
        messageContent: data.messageContent,
        parseResult: data.parseResult,
        status: "pending",
      },
    });

    console.log(`Discord import saved [${imp.id}]: ${data.discordGuildName}/#${data.discordChannelName} - ${data.parseResult.totalDetected} slots`);

    return NextResponse.json({
      success: true,
      importId: imp.id,
      slotsDetected: data.parseResult.totalDetected,
    });
  } catch (err: any) {
    console.error("Discord API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const count = await prisma.discordImport.count({ where: { status: "pending" } });
  return NextResponse.json({
    status: "TournaOps Discord API",
    version: "2.0-postgres",
    pendingImports: count,
  });
}