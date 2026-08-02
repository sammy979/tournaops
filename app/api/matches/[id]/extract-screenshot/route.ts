import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

interface ExtractedTeamResult {
  teamName: string;
  placement: number;
  kills: number;
  confidence: number;
  playerNames?: string[];
}

interface ExtractionResult {
  teams: ExtractedTeamResult[];
  mapDetected?: string;
  matchNumberDetected?: string;
  method: "ai" | "manual";
  rawResponse?: string;
}

// POST — Upload screenshot + extract results
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: matchId } = await params;
  const body = await req.json();
  const { screenshotBase64 } = body;

  if (!screenshotBase64) {
    return NextResponse.json({ error: "Screenshot required" }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { tournament: true },
  });

  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Save screenshot to match record
  await prisma.match.update({
    where: { id: matchId },
    data: { screenshotUrl: screenshotBase64 },
  });

  // Try AI extraction
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const result = await extractWithAI(screenshotBase64, apiKey);

      // Audit log
      if (match.stageId) {
        await prisma.qualifierAuditLog.create({
          data: {
            tournamentId: match.tournamentId,
            stageId: match.stageId,
            action: "AI_SCREENSHOT_EXTRACT",
            reason: `AI extracted ${result.teams.length} team results from screenshot for ${match.name}`,
            metadata: {
              matchId,
              method: "openai_vision",
              teamsDetected: result.teams.length,
              mapDetected: result.mapDetected,
            },
            performedBy: session.userId,
          },
        });
      }

      return NextResponse.json({
        success: true,
        extraction: result,
        screenshotSaved: true,
      });
    } catch (err: any) {
      console.error("AI extraction failed:", err.message);
      // Fall through to manual
      return NextResponse.json({
        success: true,
        extraction: {
          teams: [],
          method: "manual" as const,
          error: "AI extraction failed. Please enter results manually.",
        },
        screenshotSaved: true,
        aiError: err.message,
      });
    }
  }

  // No API key — return manual mode
  return NextResponse.json({
    success: true,
    extraction: {
      teams: [],
      method: "manual" as const,
    },
    screenshotSaved: true,
    noApiKey: true,
  });
}

// ─── AI EXTRACTION ────────────────────────────────────────

async function extractWithAI(base64Image: string, apiKey: string): Promise<ExtractionResult> {
  // Remove data:image/... prefix if present
  const imageData = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a PUBG Mobile tournament result extractor. Analyze the screenshot and extract match results.

Return ONLY valid JSON in this exact format:
{
  "teams": [
    { "teamName": "TEAM NAME", "placement": 1, "kills": 8, "confidence": 95 },
    { "teamName": "ANOTHER TEAM", "placement": 2, "kills": 5, "confidence": 90 }
  ],
  "mapDetected": "Erangel",
  "matchNumberDetected": "Match 1"
}

Rules:
- Extract ALL teams visible in the screenshot
- Placement is the finishing position (1st, 2nd, etc.)
- Kills is the total team eliminations
- Confidence is 0-100 (how sure you are about each entry)
- If you can't read a value clearly, set confidence below 70
- Do NOT guess or make up data
- If this is NOT a PUBG Mobile result screen, return empty teams array
- Team names should be exact as shown (preserve caps, spaces, etc.)`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract the PUBG Mobile match results from this screenshot. Return JSON only.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageData}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} — ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract JSON from response
  let parsed: any;
  try {
    // Try to find JSON in the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("Failed to parse AI response as JSON");
  }

  return {
    teams: (parsed.teams || []).map((t: any) => ({
      teamName: String(t.teamName || "Unknown").trim(),
      placement: parseInt(t.placement) || 0,
      kills: parseInt(t.kills) || 0,
      confidence: parseInt(t.confidence) || 50,
      playerNames: t.playerNames || undefined,
    })),
    mapDetected: parsed.mapDetected || undefined,
    matchNumberDetected: parsed.matchNumberDetected || undefined,
    method: "ai",
    rawResponse: content,
  };
}