import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError, logger } from "@/lib/logger";
import { checkRateLimit, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";

const DISCORD_RATE = { windowMs: 10000, maxRequests: 3 };

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rl = checkRateLimit("discord_send:" + session.userId + ":" + ip, DISCORD_RATE);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Sending too fast. Please wait a moment." },
        { status: 429, headers: getRateLimitHeaders(rl, DISCORD_RATE) }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { tournamentId, payload } = body;

    if (!tournamentId || typeof tournamentId !== "string") {
      return NextResponse.json({ error: "Tournament ID required" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Discord payload required" }, { status: 400 });
    }

    const { authorized, errorResponse } = await verifyTournamentOwnership(
      tournamentId,
      session
    );
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { discord: true, name: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const webhookUrl = tournament.discord;

    if (!webhookUrl || (!webhookUrl.startsWith("https://discord.com/api/webhooks/") && !webhookUrl.startsWith("https://discordapp.com/api/webhooks/"))) {
      return NextResponse.json(
        { error: "No Discord webhook configured for this tournament. Add it in tournament settings." },
        { status: 400 }
      );
    }

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (discordRes.ok || discordRes.status === 204) {
      logger.info("Discord message sent", "DISCORD_SEND", {
        tournamentId,
        tournamentName: tournament.name,
        userId: session.userId,
      });
      return NextResponse.json({ success: true });
    }

    logger.warn("Discord send failed", "DISCORD_SEND", {
      status: discordRes.status,
      tournamentId,
    });

    return NextResponse.json(
      { error: "Discord returned an error (" + discordRes.status + "). Check your webhook URL." },
      { status: 502 }
    );
  } catch (err) {
    logError(err, "DISCORD_SEND");
    return NextResponse.json({ error: "Failed to send Discord message" }, { status: 500 });
  }
}
