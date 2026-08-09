import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { advanceStage } from "@/lib/stage-advancement-engine";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { authorized, errorResponse } = await verifyTournamentOwnership(
      id,
      session
    );
    if (!authorized) return errorResponse!;

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const stageId = body?.stageId;
    if (!stageId || typeof stageId !== "string") {
      return NextResponse.json(
        { error: "stageId is required" },
        { status: 400 }
      );
    }

    // Require a reason for force advance
    const reason =
      typeof body?.reason === "string" ? body.reason.trim() : "";
    if (!reason || reason.length < 5) {
      return NextResponse.json(
        {
          error:
            "A reason is required for force advance (minimum 5 characters). This action is logged.",
        },
        { status: 400 }
      );
    }

    // Fetch tournament + discord for post-advance announcement
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        stages: {
          include: { groups: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
        teams: true,
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const result = await advanceStage(id, stageId, {
      isForced: true,
      performedBy: session.userId,
      reason,
    });

    // Post Discord announcement if webhook configured
    if (result.success && !result.alreadyAdvanced && tournament.discord) {
      const wh = tournament.discord;
      if (
        wh.startsWith("https://discord.com/api/webhooks/") ||
        wh.startsWith("https://discordapp.com/api/webhooks/")
      ) {
        const branding = (tournament.brandingData as any) || {};
        const primaryColor =
          parseInt(
            (branding.primaryColor || "#f59e0b").replace("#", ""),
            16
          ) || 0xf59e0b;
        const publicUrl =
          "https://www.tournaops.com/tournaments/" + tournament.slug;

        const progressions = await prisma.teamProgression.findMany({
          where: { stageId, status: "QUALIFIED" },
          orderBy: { finalPosition: "asc" },
        });

        const currentStage = tournament.stages.find((s) => s.id === stageId);
        const nextStage = tournament.stages.find(
          (s) => s.order === (currentStage?.order ?? 0) + 1
        );

        const chunks: string[][] = [];
        for (let i = 0; i < progressions.length; i += 20) {
          chunks.push(
            progressions.slice(i, i + 20).map((t, j) => {
              const rank = i + j + 1;
              return (
                "`#" +
                String(rank).padStart(2, "0") +
                "` **" +
                t.teamName +
                "** \u2014 " +
                t.points +
                " pts"
              );
            })
          );
        }

        const embed: any = {
          title:
            "\u26A1 " +
            (currentStage?.name?.toUpperCase() || "STAGE") +
            " \u2014 FORCE ADVANCED",
          description:
            "**" +
            result.qualifiedCount +
            " teams** have been force-advanced to **" +
            result.nextStageName +
            "**.\n\n\u26A0\uFE0F Admin override applied.",
          color: 0xf59e0b,
          fields: chunks.slice(0, 5).map((chunk, i) => ({
            name:
              i === 0
                ? "\u2705 QUALIFIED TEAMS"
                : "\u2705 QUALIFIED (cont.)",
            value: chunk.join("\n"),
            inline: false,
          })),
          footer: {
            text: "TournaOps \u2022 Force advancement",
            icon_url: "https://www.tournaops.com/logo.png",
          },
          timestamp: new Date().toISOString(),
        };

        embed.fields.push({
          name: "\uD83D\uDD17 LINKS",
          value:
            "\uD83C\uDFC6 [Tournament Page](" +
            publicUrl +
            ") \u2022 \uD83D\uDCCA [Live Standings](" +
            publicUrl +
            "/results)",
          inline: false,
        });

        try {
          await fetch(wh, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: "@everyone",
              embeds: [embed],
            }),
          });
        } catch (e) {
          console.warn("[DISCORD_FORCE_ADVANCE]", e);
        }

        // Post slot list for next stage
        if (nextStage) {
          const refreshedNext = await prisma.stage.findUnique({
            where: { id: nextStage.id },
            include: { groups: { orderBy: { order: "asc" } } },
          });

          if (refreshedNext) {
            const teamMap = new Map(
              tournament.teams.map((t) => [t.id, t])
            );
            const totalTeams = (refreshedNext.groups || []).reduce(
              (s: number, g: any) => s + (g.teamIds?.length || 0),
              0
            );

            if (totalTeams > 0) {
              const slotEmbeds: any[] = [];
              slotEmbeds.push({
                title:
                  "\uD83D\uDCCB " +
                  nextStage.name.toUpperCase() +
                  " \u2014 SLOT LIST",
                description:
                  "**" +
                  tournament.name +
                  "**\n\uD83D\uDC65 **" +
                  totalTeams +
                  " Teams** across **" +
                  (refreshedNext.groups?.length || 0) +
                  " Group" +
                  ((refreshedNext.groups?.length || 0) !== 1 ? "s" : "") +
                  "**",
                color: primaryColor,
              });

              for (const group of (refreshedNext.groups || []).slice(0, 9)) {
                const lines = (group.teamIds || [])
                  .map((tid: string, i: number) => {
                    const team = teamMap.get(tid) as any;
                    if (!team) return null;
                    const tag = team.tag ? "[" + team.tag + "] " : "";
                    return (
                      "\u0060Slot " +
                      String(i + 1).padStart(2, "0") +
                      "\u0060 \u2014 **" +
                      tag +
                      team.name +
                      "**"
                    );
                  })
                  .filter(Boolean);

                slotEmbeds.push({
                  title:
                    "\uD83D\uDD37 " +
                    group.name.toUpperCase() +
                    " \u2014 " +
                    lines.length +
                    " Teams",
                  color: primaryColor,
                  description: lines.join("\n") || "_No teams_",
                });
              }

              try {
                await fetch(wh, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ embeds: slotEmbeds }),
                });
              } catch (e) {
                console.warn("[DISCORD_SLOT_LIST]", e);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: result.success,
      qualified: result.qualifiedCount,
      eliminated: result.eliminatedCount,
      nextStage: result.nextStageName,
      alreadyAdvanced: result.alreadyAdvanced,
      message: result.message,
    });
  } catch (err: any) {
    console.error("[FORCE_ADVANCE]", err);
    return NextResponse.json(
      { error: err?.message || "Force advance failed" },
      { status: 500 }
    );
  }
}