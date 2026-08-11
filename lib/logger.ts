import { NextRequest } from "next/server";

// ============================================================
// lib/logger.ts
// Structured logging for TournaOps
// NEVER logs: passwords, API keys, JWT secrets, tokens
// ============================================================

type LogLevel = "debug" | "info" | "warn" | "error";

// ============================================================
// SENSITIVE FIELD REDACTION
// ============================================================

const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "key",
  "authorization",
  "cookie",
  "jwt",
  "apiKey",
  "api_key",
  "DATABASE_URL",
  "databaseUrl",
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "OPENAI_API_KEY",
];

function redactSensitive(data: Record<string, unknown>): Record<string, unknown> {
  const redacted: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    const lower = k.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some((f) =>
      lower.includes(f.toLowerCase())
    );
    redacted[k] = isSensitive ? "[REDACTED]" : v;
  }
  return redacted;
}

// ============================================================
// CORE LOG FUNCTION
// ============================================================

function log(
  level: LogLevel,
  message: string,
  context?: string,
  data?: Record<string, unknown>
): void {
  const ts = new Date().toISOString();
  const prefix = context ? `[${context}]` : "";
  const safe = data ? redactSensitive(data) : undefined;
  const full = `${ts} ${level.toUpperCase()} ${prefix} ${message}`;

  switch (level) {
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(full, safe ?? "");
      }
      break;
    case "info":
      console.info(full, safe ?? "");
      break;
    case "warn":
      console.warn(full, safe ?? "");
      break;
    case "error":
      console.error(full, safe ?? "");
      break;
  }
}

// ============================================================
// PUBLIC LOGGER
// ============================================================

export const logger = {
  debug: (msg: string, ctx?: string, data?: Record<string, unknown>) =>
    log("debug", msg, ctx, data),
  info: (msg: string, ctx?: string, data?: Record<string, unknown>) =>
    log("info", msg, ctx, data),
  warn: (msg: string, ctx?: string, data?: Record<string, unknown>) =>
    log("warn", msg, ctx, data),
  error: (msg: string, ctx?: string, data?: Record<string, unknown>) =>
    log("error", msg, ctx, data),
};

// ============================================================
// REQUEST LOGGER — safe to use in API routes
// ============================================================

export function logRequest(
  request: NextRequest,
  context: string,
  extra?: Record<string, unknown>
): void {
  logger.info(`${request.method} ${request.nextUrl.pathname}`, context, {
    ...(extra ?? {}),
  });
}

// ============================================================
// ERROR LOGGER — never exposes stack in production
// ============================================================

export function logError(
  error: unknown,
  context: string,
  extra?: Record<string, unknown>
): void {
  const isDev = process.env.NODE_ENV !== "production";
  const message =
    error instanceof Error ? error.message : "Unknown error";
  const stack =
    isDev && error instanceof Error ? error.stack : undefined;

  logger.error(message, context, {
    ...(extra ?? {}),
    ...(stack ? { stack } : {}),
  });
}
