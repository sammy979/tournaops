import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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
    if (match.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ match });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

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
      title: "ðŸ† " + (match.name || "Match " + match.matchNumber) + " Results",
      description: "**" + tournament.name + "**" + (match.map ? " â€¢ " + match.map : "") + (titleSponsor ? "\nâ­ Presented by **" + titleSponsor.name + "**" : ""),
      color: 0xf59e0b,
      fields: [],
      footer: { text: "TournaOps.com" },
      timestamp: new Date().toISOString(),
    };

    if (winnerTeam) {
      embed.fields.push({
        name: "ðŸ¥‡ WWCD",
        value: "**" + winnerTeam.name + "**" + (winner.kills ? " Â· " + winner.kills + " kills" : ""),
        inline: true,
      });
    }

    if (topFraggerTeam && topFragger.kills > 0) {
      embed.fields.push({
        name: "ðŸ’€ Top Fragger",
        value: "**" + topFraggerTeam.name + "** Â· " + topFragger.kills + " kills",
        inline: true,
      });
    }

    if (top5.length > 0) {
      const leaderboard = top5.map((r: any) => {
        const t = teamMap.get(r.teamId) as any;
        if (!t) return null;
        const medal = r.placement === 1 ? "ðŸ¥‡" : r.placement === 2 ? "ðŸ¥ˆ" : r.placement === 3 ? "ðŸ¥‰" : "#" + r.placement;
        return medal + " " + t.name + " Â· " + (r.kills || 0) + " kills";
      }).filter(Boolean).join("\n");

      if (leaderboard) {
        embed.fields.push({
          name: "ðŸ“Š Top " + top5.length,
          value: leaderboard,
          inline: false,
        });
      }
    }

    if (otherSponsors.length > 0) {
      embed.fields.push({
        name: "ðŸ¤ Sponsors",
        value: otherSponsors.slice(0, 8).map((s: any) => s.name).join(" â€¢ "),
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates: any = {};
    if ("results" in body) updates.results = body.results;
    if ("status" in body) updates.status = body.status;
    if ("map" in body) updates.map = body.map;
    if ("notes" in body) updates.notes = body.notes;
    if ("startTime" in body) updates.startTime = new Date(body.startTime);
    if ("endTime" in body) updates.endTime = new Date(body.endTime);

    const match = await prisma.match.update({
      where: { id },
      data: updates,
    });

    // Auto-post to Discord if match just completed and webhook is set
    const wasNotCompleted = existing.status !== "completed";
    const nowCompleted = updates.status === "completed" || (updates.results && !updates.status && existing.status === "completed");
    const shouldPost = wasNotCompleted && (updates.status === "completed" || (updates.results && Array.isArray(updates.results) && updates.results.length > 0));

    if (shouldPost && existing.tournament.discord) {
      const webhookUrl = existing.tournament.discord;
      if (webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
        const fullTournament = await prisma.tournament.findUnique({
          where: { id: existing.tournamentId },
          include: { teams: true },
        });
        if (fullTournament) {
          // Fire and forget â€” don't block response
          postToDiscord(webhookUrl, { ...match, name: existing.name, matchNumber: existing.matchNumber }, fullTournament).catch(() => {});
        }
      }
    }

    return NextResponse.json({ match });
  } catch (error: any) {
    console.error("Match update error:", error);
    return NextResponse.json({
      error: error?.message || "Failed to update",
    }, { status: 500 });
  }
}

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
    if (existing.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
