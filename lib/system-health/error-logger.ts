// lib/system-health/error-logger.ts
import { sanitizeErrorMessage } from "./error-sanitizer"

export type ErrorSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

interface LogErrorOptions {
  severity?: ErrorSeverity
  route?: string
  userId?: string
  tournamentId?: string
  requestId?: string
  metadata?: Record<string, unknown>
}

function generateFingerprint(route: string, errorType: string, message: string): string {
  const normalized = message.replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "[UUID]")
    .replace(/\d+/g, "[N]")
    .slice(0, 200)
  return `${route}::${errorType}::${normalized}`
}

export async function logSystemError(
  error: Error | unknown,
  options: LogErrorOptions = {}
): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma")
    const err = error instanceof Error ? error : new Error(String(error))
    const message = sanitizeErrorMessage(err.message)
    const errorType = err.constructor?.name || "UnknownError"
    const route = options.route || "unknown"
    const fingerprint = generateFingerprint(route, errorType, message)

    await prisma.systemError.upsert({
      where: { fingerprint },
      update: {
        lastSeenAt: new Date(),
        occurrenceCount: { increment: 1 },
        severity: options.severity || "ERROR",
        userId: options.userId,
        tournamentId: options.tournamentId,
        requestId: options.requestId,
        updatedAt: new Date(),
      },
      create: {
        fingerprint,
        severity: options.severity || "ERROR",
        route,
        errorType,
        message,
        requestId: options.requestId,
        userId: options.userId,
        tournamentId: options.tournamentId,
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
        occurrenceCount: 1,
      },
    })
  } catch {
    console.error("[ErrorLogger] Failed to log error:", error)
  }
}
