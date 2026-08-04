import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    const teamName = String(body.teamName || "").trim();
    const teamTag = String(body.teamTag || "").trim();
    const contact = String(body.contact || "").trim();
    const players = Array.isArray(body.players) ? body.players : [];

    if (!teamName || players.length === 0) {
      return NextResponse.json({ error: "Team name and players are required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublic: true,
        registrationData: true,
        teams: {
          select: { name: true },
        },
      },
    });

    if (!tournament || !tournament.isPublic) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const existingTeam = tournament.teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (existingTeam) {
      return NextResponse.json({ error: "Team already registered" }, { status: 409 });
    }

    const registrations = Array.isArray(tournament.registrationData)
      ? [...(tournament.registrationData as any[])]
      : [];

    const existingPending = registrations.find(
      (r: any) => String(r.teamName || "").toLowerCase() === teamName.toLowerCase() && r.status !== "rejected"
    );
    if (existingPending) {
      return NextResponse.json({ error: "Registration already submitted" }, { status: 409 });
    }

    registrations.push({
      id: "reg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      teamName,
      teamTag,
      contact,
      players,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: {
        registrationData: registrations as any,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully",
    });
  } catch (err) {
    logError(err, "PUBLIC_REGISTER_POST");
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 });
  }
}