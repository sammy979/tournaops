import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { generateAI } from "@/lib/ai";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";
import { calculateStandings, getTopFragger, parseScoringConfig } from "@/lib/scoring-engine";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { select: { id: true, name: true, tag: true } },
        matches: {
          where: { status: "completed" },
          select: {
            id: true, name: true, map: true,
            matchNumber: true, results: true,
          },
          orderBy: { matchNumber: "asc" },
        },
        stages: {
          select: { id: true, name: true, type: true, status: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Official scoring â€” single source of truth
    const scoringConfig = parseScoringConfig(tournament.scoringRule);
    const allResults: Array<{
      teamId: string;
      teamName: string;
      matchNumber: number;
      placement: number;
      kills: number;
    }> = [];

    for (const match of tournament.matches) {
      if (!match.results || !Array.isArray(match.results)) continue;
      for (const result of match.results as Array<Record<string, unknown>>) {
        allResults.push({
          teamId: String(result.teamId || ""),
          teamName: String(result.teamName || ""),
          matchNumber: match.matchNumber || 0,
          placement: Number(result.placement) || 0,
          kills: Number(result.kills) || 0,
        });
      }
    }

    const standings = calculateStandings(allResults, scoringConfig);
    const topFragger = getTopFragger(standings);
    const champion = standings[0];
    const completedMatches = tournament.matches.length;

    // Report data from verified DB numbers
    const reportData = {
      tournament: tournament.name,
      status: tournament.status,
      totalTeams: tournament.teams.length,
      completedMatches,
      champion: champion ? {
        name: champion.teamName,
        points: champion.totalPoints,
        kills: champion.totalKills,
        wwcds: champion.wwcdCount,
      } : null,
      top3: standings.slice(0, 3).map(s => ({
        rank: s.rank,
        team: s.teamName,
        points: s.totalPoints,
        kills: s.totalKills,
      })),
      topFragger: topFragger ? {
        team: topFragger.teamName,
        kills: topFragger.totalKills,
      } : null,
      scoringType: scoringConfig.type,
      maps: [...new Set(tournament.matches.map(m => m.map))],
    };

    const prompt = `Generate a professional PUBG Mobile tournament report.

VERIFIED TOURNAMENT DATA:
${JSON.stringify(reportData, null, 2)}

Write a tournament report with these sections:
1. Tournament Overview
2. Champion & Podium
3. Standout Performances  
4. Tournament Highlights
5. Closing Statement

Rules:
- Base ONLY on the data provided
- Do not invent stats not in the data
- Professional esports tone
- Under 400 words
- If champion is null, note tournament is still in progress`;

    const result = await generateAI({
      prompt,
      temperature: 0.7,
      maxTokens: 600,
      preferProvider: "groq",
    });

    return NextResponse.json({
      report: result.text || "Report generation unavailable. Please try again.",
      provider: result.provider,
      data: reportData,
      standings: standings.slice(0, 10),
      branding: tournament.brandingData || {},
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
      },
    });
  } catch (err) {
    logError(err, "TOURNAMENT_REPORT");
    return NextResponse.json(
      { error: "Failed to generate report." },
      { status: 500 }
    );
  }
}
