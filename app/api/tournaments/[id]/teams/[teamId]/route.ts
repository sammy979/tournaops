import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, teamId } = await context.params;
    
    // Verify tournament ownership
    const tournament = await prisma.tournament.findFirst({
      where: { id, userId: session.userId },
    });
    if (!tournament) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates = await req.json();
    const allowedFields = ["name", "tag", "logo"];
    const validUpdates: any = {};
    for (const key of allowedFields) {
      if (key in updates) validUpdates[key] = updates[key];
    }

    const team = await prisma.team.update({
      where: { id: teamId, tournamentId: id },
      data: validUpdates,
    });
    return NextResponse.json({ team });
  } catch (error: any) {
    console.error("Team update error:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed",
    }, { status: 500 });
  }
}