import { NextRequest, NextResponse } from "next/server";

// In-memory store (per-instance). For production use Supabase/Redis.
// This is intentionally simple — resets on Vercel cold start (usually fine for demo)
const pendingImports: Map<string, any> = (globalThis as any).__pendingImports || new Map();
(globalThis as any).__pendingImports = pendingImports;

const MAX_STORED = 100;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function cleanExpired() {
  const now = Date.now();
  for (const [key, value] of pendingImports.entries()) {
    if (now - new Date(value.receivedAt).getTime() > TTL_MS) {
      pendingImports.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.TOURNAOPS_API_SECRET;

    if (!expectedSecret) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authHeader.substring(7) !== expectedSecret) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();

    if (!data.parseResult?.slots) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    cleanExpired();

    // Trim if too many
    if (pendingImports.size >= MAX_STORED) {
      const oldest = [...pendingImports.entries()].sort((a, b) =>
        new Date(a[1].receivedAt).getTime() - new Date(b[1].receivedAt).getTime()
      )[0];
      if (oldest) pendingImports.delete(oldest[0]);
    }

    const importId = `imp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const record = {
      id: importId,
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
      receivedAt: new Date().toISOString(),
      status: "pending",
    };

    pendingImports.set(importId, record);

    console.log(`Discord import queued [${importId}]: ${data.discordGuildName}/#${data.discordChannelName} — ${data.parseResult.totalDetected} slots`);

    return NextResponse.json({
      success: true,
      importId,
      slotsDetected: data.parseResult.totalDetected,
      pendingCount: pendingImports.size,
    });

  } catch (err: any) {
    console.error("API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const stats = url.searchParams.get("stats");

  cleanExpired();

  if (stats === "true") {
    return NextResponse.json({
      status: "TournaOps Discord API",
      version: "1.0",
      pendingImports: pendingImports.size,
    });
  }

  return NextResponse.json({
    status: "TournaOps Discord API endpoint",
    version: "1.0",
  });
}