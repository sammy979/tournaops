// app/api/payment-settings/public/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    let settings = null
    try {
      settings = await prisma.paymentSettings.findFirst()
    } catch {
      // Table might not exist yet or query failed - return safe defaults
      settings = null
    }

    if (!settings) {
      return NextResponse.json({
        settings: {
          esewaEnabled: false,
          khaltiEnabled: false,
          bankEnabled: false,
        },
      })
    }

    // Only expose public-safe fields
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
    }

    return NextResponse.json({ settings: publicSettings })
  } catch {
    return NextResponse.json({
      settings: {
        esewaEnabled: false,
        khaltiEnabled: false,
        bankEnabled: false,
      },
    })
  }
}