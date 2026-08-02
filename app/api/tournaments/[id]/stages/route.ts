import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// GET all stages for a tournament
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const stages = await prisma.stage.findMany({
    where: { tournamentId: id },
    include: { groups: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ stages });
}

// POST create new stage
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tournamentId } = await params;

  const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (tournament.userId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  // Get next order
  const lastStage = await prisma.stage.findFirst({
    where: { tournamentId },
    orderBy: { order: "desc" },
  });
  const nextOrder = (lastStage?.order ?? -1) + 1;

  // Create stage with groups
  const stage = await prisma.stage.create({
    data: {
      tournamentId,
      name: data.name || `Stage ${nextOrder + 1}`,
      type: data.type || "CUSTOM",
      order: nextOrder,
      status: "DRAFT",
      numGroups: data.numGroups || 1,
      teamsPerGroup: data.teamsPerGroup || 16,
      matchesPerGroup: data.matchesPerGroup || 4,
      totalTeams: data.totalTeams || (data.numGroups || 1) * (data.teamsPerGroup || 16),
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      qualificationRule: data.qualificationRule || { type: "TOP_N_PER_GROUP", count: 8 },
      teamsAdvancing: data.teamsAdvancing || 0,
      teamsEliminated: data.teamsEliminated || 0,
      mapRotation: data.mapRotation || ["Erangel", "Miramar", "Sanhok"],
      scoringRule: data.scoringRule || tournament.scoringRule,
      tiebreakerOrder: data.tiebreakerOrder || ["points", "kills", "damage", "wwcds"],
      description: data.description || "",
      groups: {
        create: Array.from({ length: data.numGroups || 1 }, (_, i) => ({
          name: (data.numGroups || 1) === 1 ? "Main Lobby" : `Group ${String.fromCharCode(65 + i)}`,
          order: i,
          teamIds: data.teamAssignments?.[i] || [],
          matchIds: [],
        })),
      },
    },
    include: { groups: true },
  });

  return NextResponse.json({ stage });
}