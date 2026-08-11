import { NextRequest, NextResponse } from "next/server";
import { generateAI } from "@/lib/ai";
import { checkRateLimit, getClientIp, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { getSession } from "@/lib/auth/session";
import { requirePro } from "@/lib/auth/rbac";
import { logError } from "@/lib/logger";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit("ai_generate:" + ip, RATE_LIMITS.AI_GENERATE);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many AI requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rl, RATE_LIMITS.AI_GENERATE) }
    );
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { type, data, tone } = body as {
      type?: string;
      data?: unknown;
      tone?: string;
    };

    const safeData = JSON.stringify(data || {}).substring(0, 2000);

    const prompts: Record<string, string> = {
      social:
        "Generate a social media post for this PUBG Mobile tournament result. " +
        (tone === "hype"
          ? "Use exciting, energetic language with emojis."
          : tone === "short"
          ? "Keep it under 30 words."
          : "Professional esports tone.") +
        " Include team name, placement, kills, and TournaOps branding. Data: " +
        safeData,

      commentary:
        "Generate esports " +
        (tone || "professional") +
        " commentary for this PUBG Mobile match result. Keep under 60 words. Data: " +
        safeData,

      summary:
        "Write a 3-sentence tournament summary based ONLY on this data. No invented stats: " +
        safeData,

      "what-if":
        "Given current standings and this hypothetical result, describe what would change in 2 sentences: " +
        safeData,

      discord:
        "Generate a Discord announcement for this PUBG Mobile tournament update. " +
        "Use Discord markdown formatting. Include relevant emojis. Data: " +
        safeData,

      announcement:
        "Generate a professional tournament announcement. Keep under 100 words. Data: " +
        safeData,
    };

    const prompt = prompts[type as string] || prompts.summary;

    const result = await generateAI({
      prompt,
      temperature: tone === "hype" ? 0.9 : 0.7,
      maxTokens: 300,
      preferProvider: "groq",
    });

    if (!result.text) {
      return NextResponse.json({
        error: result.error || "AI generation failed. Please try again.",
        fallback: true,
      }, { status: 200 });
    }

    return NextResponse.json({
      text: result.text,
      type,
      tone,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
    });
  } catch (err) {
    logError(err, "AI_GENERATE");
    return NextResponse.json(
      { error: "AI generation failed. Please try again.", fallback: true },
      { status: 200 }
    );
  }
}
