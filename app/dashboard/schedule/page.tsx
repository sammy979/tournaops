import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export const metadata = { title: "Schedule — TournaOps" };

export default async function SchedulePage() {
  const user = await requireServerUser();

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      startDate: true,
      endDate: true,
      matches: {
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          map: true,
          status: true,
          matchNumber: true,
          scheduledAt: true,
          startTime: true,
          endTime: true,
          stageId: true,
          groupId: true,
        },
      },
    },
  });

  const serialized = tournaments.map((t) => ({
    ...t,
    startDate: t.startDate ? t.startDate.toISOString() : null,
    endDate: t.endDate ? t.endDate.toISOString() : null,
    matches: t.matches.map((m) => ({
      ...m,
      scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
      startTime: m.startTime ? m.startTime.toISOString() : null,
      endTime: m.endTime ? m.endTime.toISOString() : null,
    })),
  }));

  return <ScheduleClient tournaments={serialized} />;
}