import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });

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
      include: { _count: { select: { tournaments: true } } },
      take: 100,
    }),
    prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { email: true, username: true } },
        _count: { select: { teams: true, matches: true } },
      },
      take: 100,
    }),
    prisma.discordImport.findMany({
      orderBy: { receivedAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({
    isAdmin: true,
    stats: {
      totalUsers, totalTournaments, totalTeams, totalMatches,
      totalDiscordImports, pendingDiscordImports,
    },
    users: users.map(u => ({
      id: u.id, email: u.email, username: u.username,
      displayName: u.displayName, isAdmin: u.isAdmin,
      createdAt: u.createdAt, _count: u._count,
    })),
    tournaments,
    recentImports,
  });
}