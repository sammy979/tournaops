import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: true,
      matches: true,
      rounds: true,
      stages: { include: { progressions: true, groups: true }, orderBy: { order: "asc" } },
      createdBy: { select: { displayName: true, username: true } },
    },
  });

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const completedMatches = tournament.matches.filter(m => m.status === "completed" && m.results);
  const totalMatches = tournament.matches.length;

  // ─── LEADERBOARD ───
  const teamMap: Record<string, any> = {};
  tournament.teams.forEach(t => {
    teamMap[t.id] = {
      id: t.id, name: t.name, logo: t.logo, tag: t.tag,
      points: 0, kills: 0, wwcds: 0, damage: 0, matches: 0,
      placementPts: 0, killPts: 0, bestMatch: 0, bestPlacement: 17,
      matchScores: [] as number[],
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
      t.placementPts += r.placementPoints || 0;
      t.killPts += r.killPoints || 0;
      if (r.placement === 1) t.wwcds += 1;
      t.matches += 1;
      t.matchScores.push(r.totalPoints || 0);
      if ((r.totalPoints || 0) > t.bestMatch) t.bestMatch = r.totalPoints;
      if (r.placement < t.bestPlacement) t.bestPlacement = r.placement;
    });
  });

  const standings = Object.values(teamMap)
    .sort((a: any, b: any) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.kills !== a.kills) return b.kills - a.kills;
      return b.wwcds - a.wwcds;
    })
    .map((t: any, i: number) => ({ ...t, rank: i + 1 }));

  // ─── PLAYER STATS ───
  const playerMap: Record<string, any> = {};
  completedMatches.forEach(m => {
    const results = m.results as any[];
    if (!results) return;
    results.forEach((r: any) => {
      if (!r.playerResults) return;
      r.playerResults.forEach((pr: any) => {
        if (!pr.playerId) return;
        if (!playerMap[pr.playerId]) {
          playerMap[pr.playerId] = { name: pr.playerName, team: r.teamName, kills: 0, damage: 0, matches: 0 };
        }
        playerMap[pr.playerId].kills += pr.kills || 0;
        playerMap[pr.playerId].damage += pr.damage || 0;
        playerMap[pr.playerId].matches += 1;
      });
    });
  });

  const players = Object.values(playerMap);
  const topFragger = [...players].sort((a: any, b: any) => b.kills - a.kills)[0] || null;
  const topDamage = [...players].sort((a: any, b: any) => b.damage - a.damage)[0] || null;

  // ─── AWARDS ───
  const champion = standings[0] || null;
  const runnerUp = standings[1] || null;
  const third = standings[2] || null;

  // Most WWCD
  const mostWWCD = standings.length > 0
    ? [...standings].sort((a: any, b: any) => b.wwcds - a.wwcds)[0]
    : null;

  // Most Consistent (lowest variance in match scores)
  const mostConsistent = standings.filter((t: any) => t.matches >= 3).sort((a: any, b: any) => {
    const varianceA = calculateVariance(a.matchScores);
    const varianceB = calculateVariance(b.matchScores);
    return varianceA - varianceB;
  })[0] || null;

  // Biggest Comeback (highest rank gain from first half to second half)
  const biggestComeback = standings.filter((t: any) => t.matches >= 4).sort((a: any, b: any) => {
    const halfA = Math.floor(a.matchScores.length / 2);
    const halfB = Math.floor(b.matchScores.length / 2);
    const firstHalfA = a.matchScores.slice(0, halfA).reduce((s: number, v: number) => s + v, 0);
    const secondHalfA = a.matchScores.slice(halfA).reduce((s: number, v: number) => s + v, 0);
    const firstHalfB = b.matchScores.slice(0, halfB).reduce((s: number, v: number) => s + v, 0);
    const secondHalfB = b.matchScores.slice(halfB).reduce((s: number, v: number) => s + v, 0);
    const improvementA = secondHalfA - firstHalfA;
    const improvementB = secondHalfB - firstHalfB;
    return improvementB - improvementA;
  })[0] || null;

  // ─── TOURNAMENT STATS ───
  const totalKills = standings.reduce((a: number, t: any) => a + t.kills, 0);
  const totalWWCDs = standings.reduce((a: number, t: any) => a + t.wwcds, 0);
  const avgKillsPerMatch = completedMatches.length > 0 ? Math.round(totalKills / completedMatches.length) : 0;

  // ─── STAGE JOURNEY ───
  const stageJourneys: Record<string, any[]> = {};
  tournament.stages.forEach(stage => {
    stage.progressions.forEach(prog => {
      if (!stageJourneys[prog.teamId]) stageJourneys[prog.teamId] = [];
      stageJourneys[prog.teamId].push({
        stageName: stage.name,
        stageType: stage.type,
        stageOrder: stage.order,
        position: prog.finalPosition,
        points: prog.points,
        kills: prog.kills,
        status: prog.status,
      });
    });
  });

  // Sort each team journey by stage order
  Object.values(stageJourneys).forEach(journey => {
    journey.sort((a: any, b: any) => a.stageOrder - b.stageOrder);
  });

  // ─── AI SUMMARY ───
  let aiSummary = null;
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith("sk-") && champion) {
    try {
      const prompt = `Write a 3-sentence professional esports tournament summary based ONLY on this data:
Tournament: ${tournament.name}
Champion: ${champion.name} (${champion.points} points, ${champion.kills} kills, ${champion.wwcds} WWCD)
Runner-up: ${runnerUp?.name || "N/A"} (${runnerUp?.points || 0} points)
3rd Place: ${third?.name || "N/A"} (${third?.points || 0} points)
Total Teams: ${tournament.teams.length}
Total Matches: ${completedMatches.length}
Total Kills: ${totalKills}
MVP: ${topFragger?.name || "N/A"} (${topFragger?.kills || 0} kills)
Point gap between 1st and 2nd: ${champion.points - (runnerUp?.points || 0)}

Rules:
- Only state facts from the data above
- Do not invent statistics
- Professional esports commentary style
- Keep it under 80 words`;

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiSummary = aiData.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch {}
  }

  return NextResponse.json({
    tournament: {
      id: tournament.id,
      slug: tournament.slug,
      name: tournament.name,
      description: tournament.description,
      status: tournament.status,
      prizePool: tournament.prizePool,
      game: tournament.game,
      createdAt: tournament.createdAt,
      organizer: tournament.createdBy?.displayName || tournament.createdBy?.username || "Unknown",
    },
    standings,
    awards: {
      champion,
      runnerUp,
      third,
      topFragger,
      topDamage,
      mostWWCD,
      mostConsistent,
      biggestComeback,
    },
    statistics: {
      totalTeams: tournament.teams.length,
      totalMatches,
      completedMatches: completedMatches.length,
      totalKills,
      totalWWCDs,
      avgKillsPerMatch,
      totalDamage: standings.reduce((a: number, t: any) => a + (t.damage || 0), 0),
    },
    stageJourneys,
    stages: tournament.stages.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      order: s.order,
      status: s.status,
      totalTeams: s.totalTeams,
      teamsAdvancing: s.teamsAdvancing,
    })),
    aiSummary,
  });
}

function calculateVariance(scores: number[]): number {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
}