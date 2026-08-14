import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const { position, type, amount, currency, description } = body;
    const prize = await prisma.prize.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!prize) return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    if (prize.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.prize.update({
      where: { id },
      data: {
        ...(position !== undefined && { position }),
        ...(type !== undefined && { type }),
        ...(amount !== undefined && { amount }),
        ...(currency !== undefined && { currency }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ prize: updated });
  } catch (error) {
    console.error("PATCH /api/prizes/[id]:", error);
    return NextResponse.json({ error: "Failed to update prize" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const prize = await prisma.prize.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!prize) return NextResponse.json({ error: "Prize not found" }, { status: 404 });
    if (prize.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.prize.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/prizes/[id]:", error);
    return NextResponse.json({ error: "Failed to delete prize" }, { status: 500 });
  }
}