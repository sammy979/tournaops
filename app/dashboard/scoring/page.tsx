import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ScoringClient from "./ScoringClient";

export const metadata = { title: "Scoring — TournaOps" };

export default async function ScoringPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/login");

  const presets = await prisma.scoringPreset.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { isBuiltIn: true },
      ],
    },
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      description: true,
      isBuiltIn: true,
      userId: true,
      killPoints: true,
      placementPoints: true,
      createdAt: true,
    },
  });

  const tournaments = await prisma.tournament.findMany({
    where: { organizerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      game: true,
      scoringPresetId: true,
    },
  });

  return (
    <ScoringClient
      presets={presets}
      tournaments={tournaments}
      userId={session.user.id}
    />
  );
}