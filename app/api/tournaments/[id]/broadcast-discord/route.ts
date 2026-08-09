import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePro } from "@/lib/auth/rbac";
import { verifyTournamentOwnership } from "@/lib/authorization";
import {
  broadcastSlotList,
  broadcastStandingsImage,
  broadcastMilestone,
} from "@/lib/discord-broadcaster";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const proCheck = await requirePro(session);
    if (!proCheck.authorized) return proCheck.errorResponse!;

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const { type } = await req.json();

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, matches: true, stages: { include: { groups: true }, orderBy: { order: "asc" } } },
    });
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const webhookUrl = tournament.discord;
    if (!webhookUrl) return NextResponse.json({ error: "No Discord webhook configured" }, { status: 400 });
    if (!webhookUrl.startsWith("https://discord.com/api/webhooks/") &&
        !webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
    }

    let success = false;
    let message = "";

    switch (type) {
      case "slot_list":
        success = await broadcastSlotList(webhookUrl, tournament);
        message = success ? "Slot list posted to Discord (" + tournament.teams.length + " teams)" : "Failed";
        break;
      case "standings_image":
        success = await broadcastStandingsImage(webhookUrl, tournament);
        message = success ? "Standings visualization posted to Discord" : "Failed";
        break;
      case "registration_open":
        success = await broadcastMilestone(webhookUrl, tournament, "REGISTRATION_OPEN");
        message = success ? "Registration open announcement posted" : "Failed";
        break;
      case "tournament_started":
        success = await broadcastMilestone(webhookUrl, tournament, "TOURNAMENT_STARTED");
        message = success ? "Tournament LIVE announcement posted" : "Failed";
        break;
      default:
        return NextResponse.json({ error: "Unknown broadcast type" }, { status: 400 });
    }

    return NextResponse.json({ success, message });
  } catch (err: any) {
    console.error("[BROADCAST_DISCORD]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}