import { prisma } from "@/lib/prisma";

export async function getTournamentFull(id: string, userId: string) {
  return prisma.tournament.findFirst({
    where: { id, userId },
    include: {
      teams: {
        include: {
          playersList: true,
        },
        orderBy: { name: "asc" },
      },
      rounds: {
        orderBy: { order: "asc" },
      },
      matches: {
        orderBy: { matchNumber: "asc" },
      },
      stages: {
        include: {
          groups: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function getTournamentList(userId: string) {
  return prisma.tournament.findMany({
    where: { userId },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      format: true,
      prizePool: true,
      maxTeams: true,
      isPublic: true,
      createdAt: true,
      _count: {
        select: {
          teams: true,
          rounds: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTournamentPublic(slug: string) {
  return prisma.tournament.findFirst({
    where: { slug, isPublic: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      game: true,
      status: true,
      format: true,
      prizePool: true,
      maxTeams: true,
      scoringRule: true,
      mapRotation: true,
      bannerImage: true,
      rules: true,
      createdAt: true,
      teams: {
        select: {
          id: true,
          name: true,
          tag: true,
          logo: true,
        },
        orderBy: { name: "asc" },
      },
      rounds: {
        select: {
          id: true,
          name: true,
          order: true,
        },
      },
      matches: {
        select: {
          id: true,
          matchNumber: true,
          map: true,
          status: true,
          results: true,
        },
      },
    },
  });
}

export async function getMatchWithResults(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      tournament: true,
    },
  });
}