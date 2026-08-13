import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-8b-8192";

function buildPrompt(tool: string, input: string): string {
  switch (tool) {
    case "EXTRACT":
      return `You are an esports tournament assistant. Extract structured match results from the following scoreboard description or screenshot text. Format output as a clean table with: Rank | Team Name | Kills | Points. If data is missing, mark as N/A. Be precise and concise.\n\nInput:\n${input}`;
    case "COMMENTARY":
      return `You are a professional esports live commentator for a PUBG Mobile / battle royale tournament. Generate exciting, dramatic live commentary for the following match situation. Keep it under 150 words. Make it broadcast-ready.\n\nMatch situation:\n${input}`;
    case "SUMMARY":
      return `You are an esports journalist. Write a professional post-match summary based on the following results. Include standout performances, key moments, and final standings. Keep it under 200 words. Suitable for social media and tournament reports.\n\nMatch results:\n${input}`;
    default:
      return input;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Empty body" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { tool, input } = body as Record<string, unknown>;

    const VALID_TOOLS = ["EXTRACT", "COMMENTARY", "SUMMARY"];
    if (!tool || !VALID_TOOLS.includes(String(tool))) {
      return NextResponse.json({ error: "tool must be EXTRACT, COMMENTARY, or SUMMARY" }, { status: 400 });
    }

    if (!input || typeof input !== "string" || input.trim() === "") {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "AI service not configured. Add GROQ_API_KEY to environment." }, { status: 503 });
    }

    const prompt = buildPrompt(String(tool), input.trim());

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: "You are TournaOps AI, an expert esports tournament assistant specialized in PUBG Mobile, BGMI, and battle royale tournaments in Nepal and South Asia.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("[AI API] Groq error:", errText);
      return NextResponse.json({ error: "AI service returned an error. Please try again." }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const result = groqData?.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 502 });
    }

    return NextResponse.json({ success: true, result: result.trim() });
  } catch (error) {
    console.error("[POST /api/ai] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}