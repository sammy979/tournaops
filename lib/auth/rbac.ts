// lib/auth/rbac.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, SessionPayload } from "@/lib/auth/session"

/**
 * Requires the user to be a SUPER_ADMIN.
 *
 * Two calling styles supported:
 *
 * 1. API route style (no arguments or NextRequest):
 *    const err = await requireSuperAdmin(req)
 *    if (err) return err  // returns NextResponse with 401/403
 *
 * 2. Server component / layout style (pass session):
 *    const { authorized, user } = await requireSuperAdmin(session)
 *    if (!authorized) redirect("/dashboard")
 */
export async function requireSuperAdmin(
  arg?: NextRequest | SessionPayload | null
): Promise<any> {
  // Determine calling style
  const isServerComponentStyle =
    arg !== undefined && (arg === null || (typeof arg === "object" && "userId" in arg))

  let session: SessionPayload | null

  if (isServerComponentStyle) {
    session = arg as SessionPayload | null
  } else {
    session = await getSession()
  }

  // No session
  if (!session?.userId) {
    if (isServerComponentStyle) {
      return { authorized: false, user: null, reason: "no-session" }
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Look up user
  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        role: true,
        isAdmin: true,
        isPro: true,
        email: true,
      },
    })
  } catch (err) {
    console.error("[rbac] User lookup failed:", err)
    if (isServerComponentStyle) {
      return { authorized: false, user: null, reason: "db-error" }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }

  if (!user) {
    if (isServerComponentStyle) {
      return { authorized: false, user: null, reason: "user-not-found" }
    }
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN" || user.isAdmin === true

  if (!isSuperAdmin) {
    if (isServerComponentStyle) {
      return { authorized: false, user, reason: "not-admin" }
    }
    return NextResponse.json({ error: "Forbidden - admin required" }, { status: 403 })
  }

  if (isServerComponentStyle) {
    return { authorized: true, user, reason: "ok" }
  }
  return null
}

/**
 * Requires the user to be an ORGANIZER or SUPER_ADMIN.
 * Supports both calling styles like requireSuperAdmin.
 */
export async function requireOrganizer(
  arg?: NextRequest | SessionPayload | null
): Promise<any> {
  const isServerComponentStyle =
    arg !== undefined && (arg === null || (typeof arg === "object" && "userId" in arg))

  let session: SessionPayload | null
  if (isServerComponentStyle) {
    session = arg as SessionPayload | null
  } else {
    session = await getSession()
  }

  if (!session?.userId) {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, isAdmin: true },
    })
  } catch {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }

  if (!user) {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  const allowed =
    user.role === "ORGANIZER" ||
    user.role === "SUPER_ADMIN" ||
    user.isAdmin === true

  if (!allowed) {
    if (isServerComponentStyle) return { authorized: false, user }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (isServerComponentStyle) return { authorized: true, user }
  return null
}

/**
 * Requires an active Pro subscription.
 */
export async function requirePro(
  arg?: NextRequest | SessionPayload | null
): Promise<any> {
  const isServerComponentStyle =
    arg !== undefined && (arg === null || (typeof arg === "object" && "userId" in arg))

  let session: SessionPayload | null
  if (isServerComponentStyle) {
    session = arg as SessionPayload | null
  } else {
    session = await getSession()
  }

  if (!session?.userId) {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isPro: true, proExpiresAt: true, role: true, isAdmin: true },
    })
  } catch {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }

  if (!user) {
    if (isServerComponentStyle) return { authorized: false, user: null }
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  // Super admins always have Pro
  if (user.role === "SUPER_ADMIN" || user.isAdmin) {
    if (isServerComponentStyle) return { authorized: true, user }
    return null
  }

  const isProActive =
    user.isPro && (!user.proExpiresAt || new Date(user.proExpiresAt) > new Date())

  if (!isProActive) {
    if (isServerComponentStyle) return { authorized: false, user }
    return NextResponse.json(
      { error: "Pro required", upgrade: "/dashboard/upgrade" },
      { status: 403 }
    )
  }

  if (isServerComponentStyle) return { authorized: true, user }
  return null
}

/**
 * Get the current authenticated user from the database.
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