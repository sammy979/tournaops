// lib/system-health/health-checks.ts
import { prisma } from "@/lib/prisma"

export type HealthStatus = "healthy" | "degraded" | "down" | "unknown"

export interface ServiceHealth {
  name: string
  status: HealthStatus
  message?: string
  latencyMs?: number
  checkedAt: Date
}

export async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return {
      name: "Database",
      status: "healthy",
      latencyMs: Date.now() - start,
      checkedAt: new Date(),
    }
  } catch (err) {
    return {
      name: "Database",
      status: "down",
      message: "Database connection failed",
      latencyMs: Date.now() - start,
      checkedAt: new Date(),
    }
  }
}

export async function checkDiscordHealth(): Promise<ServiceHealth> {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) {
    return { name: "Discord", status: "unknown", message: "Not configured", checkedAt: new Date() }
  }
  const start = Date.now()
  try {
    const res = await fetch("https://discord.com/api/v10/gateway", {
      headers: { Authorization: `Bot ${token}` },
      signal: AbortSignal.timeout(5000),
    })
    return {
      name: "Discord",
      status: res.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
      checkedAt: new Date(),
    }
  } catch {
    return {
      name: "Discord",
      status: "down",
      message: "Discord API unreachable",
      latencyMs: Date.now() - start,
      checkedAt: new Date(),
    }
  }
}

export async function checkStorageHealth(): Promise<ServiceHealth> {
  const bucket = process.env.S3_BUCKET_NAME || process.env.STORAGE_BUCKET
  if (!bucket) {
    return { name: "Storage", status: "unknown", message: "Not configured", checkedAt: new Date() }
  }
  return { name: "Storage", status: "healthy", message: "Configured", checkedAt: new Date() }
}

export async function checkAuthHealth(): Promise<ServiceHealth> {
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!jwtSecret) {
    return { name: "Authentication", status: "down", message: "JWT secret missing", checkedAt: new Date() }
  }
  return { name: "Authentication", status: "healthy", checkedAt: new Date() }
}

export async function checkPaymentHealth(): Promise<ServiceHealth> {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    const hasAnyEnabled = settings?.esewaEnabled || settings?.khaltiEnabled || settings?.bankEnabled
    return {
      name: "Payments",
      status: hasAnyEnabled ? "healthy" : "degraded",
      message: hasAnyEnabled ? "Payment methods configured" : "No payment methods enabled",
      checkedAt: new Date(),
    }
  } catch {
    return { name: "Payments", status: "unknown", message: "Could not check payment settings", checkedAt: new Date() }
  }
}

export async function getAllServiceHealth(): Promise<ServiceHealth[]> {
  const checks = await Promise.allSettled([
    checkDatabaseHealth(),
    checkAuthHealth(),
    checkDiscordHealth(),
    checkStorageHealth(),
    checkPaymentHealth(),
  ])
  return checks.map((result, i) => {
    const names = ["Database", "Authentication", "Discord", "Storage", "Payments"]
    if (result.status === "fulfilled") return result.value
    return { name: names[i], status: "down" as HealthStatus, message: "Check failed", checkedAt: new Date() }
  })
}
