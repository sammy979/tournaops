import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, style, aspectRatio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Enhanced prompt for gaming/tournament context
    const enhancedPrompt = `${prompt}. Style: ${style || "esports poster"}, professional PUBG Mobile tournament graphic, cinematic lighting, high quality, 4k, dramatic composition`;

    // Try Pollinations AI (FREE, no API key needed!)
    const width = aspectRatio === "16:9" ? 1920 : aspectRatio === "9:16" ? 1080 : 1024;
    const height = aspectRatio === "16:9" ? 1080 : aspectRatio === "9:16" ? 1920 : 1024;
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux`;

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      width,
      height,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json({
      error: error?.message || "Failed to generate image",
    }, { status: 500 });
  }
}