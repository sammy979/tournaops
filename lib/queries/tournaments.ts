import { prisma } from "@/lib/prisma";

// ✅ Single query with all relations — replaces multiple queries
export async function getTournamentFull(id: string, userId: string) {
  return prisma.tournament.findFirst({
    where: { id, userId },
    include: {
      teams: {
        include: {
          players: true,
        },
        orderBy: { name: "asc" },
      },
      rounds: {
        include: {
          matches: {
            include: {
              results: {
                include: {
                  team: true,
                },
              },
            },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
      stages: {
        include: {
          groups: {
            include: {
              teams: true,
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}

// ✅ Lightweight list query — for dashboard list
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

// ✅ Public tournament query — for public pages
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
          roundNumber: true,
          matches: {
            select: {
              id: true,
              matchNumber: true,
              map: true,
              status: true,
              results: {
                select: {
                  id: true,
                  placement: true,
                  kills: true,
                  wwcd: true,
                  team: {
                    select: {
                      id: true,
                      name: true,
                      tag: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

// ✅ Match with results — replaces N+1 in match routes
export async function getMatchWithResults(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      results: {
        include: {
          team: true,
        },
      },
      round: {
        include: {
          tournament: true,
        },
      },
    },
  });
}