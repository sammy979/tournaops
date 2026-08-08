import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";

export const maxDuration = 60;

async function extractWithGroq(imageBase64: string, teams: string[]): Promise<any> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;

  const knownTeams = teams.length > 0 ? teams.join(", ") : "";

  const prompt = `Extract PUBG Mobile match results from this screenshot.
${knownTeams ? "Known teams in this tournament: " + knownTeams : ""}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "map": "Erangel",
  "results": [
    { "teamName": "TSM", "placement": 1, "kills": 12 },
    { "teamName": "GodLike", "placement": 2, "kills": 8 }
  ]
}

Rules:
- placement 1 = WWCD (Winner Winner Chicken Dinner)
- If team name is not readable, use best guess from known teams list
- Include ALL visible teams in the screenshot
- Kills = total team kills, not individual player kills`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: "data:image/png;base64," + imageBase64 } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn("[EXTRACT] Groq vision failed:", res.status, txt.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      return null;
    }
  } catch (e: any) {
    console.warn("[EXTRACT] Groq vision error:", e?.message);
    return null;
  }
}

async function extractWithTogether(imageBase64: string, teams: string[]): Promise<any> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) return null;

  const knownTeams = teams.length > 0 ? teams.join(", ") : "";

  const prompt = `Extract PUBG Mobile match results from this screenshot.
${knownTeams ? "Known teams: " + knownTeams : ""}

Return ONLY JSON: {"map":"Erangel","results":[{"teamName":"X","placement":1,"kills":10}]}
placement 1 = WWCD. Include all visible teams.`;

  try {
    const res = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-Vision-Free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: "data:image/jpeg;base64," + imageBase64 } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      }),
    });

    if (!res.ok) {
      console.warn("[EXTRACT] Together vision failed:", res.status);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch (e: any) {
    console.warn("[EXTRACT] Together error:", e?.message);
    return null;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

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

    const imageBase64 = body.imageBase64 as string;
    const teams = Array.isArray(body.teams) ? body.teams as string[] : [];

    if (!imageBase64 || imageBase64.length < 100) {
      return NextResponse.json({ error: "Valid imageBase64 required" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    // Try Groq first (Llama 4 Scout Vision), then Together (Llama Vision Free)
    let result = await extractWithGroq(cleanBase64, teams);
    if (!result) result = await extractWithTogether(cleanBase64, teams);

    if (!result || !Array.isArray(result.results)) {
      return NextResponse.json(
        { error: "AI could not read the screenshot. Try a clearer image or enter results manually." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      map: result.map || "Erangel",
      results: result.results,
      provider: "vision-ai",
    });
  } catch (err) {
    logError(err, "EXTRACT_SCREENSHOT");
    return NextResponse.json(
      { error: "Failed to extract screenshot data" },
      { status: 500 }
    );
  }
}