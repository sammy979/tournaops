import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: { id: string }; }

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params?.id?.trim();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const preset = await prisma.scoringPreset.findUnique({ where: { id }, select: { userId: true, isBuiltIn: true } });
    if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (preset.isBuiltIn || preset.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    let body: unknown;
    try {
      const text = await request.text();
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, description, killPoints, placementPoints } = body as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (description !== undefined) updateData.description = description ? String(description).trim() : null;
    if (killPoints !== undefined) updateData.killPoints = Number(killPoints);
    if (placementPoints !== undefined) updateData.placementPoints = placementPoints;

    const updated = await prisma.scoringPreset.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, preset: updated });
  } catch (error) {
    console.error("[PATCH /api/scoring-presets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params?.id?.trim();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const preset = await prisma.scoringPreset.findUnique({ where: { id }, select: { userId: true, isBuiltIn: true } });
    if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (preset.isBuiltIn || preset.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.scoringPreset.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/scoring-presets/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}