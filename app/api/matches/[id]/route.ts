import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";

// ============================================================
// SCORING ENGINE — inline to avoid import issues
// Uses tournament scoringRule as single source of truth
// ============================================================

function getPlacementPoints(placement: number, scoringRule: any): number {
  if (!scoringRule) return 0;
  // Object format: { 1: 15, 2: 12, ... }
  if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object" && !Array.isArray(scoringRule.placementPoints)) {
    return Number(scoringRule.placementPoints[placement]) || 0;
  }
  // Array format: [15, 12, 10, ...]
  if (Array.isArray(scoringRule.placementPoints)) {
    return Number(scoringRule.placementPoints[placement - 1]) || 0;
  }
  // placementTable format (lib/scoring-engine.ts)
  if (scoringRule.placementTable && typeof scoringRule.placementTable === "object") {
    return Number(scoringRule.placementTable[placement]) || 0;
  }
  return 0;
}

function calculateResultPoints(result: any, scoringRule: any): any {
  if (!scoringRule || !result) return result;
  const placement = Number(result.placement) || 0;
  const kills = Number(result.kills) || 0;
  const killPoints = Number(scoringRule.killPoints) || 1;
  const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
  const isWWCD = placement === 1 || result.wwcd === true;

  const placementPoints = getPlacementPoints(placement, scoringRule);
  const killPointsTotal = kills * killPoints;
  const bonus = isWWCD ? wwcdBonus : 0;
  const totalPoints = placementPoints + killPointsTotal + bonus;

  return {
    ...result,
    placement,
    kills,
    placementPoints,
    killPoints: killPointsTotal,
    totalPoints,
    wwcd: isWWCD,
  };
}

// ============================================================
// DISCORD AUTO-POST
// ============================================================

async function postToDiscord(webhookUrl: string, match: any, tournament: any) {
  try {
    const results = Array.isArray(match.results) ? match.results : [];
    const teams = tournament.teams || [];
    const teamMap = new Map(teams.map((t: any) => [t.id, t]));
    const branding = tournament.brandingData || {};
    const sponsors: any[] = Array.isArray(branding.sponsors) ? branding.sponsors : [];
    const titleSponsor = sponsors.find((s: any) => s.tier === "title");
    const otherSponsors = sponsors.filter((s: any) => s.tier !== "title");
    const sorted = [...results].sort((a: any, b: any) => (a.placement || 999) - (b.placement || 999));
    const top5 = sorted.slice(0, 5);
    const winner = sorted.find((r: any) => r.placement === 1);
    const winnerTeam = winner ? teamMap.get(winner.teamId) as any : null;
    const topFragger = [...results].sort((a: any, b: any) => (b.kills || 0) - (a.kills || 0))[0];
    const topFraggerTeam = topFragger ? teamMap.get(topFragger.teamId) as any : null;

    const embed: any = {
      title: "\uD83C\uDFC6 " + (match.name || "Match " + match.matchNumber) + " Results",
      description: "**" + tournament.name + "**" +
        (match.map ? " \u2022 " + match.map : "") +
        (titleSponsor ? "\n\u2B50 Presented by **" + titleSponsor.name + "**" : ""),
      color: 0xf59e0b,
      fields: [] as any[],
      footer: { text: "TournaOps.com" },
      timestamp: new Date().toISOString(),
    };

    if (winnerTeam) {
      embed.fields.push({
        name: "\uD83E\uDD47 WWCD",
        value: "**" + winnerTeam.name + "**" + (winner.kills ? " \u00B7 " + winner.kills + " kills" : "") + " \u00B7 " + (winner.totalPoints || 0) + " pts",
        inline: true,
      });
    }

    if (topFraggerTeam && topFragger?.kills > 0) {
      embed.fields.push({
        name: "\uD83D\uDC80 Top Fragger",
        value: "**" + topFraggerTeam.name + "** \u00B7 " + topFragger.kills + " kills",
        inline: true,
      });
    }

    if (top5.length > 0) {
      const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
      const leaderboard = top5.map((r: any) => {
        const t = teamMap.get(r.teamId) as any;
        if (!t) return null;
        const prefix = r.placement <= 3 ? medals[r.placement - 1] : "#" + r.placement;
        return prefix + " **" + t.name + "** \u00B7 " + (r.kills || 0) + "K \u00B7 " + (r.totalPoints || 0) + "pts";
      }).filter(Boolean).join("\n");

      if (leaderboard) {
        embed.fields.push({ name: "\uD83D\uDCCA Top " + top5.length, value: leaderboard, inline: false });
      }
    }

    if (otherSponsors.length > 0) {
      embed.fields.push({
        name: "\uD83E\uDD1D Sponsors",
        value: otherSponsors.slice(0, 8).map((s: any) => s.name).join(" \u00B7 "),
        inline: false,
      });
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.warn("[DISCORD_AUTOPOST] Failed:", e);
    return false;
  }
}

// ============================================================
// GET match
// ============================================================

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });

    if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (match.tournament.userId !== session.userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ match });
  } catch (err) {
    logError(err, "MATCH_GET");
    return NextResponse.json({ error: "Failed to load match" }, { status: 500 });
  }
}

// ============================================================
// PATCH match — update results with auto-scoring
// ============================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: {
          include: { teams: true },
        },
      },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.tournament.userId !== session.userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = {};

    // Auto-calculate points when results are submitted
    if ("results" in body && Array.isArray(body.results)) {
      const scoringRule = existing.tournament.scoringRule as any;
      const teams = existing.tournament.teams || [];
      const teamMap = new Map(teams.map((t: any) => [t.id, t]));

      // Validate: placements must be positive
      const validResults = body.results.filter((r: any) =>
        r.teamId && Number(r.placement) > 0
      );

      // Check for duplicate placements (warn but don't block)
      const placements = validResults.map((r: any) => Number(r.placement));
      const uniquePlacements = new Set(placements);
      const hasDuplicates = uniquePlacements.size !== placements.length;

      // Check all teams belong to this tournament
      const invalidTeams = validResults.filter((r: any) => !teamMap.has(r.teamId));
      if (invalidTeams.length > 0) {
        return NextResponse.json({
          error: "Some teams do not belong to this tournament",
          invalidTeams: invalidTeams.map((r: any) => r.teamId),
        }, { status: 400 });
      }

      // Auto-calculate points using tournament scoring rule
      updates.results = validResults.map((r: any) => {
        const team = teamMap.get(r.teamId) as any;
        const calculated = calculateResultPoints(r, scoringRule);
        return {
          ...calculated,
          teamName: team?.name || r.teamName || r.teamId,
          teamTag: team?.tag || null,
          teamLogo: team?.logo || null,
        };
      });

      // Sort by placement
      updates.results.sort((a: any, b: any) => (a.placement || 999) - (b.placement || 999));

      if (hasDuplicates) {
        console.warn("[MATCH_PATCH] Duplicate placements detected in match", id);
      }
    }

    if ("status" in body) updates.status = body.status;
    if ("map" in body) updates.map = body.map;
    if ("notes" in body) updates.notes = body.notes;
    if ("startTime" in body && body.startTime) updates.startTime = new Date(body.startTime);
    if ("endTime" in body && body.endTime) updates.endTime = new Date(body.endTime);
    if ("screenshotUrl" in body) updates.screenshotUrl = body.screenshotUrl;

    // Auto-set status to completed when results submitted
    if (updates.results && !updates.status) {
      updates.status = "completed";
    }

    const match = await prisma.match.update({
      where: { id },
      data: updates,
    });

    // Auto-post to Discord if match completed
    const wasNotCompleted = existing.status !== "completed";
    const nowCompleted = updates.status === "completed" || match.status === "completed";

    if (wasNotCompleted && nowCompleted && existing.tournament.discord) {
      const webhookUrl = existing.tournament.discord;
      if (webhookUrl.startsWith("https://discord.com/api/webhooks/") || webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
        postToDiscord(
          webhookUrl,
          { ...match, name: existing.name, matchNumber: existing.matchNumber, map: match.map || existing.map },
          existing.tournament
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      match,
      pointsCalculated: !!updates.results,
    });
  } catch (err) {
    logError(err, "MATCH_PATCH");
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

// ============================================================
// DELETE match
// ============================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });

    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.tournament.userId !== session.userId && !session.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "MATCH_DELETE");
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}