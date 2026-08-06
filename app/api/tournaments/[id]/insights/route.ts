import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

const PLACEMENT_POINTS: Record<number, number> = {
  1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1,
};

type Standing = {
  teamId: string;
  teamName: string;
  teamTag: string;
  totalPoints: number;
  placementPoints: number;
  totalKills: number;
  wwcdCount: number;
  matchesPlayed: number;
  avgKills: number;
  avgPlacement: number;
  bestPlacement: number;
  highestKills: number;
  rank: number;
};

function calculateStandings(teams: any[], matches: any[]): Standing[] {
  const map = new Map<string, any>();
  const placementSums = new Map<string, number>();
  
  teams.forEach((t: any) => {
    map.set(t.id, {
      teamId: t.id, teamName: t.name || "", teamTag: t.tag || "",
      totalPoints: 0, placementPoints: 0, totalKills: 0, wwcdCount: 0,
      matchesPlayed: 0, avgKills: 0, avgPlacement: 0,
      bestPlacement: 999, highestKills: 0,
    });
    placementSums.set(t.id, 0);
  });
  
  matches.forEach((m: any) => {
    const results = Array.isArray(m.results) ? m.results : [];
    results.forEach((r: any) => {
      const s = map.get(r.teamId);
      if (!s) return;
      const kills = Number(r.kills) || 0;
      const placement = Number(r.placement) || 0;
      const pts = PLACEMENT_POINTS[placement] || 0;
      
      s.totalKills += kills;
      s.placementPoints += pts;
      s.totalPoints += kills + pts;
      if (r.wwcd || placement === 1) s.wwcdCount += 1;
      s.matchesPlayed += 1;
      
      if (placement > 0 && placement < s.bestPlacement) s.bestPlacement = placement;
      if (kills > s.highestKills) s.highestKills = kills;
      
      placementSums.set(r.teamId, (placementSums.get(r.teamId) || 0) + (placement || 16));
    });
  });
  
  map.forEach((s, teamId) => {
    if (s.matchesPlayed > 0) {
      s.avgKills = s.totalKills / s.matchesPlayed;
      s.avgPlacement = (placementSums.get(teamId) || 0) / s.matchesPlayed;
    }
  });
  
  return Array.from(map.values())
    .filter(s => s.matchesPlayed > 0)
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.wwcdCount !== a.wwcdCount) return b.wwcdCount - a.wwcdCount;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return a.bestPlacement - b.bestPlacement;
    })
    .map((s, idx) => ({ ...s, rank: idx + 1 }));
}

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  
  // Try Groq first (if it's an actual Groq key starting with gsk_)
  if (groqKey && groqKey.startsWith("gsk_")) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + groqKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (e) {
      console.warn("[AI] Groq failed, trying Gemini:", e);
    }
  }
  
  // Fallback to Gemini
  if (!geminiKey) throw new Error("No AI key configured (GROQ or GEMINI)");
  
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiKey;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: systemPrompt + "\n\n" + prompt }],
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }),
  });
  
  if (!res.ok) {
    const txt = await res.text();
    throw new Error("Gemini API failed: " + res.status + " - " + txt.slice(0, 300));
  }
  
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text in Gemini response");
  return text;
}

async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  return callAI(prompt, systemPrompt);
}

function generateSummaryStats(standings: Standing[], matches: any[]) {
  const totalKills = standings.reduce((s, x) => s + x.totalKills, 0);
  const totalMatches = matches.filter(m => Array.isArray(m.results) && m.results.length > 0).length;
  const totalWWCD = standings.reduce((s, x) => s + x.wwcdCount, 0);
  const top1 = standings[0];
  const top3 = standings.slice(0, 3);
  const topKiller = [...standings].sort((a, b) => b.totalKills - a.totalKills)[0];
  const topWWCD = [...standings].sort((a, b) => b.wwcdCount - a.wwcdCount)[0];
  const closestGap = standings.length >= 2 ? standings[0].totalPoints - standings[1].totalPoints : 0;
  
  return {
    totalKills, totalMatches, totalWWCD, top1, top3, topKiller, topWWCD, closestGap,
    avgKillsPerMatch: totalMatches > 0 ? Math.round((totalKills / totalMatches) * 10) / 10 : 0,
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id } = await context.params;
    const owned = await verifyTournamentOwnership(id, session.userId);
    if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { teams: true, matches: true },
    });
    
    if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    const standings = calculateStandings(tournament.teams, tournament.matches);
    
    if (standings.length === 0) {
      return NextResponse.json({
        error: "No match data yet. Enter some match results first!",
      }, { status: 400 });
    }
    
    const stats = generateSummaryStats(standings, tournament.matches);
    const totalTeams = standings.length;
    
    // Prepare context for AI
    const topTeams = standings.slice(0, 8).map(s => (
      "#" + s.rank + " " + (s.teamTag ? "[" + s.teamTag + "] " : "") + s.teamName + 
      " - " + s.totalPoints + " pts (" + s.wwcdCount + " WWCD, " + s.totalKills + " kills, avg " + s.avgKills.toFixed(1) + " kills/match)"
    )).join("\n");
    
    const contextInfo = 
      "Tournament: " + tournament.name + "\n" +
      "Total Teams: " + totalTeams + "\n" +
      "Matches Played: " + stats.totalMatches + "\n" +
      "Total Kills: " + stats.totalKills + " (avg " + stats.avgKillsPerMatch + " per match)\n" +
      "Total WWCDs: " + stats.totalWWCD + "\n" +
      "Points Gap 1st vs 2nd: " + stats.closestGap + "\n\n" +
      "TOP 8 STANDINGS:\n" + topTeams;
    
    const results: Record<string, string> = {};
    
    // ── MATCH SUMMARY ──
    if (type === "all" || type === "summary") {
      const prompt = 
        contextInfo + "\n\n" +
        "Write a professional 3-4 sentence match summary for esports fans. Highlight the leader, key standouts, and dramatic moments. Use excitement and specific numbers.";
      
      try {
        results.summary = await callGroq(prompt, 
          "You are a professional PUBG Mobile esports analyst. Write engaging, data-driven summaries in an exciting tone. Always use specific numbers from the data. Never make up statistics.");
      } catch (e: any) {
        results.summary = "Summary generation failed: " + e.message;
      }
    }
    
    // ── MVP PREDICTION ──
    if (type === "all" || type === "mvp") {
      const prompt = 
        contextInfo + "\n\n" +
        "Based on current stats, predict the MVP team and explain why in 2-3 sentences. Focus on: consistency, WWCDs, kill count, and momentum.";
      
      try {
        results.mvp = await callGroq(prompt,
          "You are a PUBG Mobile esports data analyst. Make MVP predictions based on stats. Be confident but reasoned. Use specific team names and numbers.");
      } catch (e: any) {
        results.mvp = "MVP prediction failed: " + e.message;
      }
    }
    
    // ── PERFORMANCE TRENDS ──
    if (type === "all" || type === "trends") {
      const prompt = 
        contextInfo + "\n\n" +
        "Identify 2 teams to watch: one HOT team performing above expectations, one COLD team struggling. Format as JSON:\n" +
        '{"hot": {"team": "team name", "reason": "why they are hot"}, "cold": {"team": "team name", "reason": "why they are cold"}}';
      
      try {
        results.trends = await callGroq(prompt,
          "You are a PUBG Mobile esports analyst. Output ONLY valid JSON. No markdown, no explanations.");
      } catch (e: any) {
        results.trends = "Trends analysis failed: " + e.message;
      }
    }
    
    // ── QUALIFICATION PROBABILITY ──
    if (type === "all" || type === "qualification") {
      const qualifyingSpots = Math.min(8, Math.floor(totalTeams / 2));
      const prompt = 
        contextInfo + "\n\n" +
        "Predict qualification probability (%) for top " + qualifyingSpots + " teams to reach Grand Finals. Output as JSON array:\n" +
        '[{"team": "team name", "probability": 95, "status": "safe/at-risk/must-win"}]\n' +
        "Include exactly " + qualifyingSpots + " teams (top " + qualifyingSpots + " by points).";
      
      try {
        results.qualification = await callGroq(prompt,
          "You are a PUBG Mobile esports statistician. Output ONLY valid JSON array. No markdown.");
      } catch (e: any) {
        results.qualification = "Qualification prediction failed: " + e.message;
      }
    }
    
    // ── SOCIAL MEDIA CAPTION ──
    if (type === "all" || type === "social") {
      const prompt = 
        contextInfo + "\n\n" +
        "Write an exciting social media caption for Instagram/Twitter announcing current standings. Include:\n" +
        "- 3-5 relevant emojis\n" +
        "- Top 3 with numbers\n" +
        "- Key stats highlight\n" +
        "- 4-5 hashtags\n" +
        "Keep under 250 chars. Use line breaks for readability.";
      
      try {
        results.social = await callGroq(prompt,
          "You are a social media manager for esports. Write engaging, emoji-rich captions ready to post. No quotes around output.");
      } catch (e: any) {
        results.social = "Social caption failed: " + e.message;
      }
    }
    
    // ── CASTER NOTES ──
    if (type === "all" || type === "caster") {
      const prompt = 
        contextInfo + "\n\n" +
        "Generate 4-5 key talking points for esports commentators covering these standings. Focus on:\n" +
        "- Compelling storylines\n" +
        "- Numbers to mention on broadcast\n" +
        "- Teams to watch\n" +
        "- Comeback narratives\n" +
        "Format as bullet points starting with •";
      
      try {
        results.caster = await callGroq(prompt,
          "You are a PUBG Mobile esports commentator producer. Write concise, exciting talking points for live broadcast casters.");
      } catch (e: any) {
        results.caster = "Caster notes failed: " + e.message;
      }
    }
    
    return NextResponse.json({
      insights: results,
      stats: {
        totalTeams,
        totalMatches: stats.totalMatches,
        totalKills: stats.totalKills,
        totalWWCD: stats.totalWWCD,
        avgKillsPerMatch: stats.avgKillsPerMatch,
        closestGap: stats.closestGap,
        leader: stats.top1 ? { name: stats.top1.teamName, tag: stats.top1.teamTag, points: stats.top1.totalPoints } : null,
        topKiller: stats.topKiller ? { name: stats.topKiller.teamName, kills: stats.topKiller.totalKills } : null,
        topWWCD: stats.topWWCD ? { name: stats.topWWCD.teamName, wwcd: stats.topWWCD.wwcdCount } : null,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    logError(err, "AI_INSIGHTS");
    return NextResponse.json({ error: err?.message || "Failed to generate insights" }, { status: 500 });
  }
}