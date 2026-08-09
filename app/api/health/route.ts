import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  let dbStatus = "ok";
  let dbMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbMs = Date.now() - start;
  } catch {
    dbStatus = "error";
  }

  const status = dbStatus === "ok" ? 200 : 503;

  return NextResponse.json({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    environment: process.env.VERCEL_ENV || "development",
    services: {
      database: { status: dbStatus, latencyMs: dbMs },
      email: { status: process.env.RESEND_API_KEY ? "configured" : "missing" },
      ai: { status: (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) ? "configured" : "missing" },
      payments: { status: process.env.DODO_API_KEY ? "configured" : "missing" },
      storage: { status: process.env.BLOB_READ_WRITE_TOKEN ? "configured" : "missing" },
    },
  }, { status });
}