// app/api/notifications/route.ts
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ notifications: [] })

    // Notifications infrastructure not yet implemented
    // Returns empty array to prevent frontend errors
    // TODO: Implement notifications model in Prisma and wire real data
    return NextResponse.json({ notifications: [] })
  } catch {
    return NextResponse.json({ notifications: [] })
  }
}