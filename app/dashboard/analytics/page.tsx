import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = { title: "Analytics — TournaOps" };

export default async function AnalyticsPage() {
  const user = await requireServerUser();

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      createdAt: true,
      maxTeams: true,
      prizePool: true,
      registrations: {
        select: {
          status: true,
          team: { select: { name: true, playersList: { select: { id: true } } } },
        },
      },
      stages: {
        select: {
          groups: {
            select: {
              status: true,
              matchIds: true,
            },
          },
        },
      },
    },
  });

  const totalTournaments = await prisma.tournament.count({ where: { userId: user.id } });
  const totalApprovedTeams = await prisma.registration.count({
    where: { tournament: { userId: user.id }, status: "APPROVED" },
  });

  return (
    <AnalyticsClient
      tournaments={tournaments as never}
      totalTournaments={totalTournaments}
      totalApprovedTeams={totalApprovedTeams}
      totalMatchesPlayed={0}
    />
  );
}