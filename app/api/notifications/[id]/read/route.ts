// app/api/notifications/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // TODO: Implement when notification model exists
    return NextResponse.json({ success: true, id: params.id })
  } catch {
    return NextResponse.json({ success: false })
  }
}