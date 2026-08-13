import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GenerateGroupsSchema = z.object({
  groupCount: z.number().int().min(1).max(32),
  teamsAdvancing: z.number().int().min(1).optional(),
  randomize: z.boolean().default(true),
});

function assignTeamsToGroups(teams: any[], groupCount: number): Map<string, string[]> {
  const groupNames = Array.from({ length: groupCount }, (_, i) =>
    String.fromCharCode(65 + i) // A, B, C, D...
  );

  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const groups = new Map<string, string[]>();

  groupNames.forEach((name) => groups.set(name, []));

  shuffled.forEach((team, index) => {
    const groupName = groupNames[index % groupCount];
    groups.get(groupName)!.push(team.id);
  });

  return groups;
}

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
        tournament: {
          include: {
            teams: { orderBy: { name: "asc" } },
          },
        },
      },
    });

    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    if (stage.tournament.userId !== session.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = GenerateGroupsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { groupCount, teamsAdvancing, randomize } = parsed.data;
    const teams = stage.tournament.teams;

    if (teams.length < groupCount) {
      return NextResponse.json(
        { error: `Not enough teams (${teams.length}) to create ${groupCount} groups` },
        { status: 400 }
      );
    }

    // Check if groups already exist
    const existingGroups = await prisma.stageGroup.findMany({
      where: { stageId: params.id },
    });

    if (existingGroups.length > 0) {
      return NextResponse.json(
        { error: "Groups already exist for this stage. Delete existing groups first." },
        { status: 409 }
      );
    }

    // Assign teams to groups
    const groupAssignments = randomize
      ? assignTeamsToGroups(teams, groupCount)
      : (() => {
          const groupNames = Array.from({ length: groupCount }, (_, i) => String.fromCharCode(65 + i));
          const groups = new Map<string, string[]>();
          groupNames.forEach((name) => groups.set(name, []));
          teams.forEach((team, index) => {
            const groupName = groupNames[index % groupCount];
            groups.get(groupName)!.push(team.id);
          });
          return groups;
        })();

    // Create groups and team progressions atomically
    const createdGroups = await prisma.$transaction(async (tx) => {
      const groups = [];
      for (const [groupName, teamIds] of groupAssignments.entries()) {
        if (teamIds.length === 0) continue;

        const group = await tx.stageGroup.create({
          data: {
            stageId: params.id,
            name: `Group ${groupName}`,
            order: groupName.charCodeAt(0) - 65,
          },
        });

        // Create team progressions (ensure no duplicates within group)
        for (const teamId of teamIds) {
          const exists = await tx.teamProgression.findFirst({
            where: { stageGroupId: group.id, teamId },
          });
          if (!exists) {
            await tx.teamProgression.create({
              data: {
                stageGroupId: group.id,
                teamId,
                stageId: params.id,
                status: "active",
              },
            });
          }
        }

        groups.push({ ...group, teamCount: teamIds.length });
      }

      // Update stage with group configuration
      await tx.stage.update({
        where: { id: params.id },
        data: {
          groupCount,
          teamsAdvancing: teamsAdvancing || null,
          status: "active",
        },
      });

      return groups;
    });

    return NextResponse.json({
      success: true,
      groups: createdGroups,
      message: `Created ${createdGroups.length} groups with ${teams.length} teams assigned`,
    });
  } catch (error) {
    console.error("Group generation error:", error);
    return NextResponse.json({ error: "Failed to generate groups" }, { status: 500 });
  }
}