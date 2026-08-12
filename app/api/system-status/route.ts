import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ServiceStatus {
  service: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  latency?: number;
  message?: string;
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { service: "database", status: "healthy", latency: Date.now() - start };
  } catch {
    return { service: "database", status: "down", message: "Database connection failed" };
  }
}

async function checkGroq(): Promise<ServiceStatus> {
  const start = Date.now();
  if (!process.env.GROQ_API_KEY) {
    return { service: "groq", status: "unknown", message: "Not configured" };
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { service: "groq", status: "healthy", latency: Date.now() - start };
    return { service: "groq", status: "degraded", message: `HTTP ${res.status}` };
  } catch {
    return { service: "groq", status: "down", message: "Groq API unreachable" };
  }
}

async function checkGemini(): Promise<ServiceStatus> {
  const start = Date.now();
  if (!process.env.GEMINI_API_KEY) {
    return { service: "gemini", status: "unknown", message: "Not configured" };
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) return { service: "gemini", status: "healthy", latency: Date.now() - start };
    return { service: "gemini", status: "degraded", message: `HTTP ${res.status}` };
  } catch {
    return { service: "gemini", status: "down", message: "Gemini API unreachable" };
  }
}

async function checkDodoPayments(): Promise<ServiceStatus> {
  const start = Date.now();
  if (!process.env.DODO_API_KEY) {
    return { service: "dodoPayments", status: "unknown", message: "Not configured" };
  }
  try {
    const res = await fetch("https://api.dodopayments.com/v1/health", {
      headers: { Authorization: `Bearer ${process.env.DODO_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return { service: "dodoPayments", status: "healthy", latency: Date.now() - start };
    return { service: "dodoPayments", status: "degraded", message: `HTTP ${res.status}` };
  } catch {
    return { service: "dodoPayments", status: "unknown", message: "Could not reach Dodo Payments API" };
  }
}

async function checkBlobStorage(): Promise<ServiceStatus> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { service: "blobStorage", status: "unknown", message: "Not configured" };
  }
  // Vercel Blob is available if token is present; we validate format only
  const tokenValid = process.env.BLOB_READ_WRITE_TOKEN.length > 10;
  return {
    service: "blobStorage",
    status: tokenValid ? "healthy" : "degraded",
    message: tokenValid ? undefined : "Token appears invalid",
  };
}

async function checkJwt(): Promise<ServiceStatus> {
  if (!process.env.JWT_SECRET) {
    return { service: "jwt", status: "down", message: "JWT_SECRET not configured" };
  }
  const valid = process.env.JWT_SECRET.length >= 32;
  return {
    service: "jwt",
    status: valid ? "healthy" : "degraded",
    message: valid ? undefined : "JWT_SECRET may be too short",
  };
}

async function checkNepalPayments(): Promise<ServiceStatus> {
  // Nepal payments (eSewa/Khalti) are manual confirmation — check if configured
  const hasEsewa = !!(process.env.ESEWA_MERCHANT_CODE);
  const hasKhalti = !!(process.env.KHALTI_SECRET_KEY);
  if (!hasEsewa && !hasKhalti) {
    return { service: "nepalPayments", status: "unknown", message: "eSewa/Khalti not configured — manual confirmation mode" };
  }
  return { service: "nepalPayments", status: "healthy", message: "Manual payment confirmation active" };
}

export async function GET(req: NextRequest) {
  const start = Date.now();

  try {
    const [database, groq, gemini, dodoPayments, blobStorage, jwt, nepalPayments] =
      await Promise.allSettled([
        checkDatabase(),
        checkGroq(),
        checkGemini(),
        checkDodoPayments(),
        checkBlobStorage(),
        checkJwt(),
        checkNepalPayments(),
      ]);

    const services: ServiceStatus[] = [database, groq, gemini, dodoPayments, blobStorage, jwt, nepalPayments].map(
      (result) => {
        if (result.status === "fulfilled") return result.value;
        return { service: "unknown", status: "down" as const, message: "Check failed unexpectedly" };
      }
    );

    const overallStatus = services.every((s) => s.status === "healthy")
      ? "healthy"
      : services.some((s) => s.status === "down")
      ? "degraded"
      : "partial";

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
      services,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - start,
        services: [],
        message: "System status check failed",
      },
      { status: 500 }
    );
  }
}