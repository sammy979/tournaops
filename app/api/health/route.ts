import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: any = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };

  // Check database
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.database = {
      status: "connected",
      latency: Date.now() - dbStart,
    };
  } catch (err) {
    results.database = {
      status: "error",
      error: "Connection failed",
    };
    results.status = "degraded";
  }

  // Check AI providers
  results.ai = {
    provider: process.env.AI_PROVIDER || "groq",
    status: "configured",
    providers: {
      groq: process.env.GROQ_API_KEY ? "configured" : "missing",
      gemini: process.env.GEMINI_API_KEY ? "configured" : "missing",
      openai: process.env.OPENAI_API_KEY ? "configured" : "not-set",
    },
  };

  // Check integrations
  results.integrations = {
    dodo: process.env.DODO_API_KEY ? "configured" : "missing",
    dodoWebhook: process.env.DODO_WEBHOOK_SECRET ? "configured" : "missing",
    resend: process.env.RESEND_API_KEY ? "configured" : "not-set",
    pusher: process.env.PUSHER_KEY ? "configured" : "not-set",
  };

  // Environment info
  results.environment = {
    node: process.version,
    nodeEnv: process.env.NODE_ENV || "development",
    hasJwtSecret: !!process.env.JWT_SECRET,
  };

  const statusCode = results.status === "ok" ? 200 : 503;
  return NextResponse.json(results, { status: statusCode });
}