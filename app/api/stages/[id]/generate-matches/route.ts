import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GenerateMatchesSchema = z.object({
  matchesPerGroup: z.number().int().min(1).max(30).default(6),
  scheduledDates: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stage = await prisma.stage.findUnique({
      where: { id: params.id },
      include: {
        tournament: { select: { userId: true } },
        groups: {
          include: {
            teamProgressions: {
              include: { team: true },
            },
          },
        },
        _count: { select: { matches: true } },
      },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    if (stage.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (stage._count.matches > 0) {
      return NextResponse.json(
        { error: "Matches already generated for this stage. Delete existing matches first." },
        { status: 409 }
      );
    }

    if (stage.groups.length === 0) {
      return NextResponse.json(
        { error: "Generate groups before generating matches" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = GenerateMatchesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { matchesPerGroup, scheduledDates } = parsed.data;

    let globalMatchNumber = 1;
    const createdMatches: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const group of stage.groups) {
        for (let matchNum = 1; matchNum <= matchesPerGroup; matchNum++) {
          const scheduledAt = scheduledDates?.[globalMatchNumber - 1]
            ? new Date(scheduledDates[globalMatchNumber - 1])
            : null;

          const match = await tx.match.create({
            data: {
              stageId: params.id,
              stageGroupId: group.id,
              matchNumber: globalMatchNumber,
              groupName: group.name,
              status: "pending",
              scheduledAt,
            },
          });

          createdMatches.push(match);
          globalMatchNumber++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      matchCount: createdMatches.length,
      message: `Generated ${createdMatches.length} matches across ${stage.groups.length} groups`,
    });
  } catch (error) {
    console.error("Match generation error:", error);
    return NextResponse.json({ error: "Failed to generate matches" }, { status: 500 });
  }
}