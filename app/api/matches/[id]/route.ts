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


// ============================================================
// DISCORD OVERALL STANDINGS POST
// ============================================================

async function postStandingsToDiscord(webhookUrl: string, tournament: any) {
  try {
    const teams = tournament.teams || [];
    const matches = tournament.matches || [];
    const branding = tournament.brandingData || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const colorInt = parseInt(primaryColor.replace("#", ""), 16) || 0xf59e0b;
    const publicUrl = "https://www.tournaops.com/tournaments/" + tournament.slug;
    const standingsUrl = publicUrl + "/results";

    // Calculate overall standings from all completed matches
    const scoringRule = tournament.scoringRule || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
    let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(scoringRule.placementPoints)) {
      placementPoints = scoringRule.placementPoints;
    } else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }

    const teamStats = new Map<string, any>();
    for (const team of teams) {
      teamStats.set(team.id, {
        id: team.id,
        name: team.name,
        tag: team.tag,
        points: 0,
        kills: 0,
        wwcds: 0,
        matches: 0,
      });
    }

    let totalKills = 0;
    let totalMatches = 0;

    for (const match of matches) {
      if (match.status !== "completed" || !Array.isArray(match.results)) continue;
      totalMatches++;
      for (const r of match.results) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const placement = Number(r.placement) || 16;
        const isWWCD = placement === 1 || r.wwcd === true;
        const pIdx = Math.max(0, placement - 1);
        const pPts = placementPoints[pIdx] || 0;
        const kPts = kills * killPoints;
        const bonus = isWWCD ? wwcdBonus : 0;
        s.points += pPts + kPts + bonus;
        s.kills += kills;
        if (isWWCD) s.wwcds++;
        s.matches++;
        totalKills += kills;
      }
    }

    const standings = Array.from(teamStats.values())
      .filter((s: any) => s.matches > 0)
      .sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wwcds !== a.wwcds) return b.wwcds - a.wwcds;
        return b.kills - a.kills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    if (standings.length === 0) return true;

    const top10 = standings.slice(0, 10);
    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

    const leaderboard = top10.map((s: any) => {
      const prefix = s.rank <= 3 ? medals[s.rank - 1] : "`#" + String(s.rank).padStart(2, " ") + "`";
      const tag = s.tag ? "[" + s.tag + "] " : "";
      const pts = String(s.points).padStart(3, " ");
      const kills = String(s.kills).padStart(3, " ");
      const wwcds = String(s.wwcds).padStart(2, " ");
      return prefix + " **" + tag + s.name + "** \u2014 `" + pts + " pts` \u2022 `" + kills + "K` \u2022 `" + wwcds + " W`";
    }).join("\n");

    const embed: any = {
      author: {
        name: tournament.name,
        url: publicUrl,
        icon_url: branding.orgLogo || undefined,
      },
      title: "\uD83D\uDCCA OVERALL STANDINGS \u2014 After " + totalMatches + " Match" + (totalMatches !== 1 ? "es" : ""),
      url: standingsUrl,
      description: "\uD83D\uDC65 **" + teams.length + " Teams** \u2022 \uD83D\uDCA5 **" + totalKills + " Total Kills** \u2022 \uD83C\uDFAE **" + totalMatches + "/" + matches.length + " Matches**",
      color: colorInt,
      fields: [
        {
          name: "\uD83C\uDFC6 TOP 10",
          value: leaderboard,
          inline: false,
        },
        {
          name: "\uD83D\uDD17 LIVE STANDINGS",
          value: "\uD83D\uDCCA [View Full Standings](" + standingsUrl + ") \u2022 \uD83C\uDFC6 [Tournament Page](" + publicUrl + ")",
          inline: false,
        },
      ],
      footer: {
        text: "TournaOps \u2022 Auto-updated after every match",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    };

    if (tournament.bannerImage) {
      embed.thumbnail = { url: tournament.bannerImage };
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.warn("[DISCORD_STANDINGS] Failed:", e);
    return false;
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
    const primaryColor = branding.primaryColor || "#f59e0b";
    const colorInt = parseInt(primaryColor.replace("#", ""), 16) || 0xf59e0b;

    const sorted = [...results].sort((a: any, b: any) => (a.placement || 999) - (b.placement || 999));
    const top5 = sorted.slice(0, 5);
    const winner = sorted.find((r: any) => r.placement === 1);
    const winnerTeam = winner ? teamMap.get(winner.teamId) as any : null;
    const topFragger = [...results].sort((a: any, b: any) => (b.kills || 0) - (a.kills || 0))[0];
    const topFraggerTeam = topFragger ? teamMap.get(topFragger.teamId) as any : null;
    const totalKills = results.reduce((s: number, r: any) => s + (Number(r.kills) || 0), 0);
    const publicUrl = "https://www.tournaops.com/tournaments/" + tournament.slug;
    const standingsUrl = publicUrl + "/results";

    // Build description with tournament + sponsor
    const descParts: string[] = [];
    if (match.map) descParts.push("\uD83D\uDDFA\uFE0F **Map:** " + match.map);
    if (titleSponsor) descParts.push("\u2B50 **Title Sponsor:** " + titleSponsor.name);
    descParts.push("\uD83D\uDC65 **" + teams.length + " Teams** \u2022 \uD83D\uDCA5 **" + totalKills + " Total Kills**");

    const embed: any = {
      author: {
        name: tournament.name,
        url: publicUrl,
        icon_url: branding.orgLogo || undefined,
      },
      title: "\uD83C\uDFC6 " + (match.name || "Match " + match.matchNumber) + " \u2014 Results",
      url: standingsUrl,
      description: descParts.join("\n"),
      color: colorInt,
      fields: [] as any[],
      footer: {
        text: "TournaOps \u2022 Live tournament management for PUBG Mobile",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    };

    // WWCD spotlight
    if (winnerTeam) {
      const tag = winnerTeam.tag ? "[" + winnerTeam.tag + "] " : "";
      embed.fields.push({
        name: "\uD83E\uDD47 CHICKEN DINNER",
        value: "**" + tag + winnerTeam.name + "**\n" +
          "\uD83D\uDD2B `" + (winner.kills || 0) + " kills` \u2022 \uD83C\uDFAF `" + (winner.totalPoints || 0) + " pts`",
        inline: true,
      });
    }

    // Top fragger spotlight
    if (topFraggerTeam && topFragger?.kills > 0) {
      const tag = topFraggerTeam.tag ? "[" + topFraggerTeam.tag + "] " : "";
      embed.fields.push({
        name: "\uD83D\uDC80 TOP FRAGGER",
        value: "**" + tag + topFraggerTeam.name + "**\n" +
          "\uD83D\uDD2B `" + topFragger.kills + " eliminations`",
        inline: true,
      });
    }

    // Match stats spacer
    if (winnerTeam || topFraggerTeam) {
      embed.fields.push({ name: "\u200B", value: "\u200B", inline: true });
    }

    // Top 5 leaderboard
    if (top5.length > 0) {
      const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
      const leaderboard = top5.map((r: any) => {
        const t = teamMap.get(r.teamId) as any;
        if (!t) return null;
        const prefix = r.placement <= 3 ? medals[r.placement - 1] : "`#" + String(r.placement).padStart(2, " ") + "`";
        const tag = t.tag ? "[" + t.tag + "] " : "";
        const kills = String(r.kills || 0).padStart(2, " ");
        const pts = String(r.totalPoints || 0).padStart(3, " ");
        return prefix + " **" + tag + t.name + "** \u2014 `" + kills + "K` \u2022 `" + pts + " pts`";
      }).filter(Boolean).join("\n");

      if (leaderboard) {
        embed.fields.push({
          name: "\uD83D\uDCCA MATCH LEADERBOARD",
          value: leaderboard,
          inline: false,
        });
      }
    }

    // Sponsors
    if (otherSponsors.length > 0) {
      const tierEmoji: Record<string, string> = {
        platinum: "\uD83D\uDCA0",
        gold: "\uD83E\uDD47",
        silver: "\uD83E\uDD48",
      };
      const sponsorLines = otherSponsors.slice(0, 10).map((s: any) => {
        const e = tierEmoji[s.tier] || "\u2B50";
        return e + " " + s.name;
      }).join("  \u2022  ");
      embed.fields.push({
        name: "\uD83E\uDD1D SPONSORED BY",
        value: sponsorLines,
        inline: false,
      });
    }

    // Links footer field
    embed.fields.push({
      name: "\uD83D\uDD17 LINKS",
      value: "\uD83D\uDCCA [Live Standings](" + standingsUrl + ") \u2022 \uD83C\uDFC6 [Tournament Page](" + publicUrl + ")",
      inline: false,
    });

    const payload: any = { embeds: [embed] };

    // Add tournament banner thumbnail if available
    if (tournament.bannerImage) {
      embed.thumbnail = { url: tournament.bannerImage };
    }

    // Optional: add content ping for really big wins
    if (winner && winner.kills >= 15) {
      payload.content = "\uD83D\uDD25 **HUGE WIN!** " + (winnerTeam?.name || "") + " just dropped " + winner.kills + " kills!";
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

    // Auto-post to Discord whenever results are saved (new OR edited)
    const hasResults = updates.results && Array.isArray(updates.results) && updates.results.length > 0;

    if (hasResults && existing.tournament.discord) {
      const webhookUrl = existing.tournament.discord;
      if (webhookUrl.startsWith("https://discord.com/api/webhooks/") || webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
        // Post match result first
        try {
          await postToDiscord(
            webhookUrl,
            { ...match, name: existing.name, matchNumber: existing.matchNumber, map: match.map || existing.map },
            existing.tournament
          );
        } catch (e) {
          console.warn("[DISCORD_MATCH] Failed:", e);
        }

        // Post updated overall standings immediately after match
        try {
          const freshTournament = await prisma.tournament.findUnique({
            where: { id: existing.tournamentId },
            include: { teams: true, matches: true },
          });
          if (freshTournament) {
            await postStandingsToDiscord(webhookUrl, freshTournament);
          }
        } catch (e) {
          console.warn("[DISCORD_STANDINGS] Failed:", e);
        }
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