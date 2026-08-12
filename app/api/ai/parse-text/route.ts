import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const ParseRequestSchema = z.object({
  text: z.string().min(1).max(10000).optional(),
  imageBase64: z.string().optional(),
  matchId: z.string().optional(),
  context: z.object({
    teamCount: z.number().optional(),
    knownTeams: z.array(z.string()).optional(),
  }).optional(),
});

async function parseWithGroq(text: string, context?: any) {
  if (!process.env.GROQ_API_KEY) throw new Error("Groq not configured");

  const knownTeams = context?.knownTeams?.length > 0
    ? `Known teams in this tournament: ${context.knownTeams.join(", ")}`
    : "";

  const prompt = `You are analyzing PUBG Mobile match results. Extract structured data from the following text.

${knownTeams}

Text to parse:
${text}

Return a JSON object with this exact structure:
{
  "results": [
    {
      "placement": 1,
      "teamName": "Team Name",
      "kills": 5,
      "isWWCD": true
    }
  ],
  "confidence": 0.9,
  "warnings": ["any issues found"]
}

Rules:
- placement is 1-based integer
- kills is non-negative integer
- isWWCD is true only for 1st place winner
- teamName must match known teams if provided
- Only return valid JSON, no markdown`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2000,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Groq API error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from response
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response as JSON");
  }
}

async function parseWithGemini(imageBase64: string, context?: any) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Gemini not configured");

  const knownTeams = context?.knownTeams?.length > 0
    ? `Known teams: ${context.knownTeams.join(", ")}`
    : "";

  const prompt = `Analyze this PUBG Mobile match result screenshot and extract structured data.

${knownTeams}

Return a JSON object:
{
  "results": [
    {
      "placement": 1,
      "teamName": "Team Name",
      "kills": 5,
      "isWWCD": true
    }
  ],
  "confidence": 0.9,
  "warnings": ["any issues found"]
}

Only return valid JSON.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2000 },
      }),
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(content);
  } catch {
    throw new Error("Could not parse Gemini response as JSON");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ParseRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { text, imageBase64, matchId, context } = parsed.data;

    if (!text && !imageBase64) {
      return NextResponse.json({ error: "Provide text or image for parsing" }, { status: 400 });
    }

    let extractedData: any = null;
    let engine = "none";
    let error: string | null = null;

    if (imageBase64 && process.env.GEMINI_API_KEY) {
      try {
        extractedData = await parseWithGemini(imageBase64, context);
        engine = "gemini";
      } catch (e: any) {
        error = `Gemini: ${e.message}`;
      }
    }

    if (!extractedData && text && process.env.GROQ_API_KEY) {
      try {
        extractedData = await parseWithGroq(text, context);
        engine = "groq";
      } catch (e: any) {
        error = `Groq: ${e.message}`;
      }
    }

    if (!extractedData) {
      return NextResponse.json(
        { error: error || "No AI service available for parsing" },
        { status: 503 }
      );
    }

    // Validate extracted data structure
    if (!Array.isArray(extractedData.results)) {
      return NextResponse.json({ error: "AI returned invalid structure" }, { status: 422 });
    }

    // Sanitize results
    const sanitized = extractedData.results
      .filter((r: any) => r.placement > 0 && r.teamName)
      .map((r: any) => ({
        placement: Math.max(1, parseInt(r.placement) || 1),
        teamName: String(r.teamName).trim().substring(0, 100),
        kills: Math.max(0, parseInt(r.kills) || 0),
        isWWCD: r.placement === 1 || r.isWWCD === true,
      }));

    return NextResponse.json({
      results: sanitized,
      confidence: extractedData.confidence || 0.5,
      warnings: extractedData.warnings || [],
      engine,
      matchId,
      requiresConfirmation: true,
      message: "Review extracted results before saving. AI assistance only — organizer must confirm.",
    });
  } catch (error) {
    console.error("AI parse error:", error);
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }
}