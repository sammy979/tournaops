import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama3-8b-8192";

function buildPrompt(tool: string, input: string): string {
  switch (tool) {
    case "EXTRACT": return `You are an esports tournament assistant. Extract structured match results from the following scoreboard. Format as: Rank | Team | Kills | Points. Mark missing data as N/A.\n\nInput:\n${input}`;
    case "COMMENTARY": return `You are a professional esports live commentator. Generate exciting live commentary (under 150 words) for this match situation:\n\n${input}`;
    case "SUMMARY": return `You are an esports journalist. Write a professional post-match summary (under 200 words) for social media based on these results:\n\n${input}`;
    default: return input;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { tool, input } = body as Record<string, unknown>;
    const VALID = ["EXTRACT", "COMMENTARY", "SUMMARY"];
    if (!tool || !VALID.includes(String(tool))) return NextResponse.json({ error: "tool must be EXTRACT, COMMENTARY, or SUMMARY" }, { status: 400 });
    if (!input || typeof input !== "string" || input.trim() === "") return NextResponse.json({ error: "input required" }, { status: 400 });

    if (!GROQ_API_KEY) return NextResponse.json({ error: "AI service not configured. Add GROQ_API_KEY to environment." }, { status: 503 });

    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: "You are TournaOps AI, an expert esports tournament assistant for Nepal and South Asia." },
          { role: "user", content: buildPrompt(String(tool), input.trim()) },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error("[AI API] Groq error:", await res.text());
      return NextResponse.json({ error: "AI service error. Please try again." }, { status: 502 });
    }

    const data = await res.json();
    const result = data?.choices?.[0]?.message?.content;
    if (!result) return NextResponse.json({ error: "AI returned empty response" }, { status: 502 });

    return NextResponse.json({ success: true, result: result.trim() });
  } catch (error) {
    console.error("[POST /api/ai]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}