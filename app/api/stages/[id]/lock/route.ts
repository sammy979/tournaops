import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// POST lock a stage
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const stage = await prisma.stage.findUnique({
    where: { id },
    include: { tournament: true },
  });

  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stage.tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.stage.update({
    where: { id },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockedBy: session.userId,
    },
  });

  return NextResponse.json({ stage: updated });
}

// DELETE = unlock
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const stage = await prisma.stage.findUnique({ where: { id } });
  if (!stage) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.stage.update({
    where: { id },
    data: {
      isLocked: false,
      lockedAt: null,
      lockedBy: null,
    },
  });

  return NextResponse.json({ stage: updated });
}