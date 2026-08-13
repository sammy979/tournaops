import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    const { prompt, type } = body as Record<string, unknown>;

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const VALID_TYPES = ["BANNER", "THUMBNAIL", "TEAMCARD", "POSTER"];
    const imageType = type && VALID_TYPES.includes(String(type)) ? String(type) : "BANNER";

    if (!GEMINI_API_KEY) {
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(imageType + " - " + prompt.slice(0, 30))}`;
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        note: "GEMINI_API_KEY not configured. Showing placeholder.",
      });
    }

    const dimensions: Record<string, string> = {
      BANNER: "1280x720 wide landscape",
      THUMBNAIL: "1280x720 YouTube thumbnail",
      TEAMCARD: "800x800 square",
      POSTER: "720x1280 portrait",
    };

    const enhancedPrompt = `${prompt}. ${dimensions[imageType]} format. Esports tournament graphic. Professional quality. Dark background. High contrast.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: enhancedPrompt }],
          parameters: { sampleCount: 1 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[AI Images] Gemini error:", errText);
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(imageType)}`;
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        note: "Gemini image generation failed. Showing placeholder.",
      });
    }

    const geminiData = await geminiRes.json();
    const base64Image = geminiData?.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      const placeholderUrl = `https://placehold.co/1280x720/111111/D4AF37?text=${encodeURIComponent(imageType)}`;
      return NextResponse.json({
        success: true,
        imageUrl: placeholderUrl,
        note: "No image returned from Gemini.",
      });
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("[POST /api/ai-images] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}