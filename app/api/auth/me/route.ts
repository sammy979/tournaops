// app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        isAdmin: true,
        isPro: true,
        role: true,
        proExpiresAt: true,
        organizerName: true,
        organizerLogo: true,
        organizerBio: true,
        theme: true,
        createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ user: null }, { status: 401 })

    const isProActive =
      user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date())

    return NextResponse.json({
      user: {
        ...user,
        isPro: isProActive,
      },
    })
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 500 })
  }
}