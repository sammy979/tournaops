import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";
import {
  parseScoringConfig,
  calculateMatchScore,
} from "@/lib/scoring-engine";

// ============================================================
// SCORING — uses lib/scoring-engine.ts as single source of truth
// Handles all three storage formats (dictionary, array, placementTable)
// for backwards compatibility with existing tournament data
// ============================================================

function getPlacementPoints(placement: number, scoringRule: any): number {
  if (!scoringRule) return 0;
  if (
    scoringRule.placementPoints &&
    typeof scoringRule.placementPoints === "object" &&
    !Array.isArray(scoringRule.placementPoints)
  ) {
    return Number(scoringRule.placementPoints[placement]) || 0;
  }
  if (Array.isArray(scoringRule.placementPoints)) {
    return Number(scoringRule.placementPoints[placement - 1]) || 0;
  }
  if (
    scoringRule.placementTable &&
    typeof scoringRule.placementTable === "object"
  ) {
    return Number(scoringRule.placementTable[placement]) || 0;
  }
  return 0;
}

function calculateResultPoints(result: any, scoringRule: any): any {
  if (!scoringRule || !result) return result;
  const placement = Number(result.placement) || 0;
  const kills = Number(result.kills) || 0;
  const killPointsPerKill = Number(scoringRule.killPoints) || 1;
  const wwcdBonus = Number(scoringRule.wwcdBonus) || 0;
  const isWWCD = placement === 1 || result.wwcd === true;

  const placementPoints = getPlacementPoints(placement, scoringRule);
  const killPoints = kills * killPointsPerKill;
  const bonus = isWWCD ? wwcdBonus : 0;
  const totalPoints = placementPoints + killPoints + bonus;

  return {
    ...result,
    placement,
    kills,
    placementPoints,
    killPoints,
    totalPoints,
    wwcd: isWWCD,
  };
}

// ============================================================
// DISCORD — post match result
// ============================================================

async function postToDiscord(
  webhookUrl: string,
  match: any,
  tournament: any
): Promise<boolean> {
  try {
    const results = Array.isArray(match.results) ? match.results : [];
    const teams = tournament.teams || [];
    const teamMap = new Map(teams.map((t: any) => [t.id, t]));
    const branding = tournament.brandingData || {};
    const sponsors: any[] = Array.isArray(branding.sponsors)
      ? branding.sponsors
      : [];
    const titleSponsor = sponsors.find((s: any) => s.tier === "title");
    const otherSponsors = sponsors.filter((s: any) => s.tier !== "title");
    const primaryColor = branding.primaryColor || "#f59e0b";
    const colorInt =
      parseInt(primaryColor.replace("#", ""), 16) || 0xf59e0b;

    const sorted = [...results].sort(
      (a: any, b: any) => (a.placement || 999) - (b.placement || 999)
    );
    const top5 = sorted.slice(0, 5);
    const winner = sorted.find((r: any) => r.placement === 1);
    const winnerTeam = winner
      ? (teamMap.get(winner.teamId) as any)
      : null;
    const topFragger = [...results].sort(
      (a: any, b: any) => (b.kills || 0) - (a.kills || 0)
    )[0];
    const topFraggerTeam = topFragger
      ? (teamMap.get(topFragger.teamId) as any)
      : null;
    const totalKills = results.reduce(
      (s: number, r: any) => s + (Number(r.kills) || 0),
      0
    );
    const publicUrl =
      "https://www.tournaops.com/tournaments/" + tournament.slug;
    const standingsUrl = publicUrl + "/results";

    const descParts: string[] = [];
    if (match.map) descParts.push("\uD83D\uDDFA\uFE0F **Map:** " + match.map);
    if (titleSponsor)
      descParts.push("\u2B50 **Title Sponsor:** " + titleSponsor.name);
    descParts.push(
      "\uD83D\uDC65 **" +
        teams.length +
        " Teams** \u2022 \uD83D\uDCA5 **" +
        totalKills +
        " Total Kills**"
    );

    const embed: any = {
      author: {
        name: tournament.name,
        url: publicUrl,
        icon_url: branding.orgLogo || undefined,
      },
      title:
        "\uD83C\uDFC6 " +
        (match.name || "Match " + match.matchNumber) +
        " \u2014 Results",
      url: standingsUrl,
      description: descParts.join("\n"),
      color: colorInt,
      fields: [] as any[],
      footer: {
        text: "TournaOps \u2022 Live tournament management for PUBG Mobile",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    };

    if (winnerTeam) {
      const tag = winnerTeam.tag ? "[" + winnerTeam.tag + "] " : "";
      embed.fields.push({
        name: "\uD83E\uDD47 CHICKEN DINNER",
        value:
          "**" +
          tag +
          winnerTeam.name +
          "**\n\uD83D\uDD2B `" +
          (winner.kills || 0) +
          " kills` \u2022 \uD83C\uDFAF `" +
          (winner.totalPoints || 0) +
          " pts`",
        inline: true,
      });
    }

    if (topFraggerTeam && topFragger?.kills > 0) {
      const tag = topFraggerTeam.tag ? "[" + topFraggerTeam.tag + "] " : "";
      embed.fields.push({
        name: "\uD83D\uDC80 TOP FRAGGER",
        value:
          "**" +
          tag +
          topFraggerTeam.name +
          "**\n\uD83D\uDD2B `" +
          topFragger.kills +
          " eliminations`",
        inline: true,
      });
    }

    if (winnerTeam || topFraggerTeam) {
      embed.fields.push({ name: "\u200B", value: "\u200B", inline: true });
    }

    if (top5.length > 0) {
      const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
      const leaderboard = top5
        .map((r: any) => {
          const t = teamMap.get(r.teamId) as any;
          if (!t) return null;
          const prefix =
            r.placement <= 3
              ? medals[r.placement - 1]
              : "`#" + String(r.placement).padStart(2, " ") + "`";
          const tag = t.tag ? "[" + t.tag + "] " : "";
          const kills = String(r.kills || 0).padStart(2, " ");
          const pts = String(r.totalPoints || 0).padStart(3, " ");
          return (
            prefix +
            " **" +
            tag +
            t.name +
            "** \u2014 `" +
            kills +
            "K` \u2022 `" +
            pts +
            " pts`"
          );
        })
        .filter(Boolean)
        .join("\n");

      if (leaderboard) {
        embed.fields.push({
          name: "\uD83D\uDCCA MATCH LEADERBOARD",
          value: leaderboard,
          inline: false,
        });
      }
    }

    if (otherSponsors.length > 0) {
      const tierEmoji: Record<string, string> = {
        platinum: "\uD83D\uDCA0",
        gold: "\uD83E\uDD47",
        silver: "\uD83E\uDD48",
      };
      const sponsorLines = otherSponsors
        .slice(0, 10)
        .map((s: any) => {
          const e = tierEmoji[s.tier] || "\u2B50";
          return e + " " + s.name;
        })
        .join("  \u2022  ");
      embed.fields.push({
        name: "\uD83E\uDD1D SPONSORED BY",
        value: sponsorLines,
        inline: false,
      });
    }

    embed.fields.push({
      name: "\uD83D\uDD17 LINKS",
      value:
        "\uD83D\uDCCA [Live Standings](" +
        standingsUrl +
        ") \u2022 \uD83C\uDFC6 [Tournament Page](" +
        publicUrl +
        ")",
      inline: false,
    });

    const payload: any = { embeds: [embed] };
    if (tournament.bannerImage) {
      embed.thumbnail = { url: tournament.bannerImage };
    }
    if (winner && winner.kills >= 15) {
      payload.content =
        "\uD83D\uDD25 **HUGE WIN!** " +
        (winnerTeam?.name || "") +
        " just dropped " +
        winner.kills +
        " kills!";
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.warn("[DISCORD_AUTOPOST] Failed:", e);
    return false;
  }
}

// ============================================================
// DISCORD — post overall standings after match
// ============================================================

async function postStandingsToDiscord(
  webhookUrl: string,
  tournament: any
): Promise<boolean> {
  try {
    const stages = tournament.stages || [];
    const activeStage = stages.find(
      (s: any) =>
        s.status === "ACTIVE" ||
        (s.groups &&
          s.groups.some((g: any) => (g.teamIds || []).length > 0))
    );

    if (activeStage && activeStage.groups && activeStage.groups.length > 1) {
      const teams = tournament.teams || [];
      const teamMap = new Map(teams.map((t: any) => [t.id, t]));
      const branding = tournament.brandingData || {};
      const primaryColor =
        parseInt(
          (branding.primaryColor || "#f59e0b").replace("#", ""),
          16
        ) || 0xf59e0b;
      const publicUrl =
        "https://www.tournaops.com/tournaments/" + tournament.slug;
      const scoringRule = activeStage.scoringRule ||
        tournament.scoringRule || {};

      const embeds: any[] = [];
      embeds.push({
        title:
          "\uD83D\uDCCA " +
          activeStage.name.toUpperCase() +
          " \u2014 GROUP STANDINGS",
        description:
          "**" +
          tournament.name +
          "** \u2014 Live update after latest match",
        color: primaryColor,
      });

      for (const group of activeStage.groups.slice(0, 8)) {
        const stats = new Map<string, any>();
        for (const tid of group.teamIds || []) {
          const t = teamMap.get(tid) as any;
          if (t)
            stats.set(tid, {
              name: t.name,
              tag: t.tag,
              points: 0,
              kills: 0,
              wwcds: 0,
              matches: 0,
            });
        }
        const groupMatches = (tournament.matches || []).filter(
          (m: any) =>
            m.groupId === group.id &&
            m.status === "completed" &&
            Array.isArray(m.results)
        );
        for (const match of groupMatches) {
          for (const r of match.results) {
            const s = stats.get(r.teamId);
            if (!s) continue;
            s.points += Number(r.totalPoints) || 0;
            s.kills += Number(r.kills) || 0;
            if (r.wwcd || Number(r.placement) === 1) s.wwcds++;
            s.matches++;
          }
        }
        const sorted = Array.from(stats.values()).sort(
          (a: any, b: any) =>
            b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills
        );
        const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
        const lines = sorted.slice(0, 16).map((s: any, i: number) => {
          const prefix =
            i < 3
              ? medals[i]
              : "\u0060#" + String(i + 1).padStart(2, " ") + "\u0060";
          const tag = s.tag ? "[" + s.tag + "] " : "";
          return (
            prefix +
            " **" +
            tag +
            s.name +
            "** \u2014 \u0060" +
            s.points +
            " pts\u0060 \u2022 \u0060" +
            s.kills +
            "K\u0060 \u2022 \u0060" +
            s.wwcds +
            "W\u0060"
          );
        });
        embeds.push({
          title:
            "\uD83D\uDD37 " +
            group.name.toUpperCase() +
            " \u2014 " +
            groupMatches.length +
            " matches",
          description: lines.join("\n") || "_No results yet_",
          color: primaryColor,
        });
      }

      embeds.push({
        color: primaryColor,
        fields: [
          {
            name: "\uD83D\uDD17 LINKS",
            value:
              "\uD83C\uDFC6 [Tournament Page](" +
              publicUrl +
              ") \u2022 \uD83D\uDCCA [Live Standings](" +
              publicUrl +
              "/results)",
            inline: false,
          },
        ],
        footer: {
          text: "TournaOps \u2022 Auto-updated after every match",
          icon_url: "https://www.tournaops.com/logo.png",
        },
        timestamp: new Date().toISOString(),
      });

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds }),
      });
      return res.ok || res.status === 204;
    }
  } catch (e) {
    console.warn("[GROUP_STANDINGS] Fallback to overall:", e);
  }

  try {
    const teams = tournament.teams || [];
    const matches = tournament.matches || [];
    const branding = tournament.brandingData || {};
    const primaryColor = branding.primaryColor || "#f59e0b";
    const colorInt =
      parseInt(primaryColor.replace("#", ""), 16) || 0xf59e0b;
    const publicUrl =
      "https://www.tournaops.com/tournaments/" + tournament.slug;
    const standingsUrl = publicUrl + "/results";

    const teamStats = new Map<string, any>();
    for (const team of teams) {
      teamStats.set(team.id, {
        id: team.id,
        name: team.name,
        tag: team.tag,
        points: 0,
        kills: 0,
        wwcds: 0,
        matches: 0,
      });
    }

    let totalKills = 0;
    let totalMatches = 0;

    for (const match of matches) {
      if (
        match.status !== "completed" ||
        !Array.isArray(match.results)
      )
        continue;
      totalMatches++;
      for (const r of match.results) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        const kills = Number(r.kills) || 0;
        const isWWCD = r.wwcd === true || Number(r.placement) === 1;
        // Use pre-calculated totalPoints stored in result (server-authoritative)
        s.points += Number(r.totalPoints) || 0;
        s.kills += kills;
        if (isWWCD) s.wwcds++;
        s.matches++;
        totalKills += kills;
      }
    }

    const standings = Array.from(teamStats.values())
      .filter((s: any) => s.matches > 0)
      .sort((a: any, b: any) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wwcds !== a.wwcds) return b.wwcds - a.wwcds;
        return b.kills - a.kills;
      })
      .map((s: any, i: number) => ({ ...s, rank: i + 1 }));

    if (standings.length === 0) return true;

    const top10 = standings.slice(0, 10);
    const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

    const leaderboard = top10
      .map((s: any) => {
        const prefix =
          s.rank <= 3
            ? medals[s.rank - 1]
            : "`#" + String(s.rank).padStart(2, " ") + "`";
        const tag = s.tag ? "[" + s.tag + "] " : "";
        const pts = String(s.points).padStart(3, " ");
        const kills = String(s.kills).padStart(3, " ");
        const wwcds = String(s.wwcds).padStart(2, " ");
        return (
          prefix +
          " **" +
          tag +
          s.name +
          "** \u2014 `" +
          pts +
          " pts` \u2022 `" +
          kills +
          "K` \u2022 `" +
          wwcds +
          " W`"
        );
      })
      .join("\n");

    const embed: any = {
      author: {
        name: tournament.name,
        url: publicUrl,
        icon_url: branding.orgLogo || undefined,
      },
      title:
        "\uD83D\uDCCA OVERALL STANDINGS \u2014 After " +
        totalMatches +
        " Match" +
        (totalMatches !== 1 ? "es" : ""),
      url: standingsUrl,
      description:
        "\uD83D\uDC65 **" +
        teams.length +
        " Teams** \u2022 \uD83D\uDCA5 **" +
        totalKills +
        " Total Kills** \u2022 \uD83C\uDFAE **" +
        totalMatches +
        "/" +
        matches.length +
        " Matches**",
      color: colorInt,
      fields: [
        { name: "\uD83C\uDFC6 TOP 10", value: leaderboard, inline: false },
        {
          name: "\uD83D\uDD17 LIVE STANDINGS",
          value:
            "\uD83D\uDCCA [View Full Standings](" +
            standingsUrl +
            ") \u2022 \uD83C\uDFC6 [Tournament Page](" +
            publicUrl +
            ")",
          inline: false,
        },
      ],
      footer: {
        text: "TournaOps \u2022 Auto-updated after every match",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    };

    if (tournament.bannerImage) {
      embed.thumbnail = { url: tournament.bannerImage };
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok || res.status === 204;
  } catch (e) {
    console.warn("[DISCORD_STANDINGS] Failed:", e);
    return false;
  }
}

// ============================================================
// AUTO-ADVANCE
// ============================================================

async function autoAdvanceIfStageComplete(
  webhookUrl: string | null,
  tournament: any,
  currentStageId: string
) {
  try {
    const fresh = await prisma.tournament.findUnique({
      where: { id: tournament.id },
      include: {
        stages: { include: { groups: true }, orderBy: { order: "asc" } },
        matches: true,
        teams: true,
      },
    });
    if (!fresh) return;

    const currentStage = fresh.stages.find((s) => s.id === currentStageId);
    if (!currentStage) return;

    const stageMatches = fresh.matches.filter(
      (m) => m.stageId === currentStageId
    );
    if (stageMatches.length === 0) return;

    const allCompleted = stageMatches.every(
      (m) =>
        m.status === "completed" &&
        Array.isArray(m.results) &&
        (m.results as any[]).length > 0
    );
    if (!allCompleted) return;

    const nextStage = fresh.stages.find(
      (s) => s.order === currentStage.order + 1
    );
    if (!nextStage) {
      if (webhookUrl) {
        await postTournamentCompleteToDiscord(
          webhookUrl,
          fresh,
          currentStage
        );
      }
      return;
    }

    const nextStageHasTeams = nextStage.groups.some(
      (g: any) => (g.teamIds || []).length > 0
    );
    if (nextStageHasTeams) return;

    // Use pre-calculated totalPoints from stored results (server-authoritative)
    const stageTeamIds = new Set<string>();
    for (const g of currentStage.groups)
      (g.teamIds || []).forEach((id: string) => stageTeamIds.add(id));

    const teamStats = new Map<string, any>();
    for (const tid of stageTeamIds) {
      const team = fresh.teams.find((t) => t.id === tid);
      if (team) {
        teamStats.set(tid, {
          teamId: tid,
          teamName: team.name,
          teamTag: team.tag,
          points: 0,
          kills: 0,
          wwcds: 0,
        });
      }
    }

    for (const match of stageMatches) {
      for (const r of match.results as any[]) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        // Use server-calculated totalPoints — do not recalculate
        s.points += Number(r.totalPoints) || 0;
        s.kills += Number(r.kills) || 0;
        if (r.wwcd || Number(r.placement) === 1) s.wwcds++;
      }
    }

    const standings = Array.from(teamStats.values()).sort(
      (a, b) =>
        b.points - a.points || b.wwcds - a.wwcds || b.kills - a.kills
    );

    const nextStageCapacity =
      nextStage.groups.length * (nextStage.teamsPerGroup || 16);
    const advanceCount = Math.min(standings.length, nextStageCapacity);
    const qualified = standings.slice(0, advanceCount);
    const eliminated = standings.slice(advanceCount);

    const groupAssignments: string[][] = nextStage.groups.map(() => []);
    let direction = 1;
    let groupIdx = 0;
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
        prisma.stageGroup.update({
          where: { id: g.id },
          data: { teamIds: groupAssignments[i] },
        })
      ),
      prisma.stage.update({
        where: { id: currentStageId },
        data: {
          status: "COMPLETED",
          isLocked: true,
          lockedAt: new Date(),
          teamsAdvancing: qualified.length,
          teamsEliminated: eliminated.length,
        },
      }),
      prisma.stage.update({
        where: { id: nextStage.id },
        data: { status: "ACTIVE", totalTeams: qualified.length },
      }),
      ...qualified.map((q: any) =>
        prisma.teamProgression.upsert({
          where: {
            stageId_teamId: {
              stageId: currentStageId,
              teamId: q.teamId,
            },
          },
          create: {
            tournamentId: fresh.id,
            stageId: currentStageId,
            teamId: q.teamId,
            teamName: q.teamName,
            finalPosition: standings.indexOf(q) + 1,
            points: q.points,
            kills: q.kills,
            wwcds: q.wwcds,
            status: "QUALIFIED",
            advancedToStageId: nextStage.id,
          },
          update: {
            finalPosition: standings.indexOf(q) + 1,
            points: q.points,
            status: "QUALIFIED",
            advancedToStageId: nextStage.id,
          },
        })
      ),
      ...eliminated.map((e: any) =>
        prisma.teamProgression.upsert({
          where: {
            stageId_teamId: {
              stageId: currentStageId,
              teamId: e.teamId,
            },
          },
          create: {
            tournamentId: fresh.id,
            stageId: currentStageId,
            teamId: e.teamId,
            teamName: e.teamName,
            finalPosition: standings.indexOf(e) + 1,
            points: e.points,
            kills: e.kills,
            wwcds: e.wwcds,
            status: "ELIMINATED",
          },
          update: {
            finalPosition: standings.indexOf(e) + 1,
            points: e.points,
            status: "ELIMINATED",
          },
        })
      ),
    ]);

    const refreshedNext = await prisma.stage.findUnique({
      where: { id: nextStage.id },
      include: { groups: { orderBy: { order: "asc" } } },
    });

    if (webhookUrl) {
      await postAdvancementToDiscord(
        webhookUrl,
        fresh,
        currentStage,
        nextStage,
        qualified
      );
      if (refreshedNext) {
        await postNextStageSlotListToDiscord(
          webhookUrl,
          fresh,
          refreshedNext
        );
      }
    }
  } catch (e) {
    console.error("[AUTO_ADVANCE] Failed:", e);
  }
}

async function postNextStageSlotListToDiscord(
  webhookUrl: string,
  tournament: any,
  stage: any
) {
  try {
    const teams = tournament.teams || [];
    const teamMap = new Map(teams.map((t: any) => [t.id, t]));
    const branding = tournament.brandingData || {};
    const primaryColor =
      parseInt(
        (branding.primaryColor || "#f59e0b").replace("#", ""),
        16
      ) || 0xf59e0b;
    const publicUrl =
      "https://www.tournaops.com/tournaments/" + tournament.slug;
    const groups = stage.groups || [];
    if (groups.length === 0) return;
    const totalTeams = groups.reduce(
      (s: number, g: any) => s + (g.teamIds?.length || 0),
      0
    );
    if (totalTeams === 0) return;

    const embeds: any[] = [];
    embeds.push({
      title:
        "\uD83D\uDCCB " +
        stage.name.toUpperCase() +
        " \u2014 SLOT LIST",
      description:
        "**" +
        tournament.name +
        "**\n\uD83D\uDC65 **" +
        totalTeams +
        " Teams** across **" +
        groups.length +
        " Group" +
        (groups.length !== 1 ? "s" : "") +
        "**\n\n\uD83C\uDFAF Matches will begin soon!",
      color: primaryColor,
      thumbnail: tournament.bannerImage
        ? { url: tournament.bannerImage }
        : undefined,
    });

    for (const group of groups.slice(0, 9)) {
      const groupTeams = (group.teamIds || [])
        .map((id: string, i: number) => {
          const team = teamMap.get(id) as any;
          if (!team) return null;
          const tag = team.tag ? "[" + team.tag + "] " : "";
          const slot = String(i + 1).padStart(2, "0");
          return (
            "\u0060Slot " +
            slot +
            "\u0060 \u2014 **" +
            tag +
            team.name +
            "**"
          );
        })
        .filter(Boolean);

      const chunks: string[][] = [];
      for (let i = 0; i < groupTeams.length; i += 20) {
        chunks.push(groupTeams.slice(i, i + 20));
      }

      embeds.push({
        title:
          "\uD83D\uDD37 " +
          group.name.toUpperCase() +
          " \u2014 " +
          groupTeams.length +
          " Teams",
        color: primaryColor,
        fields:
          chunks.length > 0
            ? chunks.map((chunk, i) => ({
                name:
                  chunks.length > 1
                    ? "Teams " +
                      (i * 20 + 1) +
                      "-" +
                      Math.min((i + 1) * 20, groupTeams.length)
                    : "\u200B",
                value: chunk.join("\n"),
                inline: false,
              }))
            : [{ name: "\u200B", value: "_No teams_", inline: false }],
      });
    }

    embeds.push({
      color: primaryColor,
      fields: [
        {
          name: "\uD83D\uDD17 LINKS",
          value:
            "\uD83C\uDFC6 [Tournament Page](" +
            publicUrl +
            ") \u2022 \uD83D\uDCCA [Live Standings](" +
            publicUrl +
            "/results)",
          inline: false,
        },
      ],
      footer: {
        text: "TournaOps \u2022 " + stage.name + " group draw",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    });

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds }),
    });
  } catch (e) {
    console.error("[DISCORD_NEXT_SLOTLIST] Failed:", e);
  }
}

async function postAdvancementToDiscord(
  webhookUrl: string,
  tournament: any,
  fromStage: any,
  toStage: any,
  qualified: any[]
) {
  try {
    const branding = tournament.brandingData || {};
    const primaryColor =
      parseInt(
        (branding.primaryColor || "#f59e0b").replace("#", ""),
        16
      ) || 0xf59e0b;
    const publicUrl =
      "https://www.tournaops.com/tournaments/" + tournament.slug;

    const chunks: string[][] = [];
    for (let i = 0; i < qualified.length; i += 20) {
      chunks.push(
        qualified.slice(i, i + 20).map((t: any, j: number) => {
          const rank = i + j + 1;
          const tag = t.teamTag ? "[" + t.teamTag + "] " : "";
          return (
            "`#" +
            String(rank).padStart(2, "0") +
            "` **" +
            tag +
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
        "\uD83C\uDFC6 " + fromStage.name.toUpperCase() + " COMPLETE",
      description:
        "**" +
        qualified.length +
        " teams** have advanced to **" +
        toStage.name +
        "**!\n\n\uD83D\uDD13 " +
        toStage.name +
        " is now UNLOCKED.",
      color: primaryColor,
      fields: chunks.slice(0, 5).map((chunk, i) => ({
        name:
          i === 0
            ? "\u2705 QUALIFIED TEAMS"
            : "\u2705 QUALIFIED (cont.)",
        value: chunk.join("\n"),
        inline: false,
      })),
      footer: {
        text: "TournaOps \u2022 Auto-advancement",
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

    if (tournament.bannerImage)
      embed.thumbnail = { url: tournament.bannerImage };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "@everyone", embeds: [embed] }),
    });
  } catch (e) {
    console.error("[DISCORD_ADVANCE] Failed:", e);
  }
}

async function postTournamentCompleteToDiscord(
  webhookUrl: string,
  tournament: any,
  finalStage: any
) {
  try {
    const stageTeamIds = new Set<string>();
    for (const g of finalStage.groups || [])
      (g.teamIds || []).forEach((id: string) => stageTeamIds.add(id));

    const finalMatches = (tournament.matches || []).filter(
      (m: any) =>
        m.stageId === finalStage.id &&
        m.status === "completed" &&
        Array.isArray(m.results)
    );

    const teamStats = new Map<string, any>();
    for (const tid of stageTeamIds) {
      const t = (tournament.teams || []).find((x: any) => x.id === tid);
      if (t)
        teamStats.set(tid, {
          name: t.name,
          tag: t.tag,
          points: 0,
          kills: 0,
          wwcds: 0,
        });
    }

    for (const match of finalMatches) {
      for (const r of match.results) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        // Use server-calculated totalPoints
        s.points += Number(r.totalPoints) || 0;
        s.kills += Number(r.kills) || 0;
        if (r.wwcd || Number(r.placement) === 1) s.wwcds++;
      }
    }

    const finalStandings = Array.from(teamStats.values()).sort(
      (a: any, b: any) => b.points - a.points
    );
    const champion = finalStandings[0];
    const runnerUp = finalStandings[1];
    const third = finalStandings[2];

    const publicUrl =
      "https://www.tournaops.com/tournaments/" + tournament.slug;

    const embed: any = {
      title:
        "\uD83C\uDFC6 " +
        tournament.name.toUpperCase() +
        " \u2014 COMPLETE!",
      description:
        "**Congratulations to all teams!** The tournament has concluded.",
      color: 0xf59e0b,
      fields: [
        champion && {
          name: "\uD83E\uDD47 CHAMPION",
          value:
            "**" +
            (champion.tag ? "[" + champion.tag + "] " : "") +
            champion.name +
            "**\n" +
            champion.points +
            " pts \u2022 " +
            champion.kills +
            " kills",
          inline: true,
        },
        runnerUp && {
          name: "\uD83E\uDD48 RUNNER-UP",
          value:
            "**" +
            (runnerUp.tag ? "[" + runnerUp.tag + "] " : "") +
            runnerUp.name +
            "**\n" +
            runnerUp.points +
            " pts",
          inline: true,
        },
        third && {
          name: "\uD83E\uDD49 THIRD PLACE",
          value:
            "**" +
            (third.tag ? "[" + third.tag + "] " : "") +
            third.name +
            "**\n" +
            third.points +
            " pts",
          inline: true,
        },
        {
          name: "\uD83D\uDD17 FINAL REPORT",
          value:
            "\uD83D\uDCCA [Full Standings](" +
            publicUrl +
            "/results) \u2022 \uD83D\uDCCB [Tournament Report](" +
            publicUrl +
            "/report)",
          inline: false,
        },
      ].filter(Boolean),
      footer: {
        text: "TournaOps \u2022 Tournament complete",
        icon_url: "https://www.tournaops.com/logo.png",
      },
      timestamp: new Date().toISOString(),
    };

    if (tournament.bannerImage)
      embed.image = { url: tournament.bannerImage };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "@everyone \uD83C\uDFC6 TOURNAMENT COMPLETE!",
        embeds: [embed],
      }),
    });
  } catch (e) {
    console.error("[DISCORD_COMPLETE] Failed:", e);
  }
}

// ============================================================
// GET match
// ============================================================

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });

    if (!match)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      match.tournament.userId !== session.userId &&
      !session.isAdmin
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ match });
  } catch (err) {
    logError(err, "MATCH_GET");
    return NextResponse.json(
      { error: "Failed to load match" },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH match — update results with server-side scoring
// ============================================================

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.match.findUnique({
      where: { id },
      include: {
        tournament: { include: { teams: true } },
      },
    });

    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      existing.tournament.userId !== session.userId &&
      !session.isAdmin
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: any = {};

    if ("results" in body && Array.isArray(body.results)) {
      const scoringRule = existing.tournament.scoringRule as any;
      const teams = existing.tournament.teams || [];
      const teamMap = new Map(teams.map((t: any) => [t.id, t]));

      const validResults = body.results.filter(
        (r: any) => r.teamId && Number(r.placement) > 0
      );

      const placements = validResults.map((r: any) => Number(r.placement));
      const hasDuplicates =
        new Set(placements).size !== placements.length;

      const invalidTeams = validResults.filter(
        (r: any) => !teamMap.has(r.teamId)
      );
      if (invalidTeams.length > 0) {
        return NextResponse.json(
          {
            error: "Some teams do not belong to this tournament",
            invalidTeams: invalidTeams.map((r: any) => r.teamId),
          },
          { status: 400 }
        );
      }

      updates.results = validResults.map((r: any) => {
        const team = teamMap.get(r.teamId) as any;
        const calculated = calculateResultPoints(r, scoringRule);
        return {
          ...calculated,
          teamName: team?.name || r.teamName || r.teamId,
          teamTag: team?.tag || null,
          teamLogo: team?.logo || null,
        };
      });

      updates.results.sort(
        (a: any, b: any) => (a.placement || 999) - (b.placement || 999)
      );

      if (hasDuplicates) {
        console.warn(
          "[MATCH_PATCH] Duplicate placements detected in match",
          id
        );
      }
    }

    if ("status" in body) updates.status = body.status;
    if ("map" in body) updates.map = body.map;
    if ("notes" in body) updates.notes = body.notes;
    if ("startTime" in body && body.startTime)
      updates.startTime = new Date(body.startTime);
    if ("endTime" in body && body.endTime)
      updates.endTime = new Date(body.endTime);
    if ("screenshotUrl" in body)
      updates.screenshotUrl = body.screenshotUrl;

    if (updates.results && !updates.status) {
      updates.status = "completed";
    }

    const match = await prisma.match.update({
      where: { id },
      data: updates,
    });

    const hasResults =
      updates.results &&
      Array.isArray(updates.results) &&
      updates.results.length > 0;

    if (hasResults && existing.tournament.discord) {
      const webhookUrl = existing.tournament.discord;
      if (
        webhookUrl.startsWith("https://discord.com/api/webhooks/") ||
        webhookUrl.startsWith("https://discordapp.com/api/webhooks/")
      ) {
        try {
          await postToDiscord(
            webhookUrl,
            {
              ...match,
              name: existing.name,
              matchNumber: existing.matchNumber,
              map: match.map || existing.map,
            },
            existing.tournament
          );
        } catch (e) {
          console.warn("[DISCORD_MATCH] Failed:", e);
        }

        try {
          const freshTournament = await prisma.tournament.findUnique({
            where: { id: existing.tournamentId },
            include: { teams: true, matches: true },
          });
          if (freshTournament) {
            await postStandingsToDiscord(webhookUrl, freshTournament);
          }
        } catch (e) {
          console.warn("[DISCORD_STANDINGS] Failed:", e);
        }

        if (existing.stageId) {
          try {
            await autoAdvanceIfStageComplete(
              webhookUrl,
              existing.tournament,
              existing.stageId
            );
          } catch (e) {
            console.warn("[AUTO_ADVANCE] Failed:", e);
          }
        }
      }
    }

    return NextResponse.json({
      match,
      pointsCalculated: !!updates.results,
    });
  } catch (err) {
    logError(err, "MATCH_PATCH");
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE match
// ============================================================

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    const existing = await prisma.match.findUnique({
      where: { id },
      include: { tournament: true },
    });

    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (
      existing.tournament.userId !== session.userId &&
      !session.isAdmin
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    logError(err, "MATCH_DELETE");
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 }
    );
  }
}