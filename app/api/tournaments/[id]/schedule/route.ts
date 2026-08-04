import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        scheduleData: true,
      },
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await context.params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    if (!Array.isArray(body.schedule)) {
      return NextResponse.json({ error: "schedule must be an array" }, { status: 400 });
    }

    const schedule = body.schedule.slice(0, 100).map((entry: any, i: number) => ({
      id: String(entry.id || ("sch_" + i + "_" + Date.now())),
      matchName: String(entry.matchName || "").substring(0, 100),
      map: String(entry.map || "Erangel").substring(0, 50),
      date: String(entry.date || "").substring(0, 20),
      time: String(entry.time || "").substring(0, 10),
      lobbyCode: entry.lobbyCode ? String(entry.lobbyCode).substring(0, 30) : "",
      password: entry.password ? String(entry.password).substring(0, 30) : "",
    }));

    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        scheduleData: schedule as any,
      },
      select: {
        scheduleData: true,
      },
    });

    return NextResponse.json({
      success: true,
      schedule: updated.scheduleData || [],
    });
  } catch (err) {
    logError(err, "SCHEDULE_PUT");
    return NextResponse.json({ error: "Failed to save schedule" }, { status: 500 });
  }
}