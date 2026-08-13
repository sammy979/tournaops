import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "ID required" }, { status: 400 });

    const preset = await prisma.userScoringPreset.findUnique({ where: { id: id.trim() }, select: { userId: true } });
    if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (preset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { name, description, killPoints, placementPoints } = body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (killPoints !== undefined || placementPoints !== undefined) {
      const existing = await prisma.userScoringPreset.findUnique({ where: { id: id.trim() }, select: { scoringRule: true } });
      const currentRule = (existing?.scoringRule as Record<string, unknown>) || {};
      updateData.scoringRule = {
        killPoints: killPoints !== undefined ? Number(killPoints) : currentRule.killPoints,
        placementPoints: placementPoints !== undefined ? placementPoints : currentRule.placementPoints,
      };
    }

    const updated = await prisma.userScoringPreset.update({ where: { id: id.trim() }, data: updateData });
    return NextResponse.json({ success: true, preset: updated });
  } catch (error) {
    console.error("[PATCH /api/scoring-presets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!id || id.trim() === "") return NextResponse.json({ error: "ID required" }, { status: 400 });

    const preset = await prisma.userScoringPreset.findUnique({ where: { id: id.trim() }, select: { userId: true } });
    if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (preset.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.userScoringPreset.delete({ where: { id: id.trim() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/scoring-presets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}