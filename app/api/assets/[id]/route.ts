import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Asset ID required" }, { status: 400 });

    const asset = await prisma.asset.findUnique({ where: { id: id.trim() }, select: { userId: true } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (asset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.asset.delete({ where: { id: id.trim() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/assets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}