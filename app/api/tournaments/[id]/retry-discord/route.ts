import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePro } from "@/lib/auth/rbac";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";
import {
  sendToDiscord,
  isValidWebhookUrl,
  sendEmbedBatches,
} from "@/lib/discord-queue";
import {
  broadcastSlotList,
  broadcastMilestone,
  broadcastStandingsImage,
} from "@/lib/discord-broadcaster";

// POST /api/tournaments/[id]/retry-discord
// Body: { type: "standings" | "slot-list" | "milestone" | "custom", payload?: any }
// Lets organizers manually retry failed Discord posts without re-running tournament operations

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const proCheck = await requirePro(session);
    if (!proCheck.authorized) return proCheck.errorResponse!;

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(
      id,
      session
    );
    if (!authorized) return errorResponse!;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const type = body?.type as string;
    if (!type) {
      return NextResponse.json(
        { error: "type is required: standings | slot-list | milestone | custom" },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { select: { id: true, name: true, tag: true, logo: true, seed: true } },
        matches: { orderBy: { matchNumber: "asc" } },
        stages: {
          include: { groups: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const webhookUrl = tournament.discord;
    if (!webhookUrl || !isValidWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        {
          error:
            "No Discord webhook configured for this tournament. Add it in Settings.",
        },
        { status: 400 }
      );
    }

    let result: { success: boolean; message: string };

    switch (type) {
      case "standings": {
        const ok = await broadcastStandingsImage(webhookUrl, tournament);
        result = {
          success: ok,
          message: ok
            ? "Standings image sent to Discord."
            : "Failed to send standings image. Check your webhook URL.",
        };
        break;
      }

      case "slot-list": {
        const ok = await broadcastSlotList(webhookUrl, tournament);
        result = {
          success: ok,
          message: ok
            ? "Slot list sent to Discord."
            : "Failed to send slot list. Check your webhook URL.",
        };
        break;
      }

      case "milestone": {
        const milestoneType = body?.milestoneType as
          | "REGISTRATION_OPEN"
          | "REGISTRATION_CLOSED"
          | "TOURNAMENT_STARTED"
          | "TOURNAMENT_COMPLETED";

        const validTypes = [
          "REGISTRATION_OPEN",
          "REGISTRATION_CLOSED",
          "TOURNAMENT_STARTED",
          "TOURNAMENT_COMPLETED",
        ];

        if (!milestoneType || !validTypes.includes(milestoneType)) {
          return NextResponse.json(
            {
              error: `milestoneType required for milestone retry. Valid: ${validTypes.join(", ")}`,
            },
            { status: 400 }
          );
        }

        const ok = await broadcastMilestone(webhookUrl, tournament, milestoneType);
        result = {
          success: ok,
          message: ok
            ? `Milestone "${milestoneType}" sent to Discord.`
            : "Failed to send milestone. Check your webhook URL.",
        };
        break;
      }

      case "custom": {
        if (!body?.payload || typeof body.payload !== "object") {
          return NextResponse.json(
            { error: "payload required for custom Discord message" },
            { status: 400 }
          );
        }

        const sendResult = await sendToDiscord(webhookUrl, body.payload);
        result = {
          success: sendResult.success,
          message: sendResult.success
            ? "Custom message sent to Discord."
            : `Failed: ${sendResult.error || `HTTP ${sendResult.status}`}`,
        };
        break;
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown type "${type}". Valid: standings, slot-list, milestone, custom`,
          },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (err) {
    logError(err, "RETRY_DISCORD");
    return NextResponse.json(
      { error: "Failed to send Discord message" },
      { status: 500 }
    );
  }
}