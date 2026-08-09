import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { logError } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, teamId } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { playersList: true },
    });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ team });
  } catch (err) {
    logError(err, "TEAM_GET");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, teamId } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const allowed = ["name", "tag", "logo", "contact", "seed", "country", "countryFlag", "banner", "players"];
    const data: any = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }
    if (data.name !== undefined && typeof data.name === "string") {
      data.name = data.name.trim().slice(0, 100);
    }
    if (data.tag !== undefined && typeof data.tag === "string") {
      data.tag = data.tag.trim().slice(0, 10) || null;
    }
    if (data.seed !== undefined) {
      data.seed = data.seed ? Number(data.seed) : null;
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data,
      include: { playersList: true },
    });
    return NextResponse.json({ team });
  } catch (err) {
    logError(err, "TEAM_PATCH");
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id, teamId } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    await prisma.team.delete({ where: { id: teamId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "TEAM_DELETE");
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}