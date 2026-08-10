// app/api/payment-settings/public/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.paymentSettings.findFirst()
    if (!settings) return NextResponse.json({ settings: null })

    // Only expose public-safe fields, no admin info
    const publicSettings = {
      esewaEnabled: settings.esewaEnabled,
      esewaQrUrl: settings.esewaQrUrl,
      esewaAccountName: settings.esewaAccountName,
      esewaAccountId: settings.esewaAccountId,
      esewaInstructions: settings.esewaInstructions,
      khaltiEnabled: settings.khaltiEnabled,
      khaltiQrUrl: settings.khaltiQrUrl,
      khaltiAccountName: settings.khaltiAccountName,
      khaltiAccountId: settings.khaltiAccountId,
      khaltiInstructions: settings.khaltiInstructions,
      bankEnabled: settings.bankEnabled,
      bankName: settings.bankName,
      bankAccountHolder: settings.bankAccountHolder,
      bankAccountNumber: settings.bankAccountNumber,
      bankBranch: settings.bankBranch,
      bankInstructions: settings.bankInstructions,
      // internationalEnabled is never exposed publicly
    }

    return NextResponse.json({ settings: publicSettings })
  } catch {
    return NextResponse.json({ settings: null })
  }
}
