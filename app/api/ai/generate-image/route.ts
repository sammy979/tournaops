import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { put } from "@vercel/blob";
import { logError } from "@/lib/logger";

export const maxDuration = 60;

const GEMINI_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation";

type GenResult = { base64: string; mime: string; provider: string };

// ── Provider 1: Gemini (free tier, high quality) ─────────────
async function generateWithGemini(prompt: string): Promise<GenResult | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    GEMINI_IMAGE_MODEL +
    ":generateContent?key=" +
    key;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        temperature: 0.9,
      },
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.warn("[AI_IMAGE] Gemini failed:", res.status, txt.slice(0, 300));
    return null;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p?.inlineData || p?.inline_data;
    if (inline?.data) {
      return {
        base64: inline.data,
        mime: inline.mimeType || inline.mime_type || "image/png",
        provider: "gemini",
      };
    }
  }
  return null;
}

// ── Provider 2: Pollinations (free fallback) ─────────────────
async function generateWithPollinations(
  prompt: string,
  width: number,
  height: number
): Promise<GenResult | null> {
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
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const prompt: string = (body?.prompt || "").toString().trim();
    const width = Number(body?.width) || 1024;
    const height = Number(body?.height) || 1024;
    const style: string = (body?.style || "").toString().trim();

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    if (prompt.length > 1200) {
      return NextResponse.json({ error: "Prompt too long" }, { status: 400 });
    }

    const finalPrompt = style ? prompt + ", " + style : prompt;

    // Try Gemini first, then Pollinations
    let result: GenResult | null = null;
    // Skip Gemini for now (invalid key), use Pollinations directly
    result = await generateWithPollinations(finalPrompt, width, height);

    if (!result) {
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
        });
      } catch (e: any) {
        console.warn("[AI_IMAGE] Blob upload failed:", e?.message);
      }
    }

    // Fallback: return data URL
    return NextResponse.json({
      imageUrl: "data:" + result.mime + ";base64," + result.base64,
      provider: result.provider,
      storage: "base64",
    });
  } catch (err: any) {
    logError(err, "AI_GENERATE_IMAGE");
    return NextResponse.json(
      { error: err?.message || "Image generation failed" },
      { status: 500 }
    );
  }
}