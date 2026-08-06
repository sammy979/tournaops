import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { put } from "@vercel/blob";
import { logError } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

type GenResult = { url?: string; base64?: string; mime: string; provider: string };

// ── Provider 1: Together AI (PRO - FLUX quality) ────────────
async function generateWithTogether(
  prompt: string,
  width: number,
  height: number
): Promise<GenResult | null> {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) {
    console.log("[AI_IMAGE] No TOGETHER_API_KEY, skipping");
    return null;
  }

  try {
    const res = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: prompt,
        width: Math.min(width, 1440),
        height: Math.min(height, 1440),
        steps: 4,
        n: 1,
        response_format: "b64_json",
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.warn("[AI_IMAGE] Together failed:", res.status, txt.slice(0, 300));
      return null;
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return null;

    return { base64: b64, mime: "image/png", provider: "together-flux" };
  } catch (e: any) {
    console.warn("[AI_IMAGE] Together error:", e?.message);
    return null;
  }
}

// ── Provider 2: Pollinations (FREE fallback) ────────────────
async function generateWithPollinations(
  prompt: string,
  width: number,
  height: number
): Promise<GenResult | null> {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const url =
      "https://image.pollinations.ai/prompt/" +
      encodeURIComponent(prompt) +
      "?width=" + width +
      "&height=" + height +
      "&seed=" + seed +
      "&model=flux&nologo=true";

    const res = await fetch(url);
    if (!res.ok) {
      console.warn("[AI_IMAGE] Pollinations failed:", res.status);
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    return {
      base64: buf.toString("base64"),
      mime: res.headers.get("content-type") || "image/jpeg",
      provider: "pollinations",
    };
  } catch (e: any) {
    console.warn("[AI_IMAGE] Pollinations error:", e?.message);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Pro
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isPro: true, isAdmin: true },
    });
    const isPro = !!(user?.isPro || user?.isAdmin);

    const body = await req.json();
    const prompt: string = (body?.prompt || "").toString().trim();
    const width = Number(body?.width) || 1024;
    const height = Number(body?.height) || 1024;
    const style: string = (body?.style || "").toString().trim();
    const forceProvider: string = (body?.provider || "").toString().trim();

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.length > 1200) {
      return NextResponse.json({ error: "Prompt too long (max 1200 chars)" }, { status: 400 });
    }

    const finalPrompt = style ? prompt + ", " + style : prompt;

    let result: GenResult | null = null;

    // PRO users get Together AI first, others get Pollinations
    if (isPro || forceProvider === "together") {
      console.log("[AI_IMAGE] Trying Together AI (Pro user)");
      result = await generateWithTogether(finalPrompt, width, height);
    }

    // Fallback to Pollinations for FREE users OR if Together failed
    if (!result) {
      console.log("[AI_IMAGE] Using Pollinations");
      result = await generateWithPollinations(finalPrompt, width, height);
    }

    if (!result || !result.base64) {
      return NextResponse.json(
        { error: "All image providers failed. Try again." },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(result.base64, "base64");
    const ext = result.mime.includes("png") ? "png" : "jpg";
    const filename =
      "ai-images/" + session.userId + "-" + Date.now() + "." + ext;

    // Upload to Vercel Blob for a clean URL
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(filename, buffer, {
          access: "public",
          contentType: result.mime,
          addRandomSuffix: true,
        });
        return NextResponse.json({
          imageUrl: blob.url,
          provider: result.provider,
          storage: "blob",
          isPro: isPro,
        });
      } catch (e: any) {
        console.warn("[AI_IMAGE] Blob upload failed:", e?.message);
      }
    }

    // Fallback: base64 data URL
    return NextResponse.json({
      imageUrl: "data:" + result.mime + ";base64," + result.base64,
      provider: result.provider,
      storage: "base64",
      isPro: isPro,
    });
  } catch (err: any) {
    logError(err, "AI_GENERATE_IMAGE");
    return NextResponse.json(
      { error: err?.message || "Image generation failed" },
      { status: 500 }
    );
  }
}