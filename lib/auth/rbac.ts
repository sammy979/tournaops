// lib/auth/rbac.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth/session"

/**
 * Requires the user to be a SUPER_ADMIN.
 * Returns null if authorized, or a NextResponse with error if not.
 */
export async function requireSuperAdmin(_req?: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Verify against database (session role may be stale)
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      isAdmin: true,
      isPro: true,
      email: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  // Allow SUPER_ADMIN role OR legacy isAdmin flag
  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.isAdmin === true

  if (!isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden - admin access required" }, { status: 403 })
  }

  return null
}

/**
 * Requires the user to be an ORGANIZER or SUPER_ADMIN.
 */
export async function requireOrganizer(_req?: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      isAdmin: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  const allowed =
    user.role === "ORGANIZER" ||
    user.role === "SUPER_ADMIN" ||
    user.isAdmin === true

  if (!allowed) {
    return NextResponse.json({ error: "Forbidden - organizer access required" }, { status: 403 })
  }

  return null
}

/**
 * Requires the user to have an active Pro subscription.
 * Server-side check respecting proExpiresAt.
 */
export async function requirePro(_req?: NextRequest): Promise<NextResponse | null> {
  const session = await getSession()

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      isPro: true,
      proExpiresAt: true,
      role: true,
      isAdmin: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  // Super admins have Pro access automatically
  if (user.role === "SUPER_ADMIN" || user.isAdmin) return null

  // Check Pro status with expiration
  const isProActive =
    user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date())

  if (!isProActive) {
    return NextResponse.json(
      { error: "Pro subscription required", upgrade: "/dashboard/upgrade" },
      { status: 403 }
    )
  }

  return null
}

/**
 * Get the current authenticated user from database.
 * Returns null if not authenticated.
 */
export async function getAuthUser() {
  const session = await getSession()
  if (!session?.userId) return null

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      role: true,
      isAdmin: true,
      isPro: true,
      proExpiresAt: true,
      organizerName: true,
      organizerLogo: true,
    },
  })
}