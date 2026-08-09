import { NextRequest, NextResponse } from "next/server";
import {
  listTournamentTemplates,
  TournamentTemplateKey,
} from "@/lib/tournament-templates";
import { generateTournamentPlan } from "@/lib/tournament-generator";

// GET /api/tournament-templates
// Optional query params:
//   ?template=CUP_64&teamCount=64
// Returns:
//   { templates, preview? }

export async function GET(req: NextRequest) {
  try {
    const templates = listTournamentTemplates().map((t) => ({
      key: t.key,
      label: t.label,
      description: t.description,
      category: t.category,
      recommendedTeamCounts: t.recommendedTeamCounts,
      defaultScoringPreset: t.defaultScoringPreset,
      defaultMaps: t.defaultMaps,
      defaultDays: t.defaultDays,
    }));

    const { searchParams } = new URL(req.url);
    const template = searchParams.get("template") as TournamentTemplateKey | null;
    const teamCountRaw = searchParams.get("teamCount");

    if (!template || !teamCountRaw) {
      return NextResponse.json({ templates });
    }

    const teamCount = Number(teamCountRaw);
    if (!Number.isFinite(teamCount) || teamCount < 1) {
      return NextResponse.json(
        { error: "teamCount must be a positive number", templates },
        { status: 400 }
      );
    }

    const preview = generateTournamentPlan({
      templateKey: template,
      teamCount,
    });

    return NextResponse.json({
      templates,
      preview,
    });
  } catch (err) {
    console.error("[TOURNAMENT_TEMPLATES]", err);
    return NextResponse.json(
      { error: "Failed to load tournament templates" },
      { status: 500 }
    );
  }
}