import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { type, data, tone } = await req.json();
  // type: "social" | "commentary" | "summary" | "what-if"
  // tone: "professional" | "hype" | "short" | "caster"

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !apiKey.startsWith("sk-")) {
    return NextResponse.json({ error: "AI not configured", fallback: true }, { status: 200 });
  }

  const prompts: Record<string, string> = {
    social: "Generate a social media post for this PUBG Mobile tournament result. " + (tone === "hype" ? "Use exciting, energetic language with emojis." : tone === "short" ? "Keep it under 30 words." : "Professional esports tone.") + " Include team name, placement, kills, and TournaOps branding. Data: " + JSON.stringify(data).substring(0, 2000),

    commentary: "Generate esports " + (tone || "professional") + " commentary for this PUBG Mobile match result. Keep under 60 words. Data: " + JSON.stringify(data).substring(0, 2000),

    summary: "Write a 3-sentence tournament summary based ONLY on this data. No invented stats: " + JSON.stringify(data).substring(0, 2000),

    "what-if": "Given current standings and this hypothetical result, describe what would change in 2 sentences: " + JSON.stringify(data).substring(0, 2000),
  };

  const prompt = prompts[type] || prompts.summary;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: tone === "hype" ? 0.9 : 0.7,
      }),
    });

    if (res.ok) {
      const aiData = await res.json();
      const text = aiData.choices?.[0]?.message?.content?.trim() || "";
      return NextResponse.json({ text, type, tone, method: "ai" });
    }

    return NextResponse.json({ error: "AI call failed", fallback: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, fallback: true });
  }
}