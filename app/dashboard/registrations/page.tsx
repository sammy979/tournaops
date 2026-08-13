import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import RegistrationsClient from "./RegistrationsClient";

export const metadata = { title: "Registrations — TournaOps" };

export default async function RegistrationsPage() {
  const user = await requireServerUser();

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      maxTeams: true,
      registrations: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          team: {
            select: {
              id: true,
              name: true,
              tag: true,
              playersList: { select: { id: true } },
            },
          },
          user: { select: { id: true, displayName: true, email: true } },
        },
      },
    },
  });

  return <RegistrationsClient tournaments={tournaments} userId={user.id} />;
}