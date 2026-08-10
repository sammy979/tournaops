// app/api/notifications/read-all/route.ts
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // TODO: Implement when notification model exists
    return NextResponse.json({ success: true, marked: 0 })
  } catch {
    return NextResponse.json({ success: false })
  }
}