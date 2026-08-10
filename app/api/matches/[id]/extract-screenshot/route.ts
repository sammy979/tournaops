// app/api/matches/[id]/extract-screenshot/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"

/**
 * AI Screenshot Extractor
 * Accepts: { imageUrl: string }
 * Returns: { teams: [{ teamName, placement, kills, confidence }] }
 *
 * Uses Google Gemini Vision API to extract match results from screenshots.
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const matchId = resolvedParams.id

    if (!matchId) {
      return NextResponse.json({ error: "Missing match ID" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { imageUrl } = body as { imageUrl?: string }

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl required" }, { status: 400 })
    }

    // Verify match exists and user has access
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        stage: {
          include: {
            tournament: { select: { id: true, userId: true } },
          },
        },
      },
    })

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Check ownership (unless admin)
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, isAdmin: true },
    })
    const isAdmin = user?.role === "SUPER_ADMIN" || user?.isAdmin
    if (!isAdmin && match.stage.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch image
    let imageBuffer: Buffer
    let mimeType = "image/jpeg"
    try {
      const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) })
      if (!imgRes.ok) throw new Error("Failed to fetch image")
      mimeType = imgRes.headers.get("content-type") || "image/jpeg"
      const arrayBuffer = await imgRes.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
      if (imageBuffer.length > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 400 })
      }
    } catch (err) {
      return NextResponse.json({ error: "Could not download image from URL" }, { status: 400 })
    }

    // Call Gemini Vision API
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured (missing GEMINI_API_KEY)" },
        { status: 503 }
      )
    }

    const prompt = `You are an expert at reading PUBG Mobile / BGMI match result screenshots.
Extract EVERY team from the results table in this image.

For each team, provide:
- teamName: exact team name/tag as shown (preserve capitalization, brackets, tags)
- placement: final position (1 = first place, 2 = second, etc.)
- kills: total team kills for this match

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "teams": [
    { "teamName": "TEAM_NAME", "placement": 1, "kills": 12 },
    { "teamName": "TEAM_NAME", "placement": 2, "kills": 8 }
  ]
}

If you cannot read the screenshot clearly, return: { "teams": [] }`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(60000),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "")
      console.error("Gemini API error:", geminiRes.status, errText.substring(0, 200))
      return NextResponse.json(
        { error: "AI extraction failed. Try a clearer screenshot." },
        { status: 502 }
      )
    }

    const geminiData = await geminiRes.json()
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ""

    let parsed: any
    try {
      // Clean up any markdown wrapping
      const cleaned = text
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim()
      parsed = JSON.parse(cleaned)
    } catch (err) {
      console.error("Failed to parse Gemini response:", text.substring(0, 200))
      return NextResponse.json(
        { error: "AI returned invalid data. Try a different screenshot." },
        { status: 502 }
      )
    }

    const teams = Array.isArray(parsed?.teams) ? parsed.teams : []

    if (teams.length === 0) {
      return NextResponse.json(
        { error: "No teams detected. Ensure the screenshot shows the full results leaderboard." },
        { status: 400 }
      )
    }

    // Normalize + validate
    const cleanTeams = teams
      .filter((t: any) => t?.teamName)
      .map((t: any) => ({
        teamName: String(t.teamName).trim().slice(0, 60),
        placement: Math.max(0, Math.min(50, parseInt(t.placement) || 0)),
        kills: Math.max(0, Math.min(200, parseInt(t.kills) || 0)),
        confidence: 0.9,
      }))
      .filter((t: any) => t.teamName.length > 0)

    return NextResponse.json({
      teams: cleanTeams,
      count: cleanTeams.length,
      source: "gemini-2.0-flash",
    })
  } catch (err: any) {
    await logSystemError(err, {
      route: "/api/matches/[id]/extract-screenshot",
      severity: "ERROR",
    })
    return NextResponse.json(
      { error: err?.message || "Extraction failed" },
      { status: 500 }
    )
  }
}