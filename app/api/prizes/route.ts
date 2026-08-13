import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      if (!text || text.trim() === "") {
        return NextResponse.json({ error: "Request body is empty" }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { tournamentId, position, type, amount, currency, description } =
      body as Record<string, unknown>;

    if (!tournamentId || typeof tournamentId !== "string") {
      return NextResponse.json({ error: "tournamentId is required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { organizerId: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    if (tournament.organizerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!position || typeof position !== "number" || position < 1) {
      return NextResponse.json({ error: "position must be a positive number" }, { status: 400 });
    }

    const VALID_TYPES = ["CASH", "ITEM"];
    if (!type || !VALID_TYPES.includes(String(type))) {
      return NextResponse.json({ error: "type must be CASH or ITEM" }, { status: 400 });
    }

    const prize = await prisma.prize.create({
      data: {
        tournamentId: tournamentId,
        position: Number(position),
        type: String(type) as "CASH" | "ITEM",
        amount: amount !== null && amount !== undefined ? Number(amount) : null,
        currency: currency ? String(currency) : null,
        description: description ? String(description).trim() : null,
      },
    });

    return NextResponse.json({ success: true, prize }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/prizes] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}