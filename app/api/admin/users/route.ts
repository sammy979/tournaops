import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requireSuperAdmin } from "@/lib/auth/rbac";
import { logError } from "@/lib/logger";

// GET /api/admin/users
// Returns paginated list of all users for admin management

export async function GET() {
  try {
    const session = await getSession();
    const { authorized, errorResponse } = await requireSuperAdmin(session);
    if (!authorized) return errorResponse!;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        isAdmin: true,
        isPro: true,
        role: true,
        createdAt: true,
        _count: { select: { tournaments: true } },
      },
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (err) {
    logError(err, "ADMIN_USERS_LIST");
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
