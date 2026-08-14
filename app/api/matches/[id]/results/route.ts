import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: { select: { userId: true } } },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const updated = await prisma.match.update({
      where: { id },
      data: {
        results: body.results ?? body,
        status: "completed",
        endTime: new Date(),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ match: updated });
  } catch (error) {
    console.error("POST /api/matches/[id]/results:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}

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
      select: { results: true, status: true, tournament: { select: { userId: true } } },
    });
    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
    if (match.tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ results: match.results, status: match.status });
  } catch (error) {
    console.error("GET /api/matches/[id]/results:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}