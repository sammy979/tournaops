import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { logError } from "@/lib/logger";

export async function GET() {
  try {
    // ── Auth check ─────────────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // ── Admin check — verify from DB not just session ──────────
    const requestingUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isAdmin: true },
    });

    if (!requestingUser?.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // ── Fetch stats ────────────────────────────────────────────
    const [
      totalUsers,
      totalTournaments,
      totalTeams,
      totalMatches,
      totalDiscordImports,
      pendingDiscordImports,
      users,
      tournaments,
      recentImports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tournament.count(),
      prisma.team.count(),
      prisma.match.count(),
      prisma.discordImport.count(),
      prisma.discordImport.count({ where: { status: "pending" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          isAdmin: true,
          createdAt: true,
          _count: { select: { tournaments: true } },
          // Never select: password
        },
        take: 100,
      }),
      prisma.tournament.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          maxTeams: true,
          isPublic: true,
          createdAt: true,
          createdBy: { select: { email: true, username: true } },
          _count: { select: { teams: true, matches: true } },
        },
        take: 100,
      }),
      prisma.discordImport.findMany({
        orderBy: { receivedAt: "desc" },
        select: {
          id: true,
          discordGuildName: true,
          discordChannelName: true,
          discordUsername: true,
          status: true,
          receivedAt: true,
          importedAt: true,
          // Not selecting messageContent to avoid data bloat
        },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      isAdmin: true,
      stats: {
        totalUsers,
        totalTournaments,
        totalTeams,
        totalMatches,
        totalDiscordImports,
        pendingDiscordImports,
      },
      users,
      tournaments,
      recentImports,
    });
  } catch (err) {
    logError(err, "ADMIN_STATS");
    return NextResponse.json(
      { error: "Failed to load admin statistics" },
      { status: 500 }
    );
  }
}
