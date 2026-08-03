import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text, scoringRule } = await req.json();

  if (!text || text.trim().length < 10) {
    return NextResponse.json({ error: "Text too short" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Try AI first
  if (apiKey && apiKey.startsWith("sk-")) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{
            role: "system",
            content: "You extract PUBG Mobile match results from messy text. Return ONLY valid JSON: {\"teams\":[{\"teamName\":\"NAME\",\"placement\":1,\"kills\":8,\"confidence\":95}],\"format\":\"detected_format\",\"confidence\":90}. Do NOT guess. If unclear, set low confidence."
          }, {
            role: "user",
            content: "Extract match results from this text:\n\n" + text.substring(0, 3000)
          }],
          max_tokens: 1500,
          temperature: 0.1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || "";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            ...parsed,
            method: "ai",
            teams: (parsed.teams || []).map((t: any) => ({
              teamName: String(t.teamName || "").trim(),
              placement: parseInt(t.placement) || 0,
              kills: parseInt(t.kills) || 0,
              confidence: parseInt(t.confidence) || 50,
            })),
          });
        }
      }
    } catch (e: any) {
      console.error("AI parse failed:", e.message);
    }
  }

  // Fallback: regex parsing
  const lines = text.split(/\r?\n/).filter((l: string) => l.trim());
  const teams: any[] = [];
  const patterns = [
    /(\d+)\.\s*(.+?)\s+(\d+)\s*(?:kills?|k)/i,
    /(.+?)\s+(\d+)(?:st|nd|rd|th)\s+(\d+)\s*(?:kills?|k)/i,
    /(\d+)\.\s*(.+?)\s*[-|]\s*(\d+)/,
  ];

  lines.forEach((line: string, idx: number) => {
    for (const pattern of patterns) {
      const m = line.match(pattern);
      if (m) {
        teams.push({
          teamName: (m[2] || m[1]).trim(),
          placement: parseInt(m[1]) || idx + 1,
          kills: parseInt(m[3]) || 0,
          confidence: 70,
        });
        return;
      }
    }
  });

  return NextResponse.json({
    teams,
    format: teams.length > 0 ? "REGEX_FALLBACK" : "UNKNOWN",
    confidence: teams.length > 0 ? 60 : 0,
    method: "regex",
  });
}