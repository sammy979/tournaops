import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: stageId } = await params;

  const logs = await prisma.qualifierAuditLog.findMany({
    where: { stageId },
    orderBy: { performedAt: "desc" },
    take: 200,
  });

  // Enrich with user info
  const userIds = Array.from(new Set(logs.map(l => l.performedBy)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, displayName: true, email: true },
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const enriched = logs.map(l => ({
    ...l,
    performedByUser: userMap[l.performedBy] || null,
  }));

  return NextResponse.json({ logs: enriched });
}