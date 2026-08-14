import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: { orderBy: { seed: "asc" } },
        stages: { orderBy: { order: "asc" } },
        prizes: { orderBy: { position: "asc" } },
      },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    return NextResponse.json({ tournament });
  } catch (error) {
    console.error("GET /api/tournaments/[id]:", error);
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const {
      name, description, status, format, prizePool, maxTeams,
      scoringRule, mapRotation, isPublic, discord, rules,
      bannerImage, logoUrl, bannerUrl, primaryColor, overlayTheme,
      startDate, endDate, brandingData, scheduleData, registrationData,
    } = body;
    const updated = await prisma.tournament.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(format !== undefined && { format }),
        ...(prizePool !== undefined && { prizePool }),
        ...(maxTeams !== undefined && { maxTeams }),
        ...(scoringRule !== undefined && { scoringRule }),
        ...(mapRotation !== undefined && { mapRotation }),
        ...(isPublic !== undefined && { isPublic }),
        ...(discord !== undefined && { discord }),
        ...(rules !== undefined && { rules }),
        ...(bannerImage !== undefined && { bannerImage }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(overlayTheme !== undefined && { overlayTheme }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(brandingData !== undefined && { brandingData }),
        ...(scheduleData !== undefined && { scheduleData }),
        ...(registrationData !== undefined && { registrationData }),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ tournament: updated });
  } catch (error) {
    console.error("PATCH /api/tournaments/[id]:", error);
    return NextResponse.json({ error: "Failed to update tournament" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = requireAuth(request);
    if (errorResponse || !user) return errorResponse ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!tournament) return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    if (tournament.userId !== user.id && !user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await prisma.tournament.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tournaments/[id]:", error);
    return NextResponse.json({ error: "Failed to delete tournament" }, { status: 500 });
  }
}