import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

async function verifyOwner(prizeId: string, userId: string) {
  const prize = await prisma.prize.findUnique({
    where: { id: prizeId },
    include: {
      tournament: { select: { organizerId: true } },
    },
  });
  if (!prize) return null;
  if (prize.tournament.organizerId !== userId) return null;
  return prize;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Prize ID is required" }, { status: 400 });
    }

    const prizeId = id.trim();
    const prize = await verifyOwner(prizeId, session.user.id);
    if (!prize) {
      return NextResponse.json({ error: "Prize not found or forbidden" }, { status: 404 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { position, type, amount, currency, description } =
      body as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};
    if (position !== undefined) updateData.position = Number(position);
    if (type !== undefined) updateData.type = String(type);
    if (amount !== undefined) updateData.amount = amount !== null ? Number(amount) : null;
    if (currency !== undefined) updateData.currency = currency ? String(currency) : null;
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;

    const updated = await prisma.prize.update({
      where: { id: prizeId },
      data: updateData,
    });

    return NextResponse.json({ success: true, prize: updated });
  } catch (error) {
    console.error("[PATCH /api/prizes/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params?.id;
    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json({ error: "Prize ID is required" }, { status: 400 });
    }

    const prizeId = id.trim();
    const prize = await verifyOwner(prizeId, session.user.id);
    if (!prize) {
      return NextResponse.json({ error: "Prize not found or forbidden" }, { status: 404 });
    }

    await prisma.prize.delete({ where: { id: prizeId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/prizes/[id]] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}