import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { scheduleData: true },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      schedule: tournament.scheduleData || [],
    });
  } catch (err) {
    logError(err, "SCHEDULE_GET");
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!Array.isArray(body.schedule)) {
      return NextResponse.json({ error: "schedule must be an array" }, { status: 400 });
    }

    // Validate each schedule entry
    const schedule = (body.schedule as Array<Record<string, unknown>>)
      .slice(0, 100) // max 100 entries
      .map(entry => ({
        id: String(entry.id || Math.random().toString(36).substring(2, 10)),
        matchName: String(entry.matchName || "").substring(0, 100),
        map: String(entry.map || "Erangel").substring(0, 50),
        date: String(entry.date || "").substring(0, 20),
        time: String(entry.time || "").substring(0, 10),
        lobbyCode: entry.lobbyCode ? String(entry.lobbyCode).substring(0, 20) : undefined,
        password: entry.password ? String(entry.password).substring(0, 20) : undefined,
      }));

    const updated = await prisma.tournament.update({
      where: { id },
      data: { scheduleData: schedule },
      select: { scheduleData: true },
    });

    return NextResponse.json({ schedule: updated.scheduleData, success: true });
  } catch (err) {
    logError(err, "SCHEDULE_PUT");
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}