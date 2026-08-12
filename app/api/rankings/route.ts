import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Aggregate TeamProgression across all tournaments
    // Group by teamId, sum points/kills, take best finalPosition
    const progressions = await prisma.teamProgression.findMany({
      where: {
        tournament: {
          status: { in: ["COMPLETED", "LIVE"] },
          isPublic: true,
        },
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            format: true,
          },
        },
      },
      orderBy: { points: "desc" },
    });

    // Aggregate per team across tournaments
    const teamMap = new Map<
      string,
      {
        id: string;
        name: string;
        totalPoints: number;
        totalKills: number;
        bestPlacement: number | null;
        matchesPlayed: number;
        wwcds: number;
        tournamentName: string | null;
        tournamentId: string | null;
        tournamentSlug: string | null;
        tournamentStatus: string | null;
        format: string | null;
      }
    >();

    for (const p of progressions) {
      const existing = teamMap.get(p.teamId);
      if (!existing) {
        teamMap.set(p.teamId, {
          id: p.teamId,
          name: p.teamName,
          totalPoints: p.points,
          totalKills: p.kills,
          bestPlacement: p.finalPosition,
          matchesPlayed: p.matchesPlayed,
          wwcds: p.wwcds,
          tournamentName: p.tournament.name,
          tournamentId: p.tournament.id,
          tournamentSlug: p.tournament.slug,
          tournamentStatus: p.tournament.status,
          format: p.tournament.format,
        });
      } else {
        existing.totalPoints += p.points;
        existing.totalKills += p.kills;
        existing.matchesPlayed += p.matchesPlayed;
        existing.wwcds += p.wwcds;
        if (
          p.finalPosition !== null &&
          (existing.bestPlacement === null ||
            p.finalPosition < existing.bestPlacement)
        ) {
          existing.bestPlacement = p.finalPosition;
          existing.tournamentName = p.tournament.name;
          existing.tournamentId = p.tournament.id;
          existing.tournamentSlug = p.tournament.slug;
          existing.tournamentStatus = p.tournament.status;
          existing.format = p.tournament.format;
        }
      }
    }

    // Sort by totalPoints desc, then kills desc
    const sorted = Array.from(teamMap.values()).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.totalKills - a.totalKills;
    });

    const teams = sorted.map((t, i) => ({
      rank: i + 1,
      id: t.id,
      name: t.name,
      points: t.totalPoints,
      kills: t.totalKills,
      placement: t.bestPlacement,
      matchesPlayed: t.matchesPlayed,
      wwcds: t.wwcds,
      tournamentName: t.tournamentName,
      tournamentId: t.tournamentSlug, // use slug for public URL
      tournamentStatus: t.tournamentStatus,
      format: t.format,
    }));

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("[rankings] GET error:", error);
    return NextResponse.json({ teams: [] }, { status: 200 });
  }
}