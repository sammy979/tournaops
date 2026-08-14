import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const asset = await prisma.asset.findUnique({ where: { id }, select: { userId: true } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    if (asset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.asset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/assets/[id]:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { name, type } = body;
    const asset = await prisma.asset.findUnique({ where: { id }, select: { userId: true } });
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    if (asset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.asset.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ asset: updated });
  } catch (error) {
    console.error("PATCH /api/assets/[id]:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}