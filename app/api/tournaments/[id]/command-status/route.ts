import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { verifyTournamentOwnership } from "@/lib/authorization";
import { checkStageCompletion } from "@/lib/stage-advancement-engine";
import { logError } from "@/lib/logger";

// GET /api/tournaments/[id]/command-status
// Returns a single fast summary for the organizer command center.
// All calculations are server-side.

export async function GET(
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

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: {
          select: { id: true, name: true, tag: true, logo: true, seed: true },
          orderBy: { name: "asc" },
        },
        stages: {
          include: {
            groups: {
              select: {
                id: true,
                name: true,
                order: true,
                teamIds: true,
                status: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        matches: {
          select: {
            id: true,
            stageId: true,
            groupId: true,
            status: true,
            results: true,
            matchNumber: true,
            map: true,
            name: true,
          },
          orderBy: { matchNumber: "asc" },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    const teams = tournament.teams;
    const stages = tournament.stages;
    const matches = tournament.matches;

    // ── ACTIVE STAGE ──────────────────────────────────────────
    const activeStage =
      stages.find((s) => s.status === "ACTIVE") ||
      stages.find((s) => s.status === "READY") ||
      stages[0] ||
      null;

    // ── MATCH PROGRESS ────────────────────────────────────────
    const totalMatches = matches.length;
    const completedMatches = matches.filter(
      (m) =>
        m.status === "completed" &&
        Array.isArray(m.results) &&
        (m.results as any[]).length > 0
    ).length;
    const pendingMatches = totalMatches - completedMatches;

    // ── PER-STAGE PROGRESS ────────────────────────────────────
    const stageProgress = stages.map((stage) => {
      const stageMatches = matches.filter((m) => m.stageId === stage.id);
      const stageCompleted = stageMatches.filter(
        (m) =>
          m.status === "completed" &&
          Array.isArray(m.results) &&
          (m.results as any[]).length > 0
      ).length;
      const teamsAssigned = stage.groups.reduce(
        (sum, g) => sum + (g.teamIds?.length || 0),
        0
      );

      return {
        stageId: stage.id,
        stageName: stage.name,
        stageStatus: stage.status,
        stageOrder: stage.order,
        isLocked: stage.isLocked,
        totalMatches: stageMatches.length,
        completedMatches: stageCompleted,
        pendingMatches: stageMatches.length - stageCompleted,
        teamsAssigned,
        totalCapacity: stage.numGroups * stage.teamsPerGroup,
        numGroups: stage.numGroups,
        completionPercent:
          stageMatches.length > 0
            ? Math.round((stageCompleted / stageMatches.length) * 100)
            : 0,
      };
    });

    // ── ACTIVE STAGE COMPLETION CHECK ─────────────────────────
    let activeStageCompletion = null;
    let canAdvance = false;

    if (activeStage) {
      const completion = await checkStageCompletion(activeStage.id);
      activeStageCompletion = completion;

      const nextStage = stages.find(
        (s) => s.order === activeStage.order + 1
      );

      const nextStageHasTeams =
        nextStage?.groups?.some(
          (g) => Array.isArray(g.teamIds) && g.teamIds.length > 0
        ) || false;

      canAdvance =
        completion.isComplete &&
        !!nextStage &&
        !nextStageHasTeams &&
        !activeStage.isLocked;
    }

    // ── SERVER-SIDE TOP 5 STANDINGS ───────────────────────────
    const teamStats = new Map<
      string,
      {
        teamId: string;
        teamName: string;
        teamTag: string;
        teamLogo: string;
        points: number;
        kills: number;
        wwcds: number;
        matchesPlayed: number;
      }
    >();

    for (const team of teams) {
      teamStats.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        teamTag: team.tag || "",
        teamLogo: team.logo || "",
        points: 0,
        kills: 0,
        wwcds: 0,
        matchesPlayed: 0,
      });
    }

    for (const match of matches) {
      if (
        match.status !== "completed" ||
        !Array.isArray(match.results)
      )
        continue;
      for (const r of match.results as any[]) {
        const s = teamStats.get(r.teamId);
        if (!s) continue;
        s.points += Number(r.totalPoints) || 0;
        s.kills += Number(r.kills) || 0;
        if (r.wwcd || Number(r.placement) === 1) s.wwcds++;
        s.matchesPlayed++;
      }
    }

    const standings = Array.from(teamStats.values())
      .filter((s) => s.matchesPlayed > 0)
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.wwcds - a.wwcds ||
          b.kills - a.kills
      )
      .slice(0, 5)
      .map((s, i) => ({ ...s, rank: i + 1 }));

    // ── NEXT RECOMMENDED ACTION ───────────────────────────────
    function getNextAction(): {
      action: string;
      label: string;
      description: string;
      urgency: "high" | "medium" | "low";
      href?: string;
    } {
      if (teams.length === 0) {
        return {
          action: "IMPORT_TEAMS",
          label: "Import Teams",
          description: "No teams registered yet. Start by importing teams.",
          urgency: "high",
          href: `/dashboard/tournaments/${id}/bulk-import`,
        };
      }

      if (stages.length === 0) {
        return {
          action: "GENERATE_TOURNAMENT",
          label: "Generate Tournament Structure",
          description: "Create stages, groups, and matches for this tournament.",
          urgency: "high",
          href: `/dashboard/tournaments/${id}/stages`,
        };
      }

      const firstStage = stages[0];
      const firstStageTeams = firstStage.groups.reduce(
        (sum, g) => sum + (g.teamIds?.length || 0),
        0
      );

      if (firstStageTeams === 0) {
        return {
          action: "ASSIGN_TEAMS",
          label: "Assign Teams to Groups",
          description: `${teams.length} teams registered but not yet assigned to groups.`,
          urgency: "high",
          href: `/dashboard/tournaments/${id}/stages`,
        };
      }

      if (pendingMatches > 0 && completedMatches === 0) {
        return {
          action: "START_MATCHES",
          label: "Enter Match Results",
          description: `${totalMatches} matches waiting. Enter results to start tracking standings.`,
          urgency: "high",
          href: `/dashboard/tournaments/${id}/match-results`,
        };
      }

      if (pendingMatches > 0) {
        return {
          action: "CONTINUE_MATCHES",
          label: "Enter Remaining Results",
          description: `${pendingMatches} match${pendingMatches !== 1 ? "es" : ""} remaining in current stage.`,
          urgency: "medium",
          href: `/dashboard/tournaments/${id}/match-results`,
        };
      }

      if (canAdvance) {
        return {
          action: "ADVANCE_STAGE",
          label: "Advance to Next Stage",
          description: `All matches complete. Ready to advance teams to ${stages.find((s) => s.order === (activeStage?.order ?? 0) + 1)?.name || "next stage"}.`,
          urgency: "high",
          href: `/dashboard/tournaments/${id}/stages`,
        };
      }

      if (activeStage?.isLocked && stages.every((s) => s.isLocked || s.status === "COMPLETED")) {
        return {
          action: "PUBLISH_RESULTS",
          label: "Publish Final Results",
          description: "Tournament complete. Publish the final results.",
          urgency: "medium",
          href: `/tournaments/${tournamentSlug}/results`,
        };
      }

      return {
        action: "ALL_GOOD",
        label: "Tournament Running",
        description: "Everything is in order. Continue entering match results.",
        urgency: "low",
        href: `/dashboard/tournaments/${id}/match-results`,
      };
    }

    const tournamentSlug = tournament.slug;
    const nextAction = getNextAction();

    // ── INTEGRATION STATUS ────────────────────────────────────
    const discordConfigured =
      !!tournament.discord &&
      (tournament.discord.startsWith("https://discord.com/api/webhooks/") ||
        tournament.discord.startsWith("https://discordapp.com/api/webhooks/"));

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        status: tournament.status,
        prizePool: tournament.prizePool,
        maxTeams: tournament.maxTeams,
        overlayToken: tournament.overlayToken,
        brandingData: tournament.brandingData,
        bannerImage: tournament.bannerImage,
      },
      teams: {
        total: teams.length,
        capacity: tournament.maxTeams,
        slots_remaining: Math.max(0, tournament.maxTeams - teams.length),
      },
      matches: {
        total: totalMatches,
        completed: completedMatches,
        pending: pendingMatches,
        progressPercent:
          totalMatches > 0
            ? Math.round((completedMatches / totalMatches) * 100)
            : 0,
      },
      activeStage: activeStage
        ? {
            id: activeStage.id,
            name: activeStage.name,
            status: activeStage.status,
            order: activeStage.order,
            isLocked: activeStage.isLocked,
            numGroups: activeStage.numGroups,
            teamsPerGroup: activeStage.teamsPerGroup,
          }
        : null,
      activeStageCompletion,
      canAdvance,
      stageProgress,
      standings,
      nextAction,
      integrations: {
        discord: discordConfigured,
        overlayConfigured: !!tournament.overlayToken,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logError(err, "COMMAND_STATUS");
    return NextResponse.json(
      { error: "Failed to load command status" },
      { status: 500 }
    );
  }
}