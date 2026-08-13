import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Analytics — TournaOps" };

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      createdAt: true,
      maxTeams: true,
      prizePool: true,
      _count: {
        select: {
          registrations: true,
          stages: true,
        },
      },
      registrations: {
        select: {
          status: true,
          team: {
            select: {
              name: true,
              _count: { select: { members: true } },
            },
          },
        },
      },
      stages: {
        select: {
          matches: {
            select: {
              status: true,
              scoreA: true,
              scoreB: true,
              scheduledAt: true,
            },
          },
        },
      },
    },
  });

  const globalStats = await prisma.$transaction([
    prisma.tournament.count({ where: { organizerId: session.user.id } }),
    prisma.registration.count({
      where: {
        tournament: { organizerId: session.user.id },
        status: "APPROVED",
      },
    }),
    prisma.match.count({
      where: {
        stage: {
          tournament: { organizerId: session.user.id },
        },
        status: "COMPLETED",
      },
    }),
  ]);

  return (
    <AnalyticsClient
      tournaments={tournaments}
      totalTournaments={globalStats[0]}
      totalApprovedTeams={globalStats[1]}
      totalMatchesPlayed={globalStats[2]}
    />
  );
}