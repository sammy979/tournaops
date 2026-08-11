import { NextRequest, NextResponse } from "next/server";
import { generateAI } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { text, format } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    // Build prompt for parsing PUBG match text
    const prompt = `Parse this PUBG Mobile tournament data into structured JSON.
Extract team names, placements (1-16), and kills.

INPUT TEXT:
${text.substring(0, 3000)}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "teams": [
    { "name": "Team Name", "placement": 1, "kills": 15 }
  ]
}`;

    const result = await generateAI({ 
      prompt, 
      temperature: 0.3,  // Lower = more accurate parsing
      maxTokens: 1500 
    });

    if (!result.text) {
      return NextResponse.json({ 
        error: result.error || "AI failed to parse",
        fallback: true 
      }, { status: 200 });
    }

    // Try to extract JSON from AI response
    let parsed;
    try {
      // Remove markdown code blocks if present
      let cleanJson = result.text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseErr) {
      // If not valid JSON, return raw text
      return NextResponse.json({ 
        raw: result.text,
        provider: result.provider,
        error: "Could not parse AI response as JSON",
        fallback: true 
      });
    }

    return NextResponse.json({ 
      teams: parsed.teams || [],
      provider: result.provider,
      success: true 
    });

  } catch (e: any) {
    console.error("[parse-text] Error:", e.message);
    return NextResponse.json({ error: e.message, fallback: true }, { status: 200 });
  }
}
