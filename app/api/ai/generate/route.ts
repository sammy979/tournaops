import { NextRequest, NextResponse } from "next/server";

// ━━━ AI PROVIDERS SUPPORT ━━━
// Priority: AI_PROVIDER env var → Gemini → Groq → OpenAI → Fallback

export async function POST(req: NextRequest) {
  const { type, data, tone } = await req.json();
  // type: "social" | "commentary" | "summary" | "what-if"
  // tone: "professional" | "hype" | "short" | "caster"

  // Build the prompt
  const prompts: Record<string, string> = {
    social: "Generate a social media post for this PUBG Mobile tournament result. " + 
            (tone === "hype" ? "Use exciting, energetic language with emojis." : 
             tone === "short" ? "Keep it under 30 words." : 
             "Professional esports tone.") + 
            " Include team name, placement, kills, and TournaOps branding. Data: " + 
            JSON.stringify(data).substring(0, 2000),

    commentary: "Generate esports " + (tone || "professional") + 
                " commentary for this PUBG Mobile match result. Keep under 60 words. Data: " + 
                JSON.stringify(data).substring(0, 2000),

    summary: "Write a 3-sentence tournament summary based ONLY on this data. " +
             "No invented stats: " + JSON.stringify(data).substring(0, 2000),

    "what-if": "Given current standings and this hypothetical result, " +
               "describe what would change in 2 sentences: " + 
               JSON.stringify(data).substring(0, 2000),
  };

  const prompt = prompts[type] || prompts.summary;
  const provider = (process.env.AI_PROVIDER || "").toLowerCase();

  try {
    // ━━━ TRY GEMINI FIRST ━━━
    if (provider === "gemini" || process.env.GEMINI_API_KEY) {
      const result = await callGemini(prompt, tone);
      if (result) return NextResponse.json({ text: result, type, tone, method: "gemini" });
    }

    // ━━━ TRY GROQ ━━━
    if (provider === "groq" || process.env.GROQ_API_KEY) {
      const result = await callGroq(prompt, tone);
      if (result) return NextResponse.json({ text: result, type, tone, method: "groq" });
    }

    // ━━━ TRY OPENAI ━━━
    if (process.env.OPENAI_API_KEY?.startsWith("sk-")) {
      const result = await callOpenAI(prompt, tone);
      if (result) return NextResponse.json({ text: result, type, tone, method: "openai" });
    }

    // ━━━ FALLBACK ━━━
    return NextResponse.json({ 
      error: "No AI provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY", 
      fallback: true 
    }, { status: 200 });

  } catch (e: any) {
    console.error("[AI] Error:", e.message);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GEMINI (Google) — FREE, FAST, EXCELLENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callGemini(prompt: string, tone: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    // Using gemini-2.0-flash (fastest, free tier)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: tone === "hype" ? 0.9 : 0.7,
          maxOutputTokens: 300,
        }
      }),
    });

    if (!res.ok) {
      console.error("[Gemini] Failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e: any) {
    console.error("[Gemini] Error:", e.message);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GROQ — SUPER FAST (Llama 3.1 70B)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callGroq(prompt: string, tone: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: tone === "hype" ? 0.9 : 0.7,
      }),
    });

    if (!res.ok) {
      console.error("[Groq] Failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) {
    console.error("[Groq] Error:", e.message);
    return null;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPENAI (Original — kept as fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function callOpenAI(prompt: string, tone: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: tone === "hype" ? 0.9 : 0.7,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) {
    console.error("[OpenAI] Error:", e.message);
    return null;
  }
}
