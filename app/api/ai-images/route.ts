import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    const { prompt, type } = body as Record<string, unknown>;
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const VALID_TYPES = ["BANNER", "THUMBNAIL", "TEAMCARD", "POSTER"];
    const imageType = type && VALID_TYPES.includes(String(type)) ? String(type) : "BANNER";

    if (!GEMINI_API_KEY) {
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(String(prompt).slice(0, 40))}`;
      return NextResponse.json({ success: true, imageUrl: placeholderUrl, note: "GEMINI_API_KEY not configured" });
    }

    const enhancedPrompt = `${prompt}. Esports tournament graphic. Professional quality. Dark background. High contrast. ${imageType} format.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instances: [{ prompt: enhancedPrompt }], parameters: { sampleCount: 1 } }),
      }
    );

    if (!geminiRes.ok) {
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(imageType)}`;
      return NextResponse.json({ success: true, imageUrl: placeholderUrl, note: "Gemini unavailable" });
    }

    const geminiData = await geminiRes.json();
    const base64Image = geminiData?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(imageType)}`;
      return NextResponse.json({ success: true, imageUrl: placeholderUrl, note: "No image returned" });
    }

    return NextResponse.json({ success: true, imageUrl: `data:image/png;base64,${base64Image}` });
  } catch (error) {
    console.error("[POST /api/ai-images]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}