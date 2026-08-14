import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: {
        tournament: { select: { userId: true, name: true } },
        groups: { orderBy: { order: "asc" } },
      },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ stage });
  } catch (error) {
    console.error("GET /api/stages/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch stage" }, { status: 500 });
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
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const {
      name, status, startDate, endDate, scoringRule,
      mapRotation, teamsAdvancing, description,
    } = body;
    const updated = await prisma.stage.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(scoringRule !== undefined && { scoringRule }),
        ...(mapRotation !== undefined && { mapRotation }),
        ...(teamsAdvancing !== undefined && { teamsAdvancing }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ stage: updated });
  } catch (error) {
    console.error("PATCH /api/stages/[id]:", error);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
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
    const stage = await prisma.stage.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.stage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/stages/[id]:", error);
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
  }
}