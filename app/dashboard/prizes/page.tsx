import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import PrizesClient from "./PrizesClient";

export const metadata = { title: "Prizes — TournaOps" };

export default async function PrizesPage() {
  const user = await requireServerUser();

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      status: true,
      prizePool: true,
      prizes: {
        orderBy: { position: "asc" },
        select: { id: true, position: true, amount: true, currency: true, description: true, type: true },
      },
    },
  });

  return <PrizesClient tournaments={tournaments} />;
}