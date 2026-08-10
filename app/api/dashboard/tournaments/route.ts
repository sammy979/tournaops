// app/api/dashboard/tournaments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // SUPER_ADMIN sees all tournaments
    // Otherwise, use tournaments owned by the user
    // The Tournament model uses userId (owner), not organizerId
    const where =
      session.role === "SUPER_ADMIN" || session.isAdmin
        ? {}
        : { userId: session.userId }

    const tournaments = await prisma.tournament.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        game: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 50,
    })

    return NextResponse.json({ tournaments })
  } catch (err) {
    console.error("Dashboard tournaments error:", err)
    return NextResponse.json({ tournaments: [] })
  }
}