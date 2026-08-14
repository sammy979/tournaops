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
    const { name, description, scoringRule, isDefault } = body;
    const preset = await prisma.userScoringPreset.findUnique({ where: { id }, select: { userId: true } });
    if (!preset) return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    if (preset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (isDefault) {
      await prisma.userScoringPreset.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    const updated = await prisma.userScoringPreset.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(scoringRule !== undefined && { scoringRule }),
        ...(isDefault !== undefined && { isDefault }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ preset: updated });
  } catch (error) {
    console.error("PATCH /api/scoring-presets/[id]:", error);
    return NextResponse.json({ error: "Failed to update preset" }, { status: 500 });
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
    const preset = await prisma.userScoringPreset.findUnique({ where: { id }, select: { userId: true } });
    if (!preset) return NextResponse.json({ error: "Preset not found" }, { status: 404 });
    if (preset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.userScoringPreset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/scoring-presets/[id]:", error);
    return NextResponse.json({ error: "Failed to delete preset" }, { status: 500 });
  }
}