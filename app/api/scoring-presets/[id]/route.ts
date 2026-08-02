import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const preset = await prisma.userScoringPreset.findUnique({ where: { id } });
  if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (preset.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.userScoringPreset.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      placementPoints: data.placementPoints,
      killPoints: data.killPoints,
      wwcdBonus: data.wwcdBonus,
      top3Bonus: data.top3Bonus,
      perfectMatchBonus: data.perfectMatchBonus,
      maxKillPoints: data.maxKillPoints,
      tiebreakerOrder: data.tiebreakerOrder,
      isPublic: data.isPublic,
    },
  });

  return NextResponse.json({ preset: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const preset = await prisma.userScoringPreset.findUnique({ where: { id } });
  if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (preset.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.userScoringPreset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}