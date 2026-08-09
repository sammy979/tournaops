import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { authorized, errorResponse } = await verifyTournamentOwnership(id, session);
    if (!authorized) return errorResponse!;

    const body = await req.json();
    const stageId = body.stageId;
    if (!stageId) return NextResponse.json({ error: "stageId required" }, { status: 400 });

    const fresh = await prisma.tournament.findUnique({
      where: { id },
      include: {
        stages: { include: { groups: true }, orderBy: { order: "asc" } },
        matches: true,
        teams: true,
      },
    });
    if (!fresh) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentStage = fresh.stages.find(s => s.id === stageId);
    if (!currentStage) return NextResponse.json({ error: "Stage not found" }, { status: 404 });

    const nextStage = fresh.stages.find(s => s.order === currentStage.order + 1);
    if (!nextStage) return NextResponse.json({ error: "No next stage" }, { status: 400 });

    // Calculate standings for current stage
    const scoringRule: any = currentStage.scoringRule || fresh.scoringRule || {};
    const killPoints = Number(scoringRule.killPoints) || 1;
    const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
    let placementPoints: number[] = [10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0];
    if (Array.isArray(scoringRule.placementPoints)) placementPoints = scoringRule.placementPoints;
    else if (scoringRule.placementPoints && typeof scoringRule.placementPoints === "object") {
      placementPoints = Object.values(scoringRule.placementPoints).map(Number);
    }

    const stageTeamIds = new Set<string>();
    for (const g of currentStage.groups) (g.teamIds || []).forEach((tid: string) => stageTeamIds.add(tid));

    const stageMatches = fresh.matches.filter(m => m.stageId === stageId && m.status === "completed" && Array.isArray(m.results));

    const teamStats = new Map<string, any>();
    for (const tid of stageTeamIds) {
      const t = fresh.teams.find(x => x.id === tid);
      if (t) teamStats.set(tid, { teamId: tid, teamName: t.name, teamTag: t.tag, points: 0, kills: 0, wwcds: 0 });
    }

    for (const match of stageMatches) {
      for (const r of match.results as any[]) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const placement = Number(r.placement) || 16;
        const isWWCD = placement === 1 || r.wwcd === true;
        s.points += (placementPoints[Math.max(0, placement - 1)] || 0) + kills * killPoints + (isWWCD ? wwcdBonus : 0);
        s.kills += kills;
        if (isWWCD) s.wwcds++;
      }
    }

    const standings = Array.from(teamStats.values())
      .sort((a, b) => b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills);

    const nextCapacity = nextStage.groups.length * (nextStage.teamsPerGroup || 16);
    const advanceCount = Math.min(standings.length, nextCapacity);
    const qualified = standings.slice(0, advanceCount);

    // Snake seeding
    const groupAssignments: string[][] = nextStage.groups.map(() => []);
    let direction = 1, groupIdx = 0;
    for (const q of qualified) {
      groupAssignments[groupIdx].push(q.teamId);
      if (direction === 1) {
        if (groupIdx === nextStage.groups.length - 1) direction = -1;
        else groupIdx++;
      } else {
        if (groupIdx === 0) direction = 1;
        else groupIdx--;
      }
    }

    await prisma.$transaction([
      ...nextStage.groups.map((g: any, i: number) =>
        prisma.stageGroup.update({ where: { id: g.id }, data: { teamIds: groupAssignments[i] } })
      ),
      prisma.stage.update({
        where: { id: stageId },
        data: { status: "COMPLETED", isLocked: true, lockedAt: new Date(), teamsAdvancing: qualified.length },
      }),
      prisma.stage.update({
        where: { id: nextStage.id },
        data: { status: "ACTIVE", totalTeams: qualified.length },
      }),
      ...qualified.map((q: any) =>
        prisma.teamProgression.upsert({
          where: { stageId_teamId: { stageId, teamId: q.teamId } },
          create: {
            tournamentId: id, stageId, teamId: q.teamId, teamName: q.teamName,
            finalPosition: standings.indexOf(q) + 1,
            points: q.points, kills: q.kills, wwcds: q.wwcds,
            status: "QUALIFIED", advancedToStageId: nextStage.id,
          },
          update: {
            finalPosition: standings.indexOf(q) + 1,
            points: q.points, status: "QUALIFIED", advancedToStageId: nextStage.id,
          },
        })
      ),
    ]);

    // Discord announcement
    if (fresh.discord) {
      const wh = fresh.discord;
      const isValid = wh.startsWith("https://discord.com/api/webhooks/") || wh.startsWith("https://discordapp.com/api/webhooks/");
      if (isValid) {
        const branding = (fresh.brandingData as any) || {};
        const primaryColor = parseInt((branding.primaryColor || "#f59e0b").replace("#", ""), 16) || 0xf59e0b;
        const publicUrl = "https://www.tournaops.com/tournaments/" + fresh.slug;

        // Advancement embed
        const chunks: string[][] = [];
        for (let i = 0; i < qualified.length; i += 20) {
          chunks.push(qualified.slice(i, i + 20).map((t: any, j: number) => {
            const rank = i + j + 1;
            const tag = t.teamTag ? "[" + t.teamTag + "] " : "";
            return "`#" + String(rank).padStart(2, "0") + "` **" + tag + t.teamName + "** \u2014 " + t.points + " pts";
          }));
        }

        const advEmbed: any = {
          title: "\uD83C\uDFC6 " + currentStage.name.toUpperCase() + " COMPLETE",
          description: "**" + qualified.length + " teams** have advanced to **" + nextStage.name + "**!\n\n\uD83D\uDD13 " + nextStage.name + " is now UNLOCKED.",
          color: primaryColor,
          fields: chunks.slice(0, 5).map((chunk, i) => ({
            name: i === 0 ? "\u2705 QUALIFIED TEAMS" : "\u2705 QUALIFIED (cont.)",
            value: chunk.join("\n"),
            inline: false,
          })),
          footer: { text: "TournaOps \u2022 Auto-advancement", icon_url: "https://www.tournaops.com/logo.png" },
          timestamp: new Date().toISOString(),
        };
        advEmbed.fields.push({
          name: "\uD83D\uDD17 LINKS",
          value: "\uD83C\uDFC6 [Tournament Page](" + publicUrl + ") \u2022 \uD83D\uDCCA [Standings](" + publicUrl + "/results)",
          inline: false,
        });

        await fetch(wh, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: "@everyone", embeds: [advEmbed] }),
        });

        // Slot list embeds
        const refreshedNext = await prisma.stage.findUnique({
          where: { id: nextStage.id },
          include: { groups: { orderBy: { order: "asc" } } },
        });
        const teamMap = new Map(fresh.teams.map(t => [t.id, t]));
        const slotEmbeds: any[] = [];
        slotEmbeds.push({
          title: "\uD83D\uDCCB " + nextStage.name.toUpperCase() + " \u2014 SLOT LIST",
          description: "**" + fresh.name + "**\n\uD83D\uDC65 " + qualified.length + " Teams \u2022 " + (refreshedNext?.groups.length || 0) + " Groups",
          color: primaryColor,
        });
        for (const g of (refreshedNext?.groups || []).slice(0, 9)) {
          const lines = (g.teamIds || []).map((tid: string, i: number) => {
            const t = teamMap.get(tid) as any;
            if (!t) return null;
            const tag = t.tag ? "[" + t.tag + "] " : "";
            return "\u0060Slot " + String(i + 1).padStart(2, "0") + "\u0060 \u2014 **" + tag + t.name + "**";
          }).filter(Boolean);
          slotEmbeds.push({
            title: "\uD83D\uDD37 " + g.name.toUpperCase() + " \u2014 " + lines.length + " Teams",
            color: primaryColor,
            description: lines.join("\n") || "_No teams_",
          });
        }
        if (slotEmbeds.length > 1) {
          await fetch(wh, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: slotEmbeds }),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      qualified: qualified.length,
      nextStage: nextStage.name,
      message: qualified.length + " teams advanced to " + nextStage.name,
    });
  } catch (err: any) {
    console.error("[FORCE_ADVANCE]", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}