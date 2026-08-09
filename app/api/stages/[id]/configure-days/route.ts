import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyStageOwnership } from "@/lib/authorization";
import type { Prisma } from "@prisma/client";

// ============================================================
// Configure days for a stage + regenerate matches
// POST /api/stages/[id]/configure-days
// Body: {
//   useDays: boolean,
//   days?: [
//     { name: "Day 1", date?: "2025-08-15", matches: 4, mapRotation: ["Erangel","Rondo",...] }
//   ],
//   // Or if useDays=false: totalMatches + mapRotation
//   totalMatches?: number,
//   mapRotation?: string[]
// }
// ============================================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: stageId } = await params;
    const { authorized, errorResponse } = await verifyStageOwnership(stageId, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const useDays = body.useDays === true;

    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: { groups: true, tournament: true },
    });
    if (!stage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    if (stage.isLocked) return NextResponse.json({ error: "Stage locked" }, { status: 403 });

    let daysConfig: Array<{ name: string; date?: string; matches: number; mapRotation: string[] }> = [];
    let totalMatches = 0;
    let defaultMaps: string[] = stage.mapRotation || stage.tournament.mapRotation || ["Erangel"];

    if (useDays) {
      if (!Array.isArray(body.days) || body.days.length === 0) {
        return NextResponse.json({ error: "Days array required when useDays=true" }, { status: 400 });
      }
      daysConfig = body.days.map((d: any, i: number) => ({
        name: String(d.name || `Day ${i + 1}`),
        date: d.date ? String(d.date) : undefined,
        matches: Math.max(1, Math.min(20, Number(d.matches) || 4)),
        mapRotation: Array.isArray(d.mapRotation) && d.mapRotation.length > 0
          ? d.mapRotation.slice(0, 20)
          : defaultMaps,
      }));
      totalMatches = daysConfig.reduce((s, d) => s + d.matches, 0);
    } else {
      totalMatches = Math.max(1, Math.min(20, Number(body.totalMatches) || 4));
      if (Array.isArray(body.mapRotation) && body.mapRotation.length > 0) {
        defaultMaps = body.mapRotation;
      }
      // Single implicit day
      daysConfig = [{
        name: "All Matches",
        matches: totalMatches,
        mapRotation: defaultMaps,
      }];
    }

    // Delete existing matches for this stage
    await prisma.match.deleteMany({
      where: { tournamentId: stage.tournamentId, stageId: stageId },
    });

    // Create fresh matches per group per day
    const matchesToCreate: Prisma.MatchCreateManyInput[] = [];
    let globalMatchNumber = 1;

    for (const group of stage.groups) {
      let matchInGroup = 1;
      for (let dayIdx = 0; dayIdx < daysConfig.length; dayIdx++) {
        const day = daysConfig[dayIdx];
        for (let m = 0; m < day.matches; m++) {
          const map = day.mapRotation[m % day.mapRotation.length];
          const notes = JSON.stringify({
            day: useDays ? (dayIdx + 1) : null,
            dayName: useDays ? day.name : null,
            dayDate: day.date || null,
          });

          matchesToCreate.push({
            tournamentId: stage.tournamentId,
            stageId: stageId,
            groupId: group.id,
            roundId: "no-round",
            lobbyId: `stage_${stageId}_group_${group.id}`,
            name: useDays
              ? `${day.name} - Match ${m + 1}`
              : `${stage.name} - Match ${matchInGroup}`,
            map: map,
            status: "pending",
            matchNumber: matchInGroup,
            notes: notes,
          });
          matchInGroup++;
          globalMatchNumber++;
        }
      }
    }

    if (matchesToCreate.length > 0) {
      await prisma.match.createMany({ data: matchesToCreate });
    }

    // Update stage metadata
    await prisma.stage.update({
      where: { id: stageId },
      data: {
        matchesPerGroup: totalMatches,
        mapRotation: defaultMaps,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Created ${matchesToCreate.length} matches across ${stage.groups.length} group(s) and ${daysConfig.length} day(s)`,
      details: {
        useDays,
        days: daysConfig.length,
        totalMatchesPerGroup: totalMatches,
        totalMatches: matchesToCreate.length,
        groups: stage.groups.length,
      },
    });
  } catch (err: any) {
    console.error("[STAGE_CONFIGURE_DAYS]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}