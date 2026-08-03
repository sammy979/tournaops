// ━━━ TournaOps Universal AI Helper ━━━
// Supports: Gemini, Groq, OpenAI (in priority order)
// Usage: import { generateAI } from "@/lib/ai";

export interface AIOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIResult {
  text: string | null;
  provider: string | null;
  error?: string;
}

export async function generateAI(opts: AIOptions): Promise<AIResult> {
  const { prompt, temperature = 0.7, maxTokens = 300 } = opts;
  const provider = (process.env.AI_PROVIDER || "").toLowerCase();

  // Try providers in order
  try {
    // 1. Gemini (Google - FREE)
    if ((provider === "gemini" || provider === "") && process.env.GEMINI_API_KEY) {
      const text = await callGemini(prompt, temperature, maxTokens);
      if (text) return { text, provider: "gemini" };
    }

    // 2. Groq (FAST - Llama 3.3)
    if ((provider === "groq" || provider === "") && process.env.GROQ_API_KEY) {
      const text = await callGroq(prompt, temperature, maxTokens);
      if (text) return { text, provider: "groq" };
    }

    // 3. OpenAI (GPT-4o mini)
    if (process.env.OPENAI_API_KEY?.startsWith("sk-")) {
      const text = await callOpenAI(prompt, temperature, maxTokens);
      if (text) return { text, provider: "openai" };
    }

    return { 
      text: null, 
      provider: null, 
      error: "No AI provider configured. Set GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY" 
    };
  } catch (e: any) {
    return { text: null, provider: null, error: e.message };
  }
}

// ━━━ GEMINI ━━━
async function callGemini(prompt: string, temperature: number, maxTokens: number): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens }
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Gemini] Error:", res.status, err);
      return null;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (e: any) {
    console.error("[Gemini] Exception:", e.message);
    return null;
  }
}

// ━━━ GROQ ━━━
async function callGroq(prompt: string, temperature: number, maxTokens: number): Promise<string | null> {
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
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Groq] Error:", res.status, err);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) {
    console.error("[Groq] Exception:", e.message);
    return null;
  }
}

// ━━━ OPENAI ━━━
async function callOpenAI(prompt: string, temperature: number, maxTokens: number): Promise<string | null> {
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
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (e: any) {
    console.error("[OpenAI] Exception:", e.message);
    return null;
  }
}

// ━━━ HELPER: Quick generate ━━━
export async function quickAI(prompt: string): Promise<string> {
  const result = await generateAI({ prompt });
  return result.text || `[AI unavailable: ${result.error}]`;
}
