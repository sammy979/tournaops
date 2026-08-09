// lib/auth/rbac.ts
// Role-based access control helpers for TournaOps
// SUPER_ADMIN: platform owner only
// ORGANIZER: tournament owner/operator
// USER: normal user (default)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/session";

export type UserRole = "USER" | "ORGANIZER" | "SUPER_ADMIN";

// ============================================================
// SERVER-SIDE ROLE CHECK — always hits DB, never trust session role
// Use this in every /api/admin/* and /api/pro/* route
// ============================================================

export interface RoleCheckResult {
  authorized: boolean;
  errorResponse: NextResponse | null;
  user?: { id: string; role: UserRole; isAdmin: boolean; isPro: boolean; email: string };
}

export async function requireSuperAdmin(session: SessionPayload | null): Promise<RoleCheckResult> {
  if (!session) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isAdmin: true, isPro: true, email: true },
  });

  if (!user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  const isSuper = user.role === "SUPER_ADMIN" || user.isAdmin === true;

  if (!isSuper) {
    // Return 404 to hide existence of admin routes from non-admins
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }

  return {
    authorized: true,
    errorResponse: null,
    user: {
      id: user.id,
      role: user.role as UserRole,
      isAdmin: user.isAdmin,
      isPro: user.isPro,
      email: user.email,
    },
  };
}

export async function requirePro(session: SessionPayload | null): Promise<RoleCheckResult> {
  if (!session) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "Authentication required" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, isAdmin: true, isPro: true, email: true },
  });

  if (!user) {
    return {
      authorized: false,
      errorResponse: NextResponse.json({ error: "User not found" }, { status: 401 }),
    };
  }

  // Super admins always have Pro access
  const hasPro = user.isPro || user.role === "SUPER_ADMIN" || user.isAdmin;

  if (!hasPro) {
    return {
      authorized: false,
      errorResponse: NextResponse.json(
        { error: "Pro plan required", upgradeUrl: "/dashboard/upgrade" },
        { status: 402 }
      ),
    };
  }

  return {
    authorized: true,
    errorResponse: null,
    user: {
      id: user.id,
      role: user.role as UserRole,
      isAdmin: user.isAdmin,
      isPro: user.isPro,
      email: user.email,
    },
  };
}

// ============================================================
// CLIENT-SAFE HELPERS — for UI hints only, NEVER for security
// ============================================================

export function hasSuperAdmin(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.role === "SUPER_ADMIN" || session.isAdmin === true;
}

export function hasPro(session: SessionPayload | null): boolean {
  if (!session) return false;
  return session.isPro === true || session.role === "SUPER_ADMIN" || session.isAdmin === true;
}
