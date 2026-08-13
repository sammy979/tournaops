import { requireServerUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";
import ScoringClient from "./ScoringClient";

export const metadata = { title: "Scoring — TournaOps" };

export default async function ScoringPage() {
  const user = await requireServerUser();

  const presets = await prisma.userScoringPreset.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      scoringRule: true,
      isDefault: true,
      createdAt: true,
      userId: true,
    },
  });

  const tournaments = await prisma.tournament.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, game: true },
  });

  const formattedPresets = presets.map((p) => ({
    ...p,
    isBuiltIn: false,
    killPoints: ((p.scoringRule as Record<string, unknown>)?.killPoints as number) || 1,
    placementPoints: ((p.scoringRule as Record<string, unknown>)?.placementPoints) || [],
  }));

  const formattedTournaments = tournaments.map((t) => ({
    ...t,
    scoringPresetId: null,
  }));

  return (
    <ScoringClient
      presets={formattedPresets as never}
      tournaments={formattedTournaments}
      userId={user.id}
    />
  );
}