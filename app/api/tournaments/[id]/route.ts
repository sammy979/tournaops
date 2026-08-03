import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try by ID first, then by slug
  let tournament = await prisma.tournament.findUnique({
    where: { id },
    include: { teams: true, matches: true, rounds: true },
  });

  if (!tournament) {
    tournament = await prisma.tournament.findUnique({
      where: { slug: id },
      include: { teams: true, matches: true, rounds: true },
    });
  }

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ tournament });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  // Ownership check
  const existing = await prisma.tournament.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.tournament.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      status: data.status,
      prizePool: data.prizePool,
      discord: data.discord,
      rules: data.rules,
    },
    include: { teams: true, matches: true, rounds: true },
  });

  return NextResponse.json({ tournament: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.tournament.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.tournament.delete({ where: { id } });
  return NextResponse.json({ success: true });
}