import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") return NextResponse.json({ error: "Empty body" }, { status: 400 });
      body = JSON.parse(text);
    } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const { tournamentId, position, type, amount, currency, description } = body as Record<string, unknown>;

    if (!tournamentId || typeof tournamentId !== "string") return NextResponse.json({ error: "tournamentId required" }, { status: 400 });

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { userId: true } });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (tournament.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const prize = await prisma.prize.create({
      data: {
        tournamentId,
        position: Number(position) || 1,
        type: String(type || "CASH"),
        amount: amount !== undefined && amount !== null ? Number(amount) : null,
        currency: currency ? String(currency) : null,
        description: description ? String(description).trim() : null,
      },
    });

    return NextResponse.json({ success: true, prize }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/prizes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}