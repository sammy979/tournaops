import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

async function postStandingsToDiscord(webhookUrl: string, tournament: any) {
  try {
    const teams = tournament.teams || [];
    const matches = tournament.matches || [];
    const branding = tournament.brandingData || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const colorInt = parseInt(primaryColor.replace("#", ""), 16) || 0xf59e0b;
    const publicUrl = "https://www.tournaops.com/tournaments/" + tournament.slug;
    const standingsUrl = publicUrl + "/results";

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
      teamStats.set(team.id, { id: team.id, name: team.name, tag: team.tag, points: 0, kills: 0, wwcds: 0, matches: 0 });
    }
    let totalKills = 0, totalMatches = 0;
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
        s.points += (placementPoints[pIdx] || 0) + kills * killPoints + (isWWCD ? wwcdBonus : 0);
        s.kills += kills;
        if (isWWCD) s.wwcds++;
        s.matches++;
        totalKills += kills;
      }
    }
    const standings = Array.from(teamStats.values())
      .filter((s: any) => s.matches > 0)
      .sort((a: any, b: any) => b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills)
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    if (standings.length === 0) return { ok: false, reason: "no standings" };

    const top10 = standings.slice(0, 10);
    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
    const leaderboard = top10.map((s: any) => {
      const prefix = s.rank <= 3 ? medals[s.rank - 1] : "#" + s.rank;
      return prefix + " **" + s.name + "** - " + s.points + "pts - " + s.kills + "K - " + s.wwcds + "W";
    }).join("\n");

    const embed: any = {
      title: "\uD83D\uDCCA OVERALL STANDINGS - After " + totalMatches + " Match(es)",
      description: teams.length + " Teams | " + totalKills + " Total Kills | " + totalMatches + "/" + matches.length + " Matches",
      color: colorInt,
      fields: [{ name: "\uD83C\uDFC6 TOP 10", value: leaderboard, inline: false }],
      footer: { text: "TournaOps" },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return { ok: res.ok || res.status === 204, status: res.status, standings: standings.length };
  } catch (e: any) {
    return { ok: false, error: e?.message, stack: e?.stack };
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const url = new URL(req.url);
  const tournamentId = url.searchParams.get("tid");
  if (!tournamentId) return NextResponse.json({ error: "Add ?tid=YOUR_TOURNAMENT_ID" });

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { teams: true, matches: true },
  });
  if (!tournament) return NextResponse.json({ error: "Tournament not found" });
  if (tournament.userId !== session.userId) return NextResponse.json({ error: "Not owner" }, { status: 403 });

  const webhookUrl = tournament.discord;
  if (!webhookUrl) return NextResponse.json({ error: "No webhook configured" });

  const result = await postStandingsToDiscord(webhookUrl, tournament);
  return NextResponse.json({
    tournamentName: tournament.name,
    teamCount: tournament.teams.length,
    matchCount: tournament.matches.length,
    webhookConfigured: !!webhookUrl,
    result,
  });
}