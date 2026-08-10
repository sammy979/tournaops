// app/api/admin/payment-settings/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/auth/rbac"
import { getSession } from "@/lib/auth/session"
import { logSystemError } from "@/lib/system-health/error-logger"

export async function GET(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const settings = await prisma.paymentSettings.findFirst()
    return NextResponse.json({ settings: settings || {} })
  } catch (err) {
    await logSystemError(err, { route: "/api/admin/payment-settings", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authError = await requireSuperAdmin(req)
    if (authError) return authError

    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()

    const allowedFields = [
      "esewaEnabled", "esewaQrUrl", "esewaAccountName", "esewaAccountId", "esewaInstructions",
      "khaltiEnabled", "khaltiQrUrl", "khaltiAccountName", "khaltiAccountId", "khaltiInstructions",
      "bankEnabled", "bankName", "bankAccountHolder", "bankAccountNumber", "bankBranch", "bankInstructions", "bankQrUrl",
      "internationalEnabled",
    ]

    const data: Record<string, unknown> = { updatedBy: session.userId }
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field]
    }

    const existing = await prisma.paymentSettings.findFirst()
    let settings
    if (existing) {
      settings = await prisma.paymentSettings.update({ where: { id: existing.id }, data })
    } else {
      settings = await prisma.paymentSettings.create({ data })
    }

    try {
      await (prisma as any).auditLog?.create({
        data: {
          action: "PAYMENT_SETTINGS_CHANGED",
          actorId: session.userId,
          metadata: JSON.stringify({ updatedFields: Object.keys(data) }),
        },
      })
    } catch {}

    return NextResponse.json({ settings, message: "Payment settings updated" })
  } catch (err) {
    await logSystemError(err, { route: "/api/admin/payment-settings", severity: "ERROR" })
    return NextResponse.json({ error: "Failed to update payment settings" }, { status: 500 })
  }
}