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
        registrationData: true,
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      registrations: tournament.registrationData || [],
    });
  } catch (err) {
    logError(err, "REGISTRATIONS_GET");
    return NextResponse.json({ error: "Failed to load registrations" }, { status: 500 });
  }
}

export async function PATCH(
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
    const registrationId = String(body.registrationId || "");
    const action = String(body.action || "");

    if (!registrationId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "registrationId and valid action required" }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        registrationData: true,
        teams: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const registrations = Array.isArray(tournament.registrationData)
      ? [...(tournament.registrationData as any[])]
      : [];

    const index = registrations.findIndex((r: any) => String(r.id) === registrationId);
    if (index === -1) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const reg = registrations[index];

    if (action === "approve") {
      const duplicateTeam = tournament.teams.find(
        (t) => t.name.toLowerCase() === String(reg.teamName || "").toLowerCase()
      );
      if (duplicateTeam) {
        return NextResponse.json({ error: "Team already exists in tournament" }, { status: 409 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.team.create({
          data: {
            name: String(reg.teamName || "Unnamed Team"),
            tag: String(reg.teamTag || "").substring(0, 10) || null,
            contact: String(reg.contact || "").substring(0, 100) || null,
            seed: null,
            players: Array.isArray(reg.players) ? reg.players : [],
            tournamentId: id,
          },
        });

        registrations[index] = {
          ...reg,
          status: "approved",
          approvedAt: new Date().toISOString(),
        };

        await tx.tournament.update({
          where: { id },
          data: {
            registrationData: registrations as any,
          },
        });
      });
    }

    if (action === "reject") {
      registrations[index] = {
        ...reg,
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      };

      await prisma.tournament.update({
        where: { id },
        data: {
          registrationData: registrations as any,
        },
      });
    }

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (err) {
    logError(err, "REGISTRATIONS_PATCH");
    return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
  }
}