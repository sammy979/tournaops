import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  // Check database
  let dbStatus = "ok";
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch {
    dbStatus = "error";
  }

  // Check AI provider
  const aiProvider = process.env.AI_PROVIDER || "groq";
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  const totalLatency = Date.now() - start;
  const healthy = dbStatus === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      latency: totalLatency,
      services: {
        database: {
          status: dbStatus,
          latency: dbLatency,
          provider: "postgresql",
        },
        ai: {
          status: "ok",
          provider: aiProvider,
          groq: hasGroq,
          gemini: hasGemini,
        },
      },
      environment: process.env.NODE_ENV,
    },
    { status: healthy ? 200 : 503 }
  );
}