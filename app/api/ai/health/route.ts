// app/api/ai/health/route.ts
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

  if (!key) {
    return NextResponse.json({
      status: "missing",
      configured: false,
      message: "GEMINI_API_KEY not set in environment",
      hint: "Add to Vercel: Settings → Environment Variables",
    }, { status: 503 })
  }

  // Test the key with a simple request
  try {
    const testRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!testRes.ok) {
      const err = await testRes.text()
      return NextResponse.json({
        status: "invalid",
        configured: true,
        keyLength: key.length,
        keyPrefix: key.substring(0, 6) + "...",
        error: `Gemini API returned ${testRes.status}`,
        details: err.substring(0, 300),
      }, { status: 502 })
    }

    const data = await testRes.json()
    const models = data.models?.map((m: any) => m.name).slice(0, 3) || []

    return NextResponse.json({
      status: "healthy",
      configured: true,
      keyLength: key.length,
      keyPrefix: key.substring(0, 6) + "...",
      availableModels: models,
      message: "Gemini AI is working correctly",
    })
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      configured: true,
      error: err?.message || "Failed to reach Gemini API",
    }, { status: 500 })
  }
}