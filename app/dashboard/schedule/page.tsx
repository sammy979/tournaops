import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ScheduleClient from "./ScheduleClient";

export const metadata = { title: "Schedule — TournaOps" };

export default async function SchedulePage() {
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
      startDate: true,
      endDate: true,
      stages: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          order: true,
          matches: {
            orderBy: { scheduledAt: "asc" },
            select: {
              id: true,
              round: true,
              matchNumber: true,
              scheduledAt: true,
              map: true,
              status: true,
              teamA: { select: { id: true, name: true } },
              teamB: { select: { id: true, name: true } },
              scoreA: true,
              scoreB: true,
            },
          },
        },
      },
    },
  });

  return <ScheduleClient tournaments={tournaments} userId={session.user.id} />;
}