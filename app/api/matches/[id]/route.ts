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
    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true, name: true } } },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ match });
  } catch (error) {
    console.error("GET /api/matches/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch match" }, { status: 500 });
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
    const { scheduledAt, map, status, name } = body;
    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.match.update({
      where: { id },
      data: {
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
        ...(map !== undefined && { map }),
        ...(status !== undefined && { status }),
        ...(name !== undefined && { name }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ match: updated });
  } catch (error) {
    console.error("PATCH /api/matches/[id]:", error);
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
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
    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/matches/[id]:", error);
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}