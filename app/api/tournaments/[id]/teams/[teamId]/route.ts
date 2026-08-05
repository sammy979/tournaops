import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, teamId } = await context.params;
  
  const owned = await verifyTournamentOwnership(id, session.userId);
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates = await req.json();
  const allowedFields = ["name", "tag", "logo", "banner", "country", "countryFlag"];
  const validUpdates: any = {};
  for (const key of allowedFields) {
    if (key in updates) validUpdates[key] = updates[key];
  }

  try {
    const team = await prisma.team.update({
      where: { id: teamId, tournamentId: id },
      data: validUpdates,
    });
    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}