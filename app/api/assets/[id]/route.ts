import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: { id: string }; }

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params?.id;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Asset ID required" }, { status: 400 });

    const asset = await prisma.asset.findUnique({ where: { id: id.trim() }, select: { userId: true } });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (asset.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.asset.delete({ where: { id: id.trim() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/assets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}