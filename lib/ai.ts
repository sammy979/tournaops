// ━━━ TournaOps Universal AI Helper (v2) ━━━
// Smart fallback: Gemini → Groq → OpenAI
// Skips rate-limited providers automatically

export interface AIOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  preferProvider?: "gemini" | "groq" | "openai";
}

export interface AIResult {
  text: string | null;
  provider: string | null;
  error?: string;
  fallbackUsed?: boolean;
}

// ━━━ Track rate limit state (in-memory) ━━━
const rateLimitCache = new Map<string, number>();
const RATE_LIMIT_COOLDOWN = 60_000; // 1 minute cooldown

function isRateLimited(provider: string): boolean {
  const until = rateLimitCache.get(provider);
  if (!until) return false;
  if (Date.now() > until) {
    rateLimitCache.delete(provider);
    return false;
  }
  return true;
}

function markRateLimited(provider: string) {
  rateLimitCache.set(provider, Date.now() + RATE_LIMIT_COOLDOWN);
  console.log(`[AI] ${provider} rate limited — cooldown 60s`);
}

// ━━━ MAIN FUNCTION ━━━
export async function generateAI(opts: AIOptions): Promise<AIResult> {
  const { prompt, temperature = 0.7, maxTokens = 300, preferProvider } = opts;
  const envProvider = (process.env.AI_PROVIDER || "").toLowerCase();
  const preferred = preferProvider || envProvider;

  let fallbackUsed = false;

  try {
    // Build ordered list of providers to try
    const providers: string[] = [];
    
    if (preferred === "groq") {
      providers.push("groq", "gemini", "openai");
    } else if (preferred === "openai") {
      providers.push("openai", "groq", "gemini");
    } else {
      // Default: Gemini first (free), then Groq, then OpenAI
      providers.push("gemini", "groq", "openai");
    }

    // Try each provider
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      
      // Skip if rate limited
      if (isRateLimited(provider)) {
        console.log(`[AI] Skipping ${provider} (rate limited)`);
        continue;
      }

      let text: string | null = null;
      let rateLimited = false;

      if (provider === "gemini" && process.env.GEMINI_API_KEY) {
        const result = await callGemini(prompt, temperature, maxTokens);
        text = result.text;
        rateLimited = result.rateLimited;
      } else if (provider === "groq" && process.env.GROQ_API_KEY) {
        const result = await callGroq(prompt, temperature, maxTokens);
        text = result.text;
        rateLimited = result.rateLimited;
      } else if (provider === "openai" && process.env.OPENAI_API_KEY?.startsWith("sk-")) {
        const result = await callOpenAI(prompt, temperature, maxTokens);
        text = result.text;
        rateLimited = result.rateLimited;
      } else {
        continue; // No API key
      }

      if (rateLimited) {
        markRateLimited(provider);
        fallbackUsed = true;
        continue;
      }

      if (text) {
        return { 
          text, 
          provider,
          fallbackUsed: i > 0  // Was fallback if not first attempt
        };
      }

      fallbackUsed = true;
    }

    // All providers failed
    return {
      text: null,
      provider: null,
      error: "All AI providers failed or rate limited. Wait a moment and try again.",
      fallbackUsed
    };

  } catch (e: any) {
    return { text: null, provider: null, error: e.message, fallbackUsed };
  }
}

// ━━━ GEMINI ━━━
async function callGemini(prompt: string, temperature: number, maxTokens: number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { text: null, rateLimited: false };

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

    if (res.status === 429) {
      console.error("[Gemini] Rate limited (429)");
      return { text: null, rateLimited: true };
    }

    if (!res.ok) {
      console.error("[Gemini] Error:", res.status);
      return { text: null, rateLimited: false };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    return { text, rateLimited: false };
  } catch (e: any) {
    console.error("[Gemini] Exception:", e.message);
    return { text: null, rateLimited: false };
  }
}

// ━━━ GROQ ━━━
async function callGroq(prompt: string, temperature: number, maxTokens: number) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { text: null, rateLimited: false };

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

    if (res.status === 429) {
      console.error("[Groq] Rate limited (429)");
      return { text: null, rateLimited: true };
    }

    if (!res.ok) {
      console.error("[Groq] Error:", res.status);
      return { text: null, rateLimited: false };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || null;
    return { text, rateLimited: false };
  } catch (e: any) {
    console.error("[Groq] Exception:", e.message);
    return { text: null, rateLimited: false };
  }
}

// ━━━ OPENAI ━━━
async function callOpenAI(prompt: string, temperature: number, maxTokens: number) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { text: null, rateLimited: false };

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

    if (res.status === 429) return { text: null, rateLimited: true };
    if (!res.ok) return { text: null, rateLimited: false };
    
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || null;
    return { text, rateLimited: false };
  } catch (e: any) {
    console.error("[OpenAI] Exception:", e.message);
    return { text: null, rateLimited: false };
  }
}

// ━━━ HELPER: Quick generate ━━━
export async function quickAI(prompt: string): Promise<string> {
  const result = await generateAI({ prompt });
  return result.text || `[AI unavailable: ${result.error}]`;
}
