import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requirePro } from "@/lib/auth/rbac";
import { generateAI } from "@/lib/ai";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";
import { calculateStandings, parseScoringConfig } from "@/lib/scoring-engine";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const proCheck = await requirePro(session);
    if (!proCheck.authorized) return proCheck.errorResponse!;

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { select: { id: true, name: true, tag: true } },
        matches: {
          where: { status: "completed" },
          select: {
            id: true, name: true, map: true, matchNumber: true,
            results: true, status: true,
          },
          orderBy: { matchNumber: "asc" },
        },
        stages: {
          select: { id: true, name: true, type: true, status: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

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
    const leader = standings[0];
    const completedMatches = tournament.matches.length;

    const tournamentContext = {
      name: tournament.name,
      status: tournament.status,
      teams: tournament.teams.length,
      completedMatches,
      leader: leader ? { name: leader.teamName, points: leader.totalPoints, kills: leader.totalKills } : null,
      top5: standings.slice(0, 5).map(s => ({
        rank: s.rank,
        team: s.teamName,
        points: s.totalPoints,
        kills: s.totalKills,
        wwcds: s.wwcdCount,
      })),
      scoringType: scoringConfig.type,
      stages: tournament.stages.map(s => ({ name: s.name, type: s.type, status: s.status })),
    };

    const prompt = `You are TournaOps AI analyzing a PUBG Mobile tournament.

TOURNAMENT DATA (verified from database - do NOT modify these numbers):
${JSON.stringify(tournamentContext, null, 2)}

Generate a professional esports analysis including:
1. Current tournament summary (2-3 sentences)
2. Key observations about the leaderboard
3. Teams to watch
4. What makes this tournament interesting

IMPORTANT: Base your analysis ONLY on the data provided above.
Do not invent scores, kills, or statistics not in the data.
Keep response under 300 words.`;

    const result = await generateAI({
      prompt,
      temperature: 0.7,
      maxTokens: 500,
      preferProvider: "groq",
    });

    if (!result.text) {
      return NextResponse.json({
        error: "AI analysis unavailable. Please try again.",
        standings: standings.slice(0, 10),
      }, { status: 200 });
    }

    return NextResponse.json({
      analysis: result.text,
      provider: result.provider,
      standings: standings.slice(0, 10),
      context: {
        completedMatches,
        totalTeams: tournament.teams.length,
        leader: leader?.teamName,
      },
    });
  } catch (err) {
    logError(err, "AI_ANALYSIS");
    return NextResponse.json(
      { error: "Failed to generate analysis. Please try again." },
      { status: 500 }
    );
  }
}