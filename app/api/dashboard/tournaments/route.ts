import { NextRequest, NextResponse } from "next/server";
import { getSession, requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 80);
}

const TournamentCreateSchema = z.object({
  name: z.string().min(3).max(120),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(2000).optional(),
  game: z.string().min(1).max(60).default("PUBG Mobile"),
  tournamentType: z.string().optional(),
  teamSize: z.number().int().min(1).max(4).default(4),
  maxTeams: z.number().int().min(2).max(128).default(16),
  registrationOpen: z.boolean().default(true),
  registrationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prizePool: z.number().min(0).optional(),
  prizeDescription: z.string().max(500).optional(),
  rules: z.string().max(5000).optional(),
  entryFee: z.number().min(0).optional(),
  isPublic: z.boolean().default(true),
  scoringPresetId: z.string().optional(),
  bannerUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  discordServerId: z.string().optional(),
  discordChannelId: z.string().optional(),
  stages: z.array(z.object({
    name: z.string(),
    type: z.string(),
    order: z.number(),
    groupCount: z.number().optional(),
    teamsPerGroup: z.number().optional(),
    teamsAdvancing: z.number().optional(),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await requireOrganizer();

    const body = await req.json();
    const parsed = TournamentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tournament data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Generate slug if not provided
    let slug = data.slug || slugify(data.name);
    if (!slug) {
      return NextResponse.json({ error: "Could not generate a valid slug from tournament name" }, { status: 400 });
    }

    // Ensure slug is unique — append random suffix if needed
    const existingBySlug = await prisma.tournament.findUnique({ where: { slug } });
    if (existingBySlug) {
      const suffix = Math.floor(Math.random() * 9000) + 1000;
      slug = `${slug}-${suffix}`;
    }

    // Re-check
    const doubleCheck = await prisma.tournament.findUnique({ where: { slug } });
    if (doubleCheck) {
      return NextResponse.json({ error: "Slug conflict. Please provide a unique tournament name." }, { status: 409 });
    }

    const tournament = await prisma.$transaction(async (tx) => {
      const created = await tx.tournament.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          game: data.game,
          teamSize: data.teamSize,
          maxTeams: data.maxTeams,
          registrationOpen: data.registrationOpen,
          registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          prizePool: data.prizePool || null,
          prizeDescription: data.prizeDescription || null,
          rules: data.rules || null,
          entryFee: data.entryFee || null,
          isPublic: data.isPublic,
          bannerUrl: data.bannerUrl || null,
          logoUrl: data.logoUrl || null,
          discordServerId: data.discordServerId || null,
          discordChannelId: data.discordChannelId || null,
          userId: session.userId,
          status: "draft",
        },
      });

      // Create stages if provided
      if (data.stages && data.stages.length > 0) {
        for (const stage of data.stages) {
          await tx.stage.create({
            data: {
              tournamentId: created.id,
              name: stage.name,
              type: stage.type,
              order: stage.order,
              groupCount: stage.groupCount || null,
              teamsPerGroup: stage.teamsPerGroup || null,
              teamsAdvancing: stage.teamsAdvancing || null,
              status: "pending",
            },
          });
        }
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        status: tournament.status,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "Unauthorized" || error?.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Tournament creation error:", error);
    return NextResponse.json({ error: "Failed to create tournament" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const skip = (page - 1) * limit;

    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          game: true,
          maxTeams: true,
          teamSize: true,
          registrationOpen: true,
          startDate: true,
          createdAt: true,
          _count: {
            select: { teams: true },
          },
        },
      }),
      prisma.tournament.count({ where: { userId: session.userId } }),
    ]);

    return NextResponse.json({
      tournaments,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Tournament list error:", error);
    return NextResponse.json({ error: "Failed to fetch tournaments" }, { status: 500 });
  }
}