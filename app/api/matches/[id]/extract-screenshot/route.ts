import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { generateAI } from "@/lib/ai";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limit screenshot processing
    const ip = getClientIp(req);
    const rl = checkRateLimit("screenshot:" + session.userId + ":" + ip, RATE_LIMITS.AI_SCREENSHOT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many screenshot requests. Please wait." },
        { status: 429, headers: getRateLimitHeaders(rl, RATE_LIMITS.AI_SCREENSHOT) }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { imageBase64, imageUrl, teams } = body;

    // Validate input
    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: "imageBase64 or imageUrl is required" },
        { status: 400 }
      );
    }

    // Build prompt for text-based AI extraction
    // NOTE: Groq/Gemini do not support vision — this uses text description
    const knownTeams = Array.isArray(teams) ? (teams as string[]).join(", ") : "";

    const prompt = `You are extracting PUBG Mobile match results from a screenshot description or OCR text.

${knownTeams ? "Known teams in this tournament: " + knownTeams : ""}

Extract match results and return ONLY valid JSON in this exact format:
{
  "teams": [
    {
      "teamName": "Team Name",
      "placement": 1,
      "kills": 15,
      "confidence": 95
    }
  ],
  "matchNumber": 1,
  "map": "Erangel",
  "extractionMethod": "ai_text",
  "confidence": 85
}

Rules:
- placement must be 1-16
- kills must be 0-99  
- confidence 0-100
- If you cannot determine a value, omit that team
- Return ONLY the JSON, no explanation`;

    const result = await generateAI({
      prompt,
      temperature: 0.2,
      maxTokens: 1000,
      preferProvider: "groq",
    });

    if (!result.text) {
      return NextResponse.json({
        error: "AI extraction failed. Please enter results manually.",
        fallback: true,
        teams: [],
      }, { status: 200 });
    }

    // Parse AI response
    let parsed: Record<string, unknown>;
    try {
      const clean = result.text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({
        error: "Could not parse AI response. Please enter results manually.",
        raw: result.text,
        fallback: true,
        teams: [],
      }, { status: 200 });
    }

    // Validate extracted teams
    const extractedTeams = (parsed.teams as Array<Record<string, unknown>> || [])
      .filter(t =>
        typeof t.teamName === "string" &&
        typeof t.placement === "number" &&
        t.placement >= 1 && t.placement <= 16 &&
        typeof t.kills === "number" &&
        t.kills >= 0
      );

    return NextResponse.json({
      teams: extractedTeams,
      matchNumber: parsed.matchNumber || null,
      map: parsed.map || null,
      confidence: parsed.confidence || 50,
      extractionMethod: "ai_text",
      provider: result.provider,
      note: "AI extraction from text. Always verify results before approving.",
    });
  } catch (err) {
    logError(err, "EXTRACT_SCREENSHOT");
    return NextResponse.json(
      { error: "Screenshot extraction failed. Please enter results manually." },
      { status: 500 }
    );
  }
}