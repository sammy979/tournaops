import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/system-status
 * Verifies every configured API/integration is reachable and configured.
 * Never exposes secret values — only presence + validity.
 */
export async function GET() {
  const checks: Record<string, { configured: boolean; status: "ok" | "missing" | "invalid" | "unknown"; message?: string; latencyMs?: number }> = {};

  // ── 1. DATABASE (Prisma / Postgres) ────────────────────────────────────────
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { configured: true, status: "ok", latencyMs: Date.now() - dbStart };
  } catch (err: any) {
    checks.database = { configured: !!process.env.DATABASE_URL, status: "invalid", message: err?.message?.substring(0, 100) };
  }

  // ── 2. GROQ AI ─────────────────────────────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    checks.groq = { configured: false, status: "missing", message: "GROQ_API_KEY not set" };
  } else {
    const gStart = Date.now();
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${groqKey}` },
        signal: AbortSignal.timeout(6000),
      });
      checks.groq = res.ok
        ? { configured: true, status: "ok",      latencyMs: Date.now() - gStart }
        : { configured: true, status: "invalid", message: `HTTP ${res.status}` };
    } catch (err: any) {
      checks.groq = { configured: true, status: "invalid", message: err?.message?.substring(0, 100) };
    }
  }

  // ── 3. GEMINI AI ───────────────────────────────────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    checks.gemini = { configured: false, status: "missing", message: "GEMINI_API_KEY not set" };
  } else {
    const gStart = Date.now();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`, {
        signal: AbortSignal.timeout(6000),
      });
      checks.gemini = res.ok
        ? { configured: true, status: "ok",      latencyMs: Date.now() - gStart }
        : { configured: true, status: "invalid", message: `HTTP ${res.status}` };
    } catch (err: any) {
      checks.gemini = { configured: true, status: "invalid", message: err?.message?.substring(0, 100) };
    }
  }

  // ── 4. DODO PAYMENTS ───────────────────────────────────────────────────────
  checks.dodoPayments = {
    configured: !!(process.env.DODO_API_KEY && process.env.DODO_WEBHOOK_SECRET),
    status:     (process.env.DODO_API_KEY && process.env.DODO_WEBHOOK_SECRET) ? "ok" : "missing",
    message:    (process.env.DODO_API_KEY && process.env.DODO_WEBHOOK_SECRET) ? undefined : "DODO_API_KEY or DODO_WEBHOOK_SECRET not set",
  };

  // ── 5. VERCEL BLOB STORAGE ─────────────────────────────────────────────────
  checks.blobStorage = {
    configured: !!process.env.BLOB_READ_WRITE_TOKEN,
    status:     process.env.BLOB_READ_WRITE_TOKEN ? "ok" : "missing",
    message:    process.env.BLOB_READ_WRITE_TOKEN ? undefined : "BLOB_READ_WRITE_TOKEN not set",
  };

  // ── 6. JWT (auth secret) ───────────────────────────────────────────────────
  checks.jwt = {
    configured: !!process.env.JWT_SECRET,
    status:     process.env.JWT_SECRET ? "ok" : "missing",
    message:    process.env.JWT_SECRET ? undefined : "JWT_SECRET not set",
  };

  // ── 7. PAYMENT SETTINGS in DB (Nepal payment methods) ──────────────────────
  try {
    const settings = await prisma.paymentSettings.findFirst();
    const enabled = [];
    if (settings?.esewaEnabled)  enabled.push("eSewa");
    if (settings?.khaltiEnabled) enabled.push("Khalti");
    if (settings?.bankEnabled)   enabled.push("Bank");
    checks.nepalPayments = {
      configured: enabled.length > 0,
      status:     enabled.length > 0 ? "ok" : "missing",
      message:    enabled.length > 0 ? `Active: ${enabled.join(", ")}` : "No payment methods enabled in admin",
    };
  } catch {
    checks.nepalPayments = { configured: false, status: "unknown", message: "Could not read PaymentSettings" };
  }

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  const total   = Object.keys(checks).length;
  const okCount = Object.values(checks).filter(c => c.status === "ok").length;
  const allOk   = okCount === total;

  return NextResponse.json({
    status: allOk ? "healthy" : "degraded",
    summary: `${okCount}/${total} services operational`,
    timestamp: new Date().toISOString(),
    checks,
  }, {
    status: allOk ? 200 : 207,
    headers: { "Cache-Control": "no-store" },
  });
}