import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { checkRateLimit, getClientIp, getRateLimitHeaders } from "@/lib/rate-limit";

const REGISTRATION_RATE = { windowMs: 60 * 60 * 1000, maxRequests: 5 }; // 5 per hour per IP

function sanitizeString(val: unknown, maxLen = 100): string {
  return String(val || "").trim().slice(0, maxLen).replace(/[<>]/g, "");
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // Rate limit by IP — prevent spam registrations
  const ip = getClientIp(req);
  const rl = checkRateLimit(`pub-register:${ip}`, REGISTRATION_RATE);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please wait before trying again." },
      { status: 429, headers: getRateLimitHeaders(rl, REGISTRATION_RATE) }
    );
  }

  try {
    const { slug } = await context.params;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Sanitize all inputs — never trust client data
    const teamName = sanitizeString(body.teamName, 100);
    const teamTag = sanitizeString(body.teamTag, 10);
    const contact = sanitizeString(body.contact, 200);

    // Validate and sanitize players array
    const rawPlayers = Array.isArray(body.players) ? body.players : [];
    if (rawPlayers.length > 10) {
      return NextResponse.json({ error: "Maximum 10 players per team" }, { status: 400 });
    }

    const players = rawPlayers.map((p: any) => ({
      name: sanitizeString(p?.name || p?.playerName, 80),
      ign: sanitizeString(p?.ign || p?.pubgId, 50),
      role: sanitizeString(p?.role, 30),
    })).filter((p: any) => p.name.length > 0);

    if (!teamName || players.length === 0) {
      return NextResponse.json(
        { error: "Team name and at least one player are required" },
        { status: 400 }
      );
    }

    if (teamName.length < 2) {
      return NextResponse.json({ error: "Team name must be at least 2 characters" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublic: true,
        status: true,
        maxTeams: true,
        registrationData: true,
        teams: { select: { name: true }, take: 500 },
      },
    });

    if (!tournament || !tournament.isPublic) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    // Only accept registrations when tournament is in registration status
    if (tournament.status !== "registration" && tournament.status !== "draft") {
      return NextResponse.json(
        { error: "Registration is not currently open for this tournament" },
        { status: 400 }
      );
    }

    // Check capacity
    if (tournament.teams.length >= tournament.maxTeams) {
      return NextResponse.json({ error: "Tournament is full" }, { status: 400 });
    }

    const existingTeam = tournament.teams.find(
      (t) => t.name.toLowerCase() === teamName.toLowerCase()
    );
    if (existingTeam) {
      return NextResponse.json({ error: "Team name already registered" }, { status: 409 });
    }

    const registrations = Array.isArray(tournament.registrationData)
      ? [...(tournament.registrationData as any[])]
      : [];

    // Limit total registrations to prevent unbounded growth
    if (registrations.length >= tournament.maxTeams * 3) {
      return NextResponse.json(
        { error: "Registration queue is full. Please contact the organizer." },
        { status: 400 }
      );
    }

    const existingPending = registrations.find(
      (r: any) =>
        sanitizeString(r.teamName, 100).toLowerCase() === teamName.toLowerCase() &&
        r.status !== "rejected"
    );
    if (existingPending) {
      return NextResponse.json({ error: "A registration for this team name is already pending" }, { status: 409 });
    }

    registrations.push({
      id: "reg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8),
      teamName,
      teamTag,
      contact,
      players,
      status: "pending",
      createdAt: new Date().toISOString(),
      ip: ip.substring(0, 45), // Store truncated IP for abuse tracking
    });

    await prisma.tournament.update({
      where: { id: tournament.id },
      data: { registrationData: registrations as any },
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully. The organizer will review your application.",
    });
  } catch (err) {
    logError(err, "PUBLIC_REGISTER_POST");
    return NextResponse.json({ error: "Failed to submit registration" }, { status: 500 });
  }
}