import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RegistrationsClient from "./RegistrationsClient";

export const metadata = { title: "Registrations — TournaOps" };

export default async function RegistrationsPage() {
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
              captain: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              members: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <RegistrationsClient
      tournaments={tournaments}
      userId={session.user.id}
    />
  );
}