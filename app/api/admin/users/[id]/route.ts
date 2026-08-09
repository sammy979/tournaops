import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { requireSuperAdmin } from "@/lib/auth/rbac";

// DELETE /api/admin/users/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { authorized, errorResponse, user: admin } = await requireSuperAdmin(session);
  if (!authorized || !admin) return errorResponse!;

  const { id } = await params;
  if (id === admin.id) {
    return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

// PATCH /api/admin/users/[id]
// Update role, isPro, or isAdmin for a user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { authorized, errorResponse, user: admin } = await requireSuperAdmin(session);
  if (!authorized || !admin) return errorResponse!;

  const { id } = await params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const updates: any = {};
  const ALLOWED_ROLES = ["USER", "ORGANIZER", "SUPER_ADMIN"];

  if ("role" in body) {
    if (!ALLOWED_ROLES.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    updates.role = body.role;
  }

  if ("isPro" in body) {
    updates.isPro = Boolean(body.isPro);
  }

  if ("isAdmin" in body) {
    updates.isAdmin = Boolean(body.isAdmin);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Prevent admin from demoting themselves accidentally
  if (id === admin.id && (updates.role === "USER" || updates.isAdmin === false)) {
    return NextResponse.json(
      { error: "Cannot remove your own admin privileges" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isAdmin: true,
        isPro: true,
      },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}