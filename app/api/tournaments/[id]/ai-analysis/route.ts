import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Find by ID or slug
  let tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { teams: true, matches: true },
  });

  if (!tournament) {
    tournament = await prisma.tournament.findUnique({
      where: { slug: id },
      include: { teams: true, matches: true },
    });
  }

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const completedMatches = tournament.matches.filter(m => m.status === "completed" && m.results);

  if (completedMatches.length === 0) {
    return NextResponse.json({
      insights: null,
      message: "No completed matches yet",
    });
  }

  // Build standings
  const teamMap: Record<string, any> = {};
  tournament.teams.forEach(t => {
    teamMap[t.id] = {
      id: t.id, name: t.name,
      points: 0, kills: 0, wwcds: 0, damage: 0, matches: 0,
      matchScores: [] as number[],
      placements: [] as number[],
      bestMatch: 0, worstMatch: 999,
    };
  });

  completedMatches.forEach(m => {
    const results = m.results as any[];
    if (!results) return;
    results.forEach((r: any) => {
      if (!teamMap[r.teamId]) return;
      const t = teamMap[r.teamId];
      t.points += r.totalPoints || 0;
      t.kills += r.kills || 0;
      t.damage += r.damage || 0;
      if (r.placement === 1) t.wwcds += 1;
      t.matches += 1;
      t.matchScores.push(r.totalPoints || 0);
      t.placements.push(r.placement || 16);
      if ((r.totalPoints || 0) > t.bestMatch) t.bestMatch = r.totalPoints;
      if ((r.totalPoints || 0) < t.worstMatch) t.worstMatch = r.totalPoints;
    });
  });

  const standings = Object.values(teamMap)
    .filter((t: any) => t.matches > 0)
    .sort((a: any, b: any) => b.points - a.points)
    .map((t: any, i: number) => ({ ...t, rank: i + 1 }));

  // Calculate AI insights (deterministic - no API needed)
  const totalKills = standings.reduce((a: number, t: any) => a + t.kills, 0);
  const totalMatches = completedMatches.length;
  const avgKillsPerMatch = totalMatches > 0 ? Math.round(totalKills / totalMatches) : 0;

  // Per-team insights
  const teamInsights = standings.slice(0, 16).map((team: any) => {
    const avgScore = team.matches > 0 ? Math.round(team.points / team.matches) : 0;
    const avgPlacement = team.placements.length > 0
      ? (team.placements.reduce((a: number, b: number) => a + b, 0) / team.placements.length).toFixed(1)
      : "N/A";
    const consistency = team.matchScores.length >= 2
      ? Math.round(Math.sqrt(team.matchScores.reduce((sum: number, s: number) => sum + Math.pow(s - avgScore, 2), 0) / team.matchScores.length))
      : 0;

    // Trend (last 2 matches vs first 2)
    const recentScores = team.matchScores.slice(-2);
    const earlyScores = team.matchScores.slice(0, 2);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a: number, b: number) => a + b, 0) / recentScores.length : 0;
    const earlyAvg = earlyScores.length > 0 ? earlyScores.reduce((a: number, b: number) => a + b, 0) / earlyScores.length : 0;
    const trend = recentAvg - earlyAvg;

    // Generate insight text
    let insight = "";
    if (team.rank === 1) {
      if (team.wwcds >= 2) insight = `Leading with ${team.wwcds} Chicken Dinners. Avg ${avgScore}pts/match.`;
      else insight = `Tournament leader with ${team.points}pts. Avg placement: #${avgPlacement}.`;
    } else if (team.rank <= 3) {
      const gap = standings[0].points - team.points;
      insight = `${gap}pts behind #1. ${trend > 3 ? "Trending UP - improving each match." : trend < -3 ? "Slowing down in recent matches." : "Consistent performance."}`;
    } else if (trend > 5) {
      insight = `Most improved recently. Gained ${Math.round(trend)}pts avg in last 2 matches.`;
    } else if (consistency < 3 && team.matches >= 3) {
      insight = `Very consistent. Only ${consistency}pt variance between matches.`;
    } else if (team.wwcds > 0) {
      insight = `${team.wwcds} WWCD but inconsistent placements. High ceiling, needs consistency.`;
    } else if (team.kills > standings[0].kills * 0.8) {
      insight = `Strong kill game (${team.kills}K) but needs better placements to climb.`;
    } else {
      insight = `Avg ${avgScore}pts/match. Best: ${team.bestMatch}pts. Avg placement: #${avgPlacement}.`;
    }

    return {
      teamId: team.id,
      teamName: team.name,
      rank: team.rank,
      insight,
      avgScore,
      avgPlacement: parseFloat(avgPlacement as string) || 0,
      consistency,
      trend: Math.round(trend),
      trendDirection: trend > 2 ? "up" : trend < -2 ? "down" : "stable",
    };
  });

  // Tie detection with AI explanation
  const ties = [];
  for (let i = 0; i < standings.length - 1; i++) {
    if (standings[i].points === standings[i + 1].points) {
      const a = standings[i];
      const b = standings[i + 1];
      let resolution = "";
      if (a.kills !== b.kills) {
        resolution = `${a.kills > b.kills ? a.name : b.name} wins tiebreaker on kills (${Math.max(a.kills, b.kills)} vs ${Math.min(a.kills, b.kills)}).`;
      } else if (a.wwcds !== b.wwcds) {
        resolution = `${a.wwcds > b.wwcds ? a.name : b.name} wins on WWCD count (${Math.max(a.wwcds, b.wwcds)} vs ${Math.min(a.wwcds, b.wwcds)}).`;
      } else {
        resolution = `Exact tie on points, kills, and WWCD. Manual resolution needed.`;
      }
      ties.push({
        rank: a.rank,
        team1: a.name,
        team2: b.name,
        points: a.points,
        resolution,
      });
    }
  }

  // Tournament-level insights
  const mostImproved = teamInsights.filter((t: any) => t.trend > 0).sort((a: any, b: any) => b.trend - a.trend)[0];
  const mostConsistent = teamInsights.filter((t: any) => t.consistency > 0).sort((a: any, b: any) => a.consistency - b.consistency)[0];

  // Win probability (simple - based on current points lead)
  const leader = standings[0];
  const matchesRemaining = tournament.matches.length - completedMatches.length;
  const maxPossibleSwing = matchesRemaining * 20; // ~20pts max per match
  const predictions = standings.slice(0, 5).map((t: any) => {
    const gap = leader.points - t.points;
    const canCatchUp = gap <= maxPossibleSwing;
    const probability = t.rank === 1
      ? Math.min(95, 50 + (t.points - (standings[1]?.points || 0)))
      : canCatchUp ? Math.max(5, 50 - gap * 2) : 2;
    return {
      teamName: t.name,
      rank: t.rank,
      probability: Math.min(95, Math.max(2, Math.round(probability))),
    };
  });

  // Try AI summary if OpenAI key available
  let aiSummary = null;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith("sk-") && standings.length >= 3) {
    try {
      const prompt = `Analyze this PUBG Mobile tournament leaderboard in 2 sentences. Data only, no invention:
Top 3: #1 ${standings[0].name} (${standings[0].points}pts, ${standings[0].kills}K, ${standings[0].wwcds}W), #2 ${standings[1]?.name} (${standings[1]?.points}pts), #3 ${standings[2]?.name} (${standings[2]?.points}pts).
${completedMatches.length}/${tournament.matches.length} matches done. Total kills: ${totalKills}. ${ties.length} ties detected.
Most improved: ${mostImproved?.teamName || "N/A"} (+${mostImproved?.trend || 0}pts trend).
Keep under 50 words. Professional esports style.`;

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiSummary = aiData.choices?.[0]?.message?.content?.trim();
      }
    } catch {}
  }

  return NextResponse.json({
    standings: standings.slice(0, 20),
    teamInsights,
    ties,
    predictions,
    statistics: {
      totalTeams: standings.length,
      completedMatches: completedMatches.length,
      totalMatches: tournament.matches.length,
      totalKills,
      avgKillsPerMatch,
      mostImproved: mostImproved?.teamName,
      mostConsistent: mostConsistent?.teamName,
    },
    aiSummary,
  });
}