// app/api/organizer/profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        displayName: true,
        organizerName: true,
        organizerLogo: true,
        organizerBio: true,
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      profile: {
        displayName: user.displayName,
        organizerName: user.organizerName || user.displayName,
        organizerLogo: user.organizerLogo,
        organizerBio: user.organizerBio,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { organizerName, organizerLogo, organizerBio } = body

    // Validate organizer name
    if (organizerName !== undefined) {
      if (typeof organizerName !== "string") {
        return NextResponse.json({ error: "Invalid organizer name" }, { status: 400 })
      }
      const trimmed = organizerName.trim()
      if (trimmed.length < 2 || trimmed.length > 60) {
        return NextResponse.json(
          { error: "Organizer name must be 2-60 characters" },
          { status: 400 }
        )
      }
    }

    if (organizerBio !== undefined && typeof organizerBio === "string" && organizerBio.length > 500) {
      return NextResponse.json({ error: "Bio too long (max 500 chars)" }, { status: 400 })
    }

    if (organizerLogo !== undefined && typeof organizerLogo === "string" && organizerLogo.length > 1000) {
      return NextResponse.json({ error: "Logo URL too long" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (organizerName !== undefined) data.organizerName = organizerName.trim() || null
    if (organizerBio !== undefined) data.organizerBio = organizerBio?.trim() || null
    if (organizerLogo !== undefined) data.organizerLogo = organizerLogo?.trim() || null

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data,
      select: {
        organizerName: true,
        organizerLogo: true,
        organizerBio: true,
      },
    })

    return NextResponse.json({
      profile: updated,
      message: "Organizer profile updated",
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}