import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEnvironment } from "@/lib/env-validation";

// ============================================================
// GET /api/health
// Safe for public monitoring (Vercel, UptimeRobot, etc.)
// NEVER exposes: secrets, database contents, user data
// ============================================================

export async function GET(req: NextRequest) {
  const start = Date.now();

  // Check environment
  const env = validateEnvironment();

  // Check database connectivity
  let dbOk = false;
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const totalMs = Date.now() - start;
  const allOk = dbOk && env.valid;

  const response = {
    status: allOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "unknown",
    checks: {
      database: {
        status: dbOk ? "ok" : "error",
        latencyMs: dbLatencyMs,
      },
      environment: {
        status: env.valid ? "ok" : "error",
        // Report which required vars are missing — never their values
        missing: env.missing.length > 0 ? env.missing : undefined,
        optionalMissing: Object.entries(env.report)
          .filter(([, v]) => v === "optional-missing")
          .map(([k]) => k),
      },
    },
    responseMs: totalMs,
  };

  return NextResponse.json(response, {
    status: allOk ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}