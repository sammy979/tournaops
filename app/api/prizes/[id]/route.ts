import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyPrizeOwner(prizeId: string, userId: string) {
  const prize = await prisma.prize.findUnique({
    where: { id: prizeId },
    include: { tournament: { select: { userId: true } } },
  });
  if (!prize) return null;
  if (prize.tournament.userId !== userId) return null;
  return prize;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Prize ID required" }, { status: 400 });

    const prize = await verifyPrizeOwner(id.trim(), user.id);
    if (!prize) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

    let body: unknown;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { position, type, amount, currency, description } = body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    if (position !== undefined) updateData.position = Number(position);
    if (type !== undefined) updateData.type = String(type);
    if (amount !== undefined) updateData.amount = amount !== null ? Number(amount) : null;
    if (currency !== undefined) updateData.currency = currency ? String(currency) : null;
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;

    const updated = await prisma.prize.update({ where: { id: id.trim() }, data: updateData });
    return NextResponse.json({ success: true, prize: updated });
  } catch (error) {
    console.error("[PATCH /api/prizes/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "Prize ID required" }, { status: 400 });

    const prize = await verifyPrizeOwner(id.trim(), user.id);
    if (!prize) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

    await prisma.prize.delete({ where: { id: id.trim() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/prizes/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}