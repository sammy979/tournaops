import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import RankingsPage from "@/components/rankings/RankingsPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rankings — TournaOps",
  description: "PUBG Mobile competitive team rankings on TournaOps.",
};

async function getRankingsData() {
  try {
    const progressions = await prisma.teamProgression.findMany({
      where: {
        tournament: { isPublic: true },
      },
      orderBy: { points: "desc" },
      take: 100,
      select: {
        id: true,
        teamId: true,
        teamName: true,
        points: true,
        kills: true,
        wwcds: true,
        matchesPlayed: true,
        finalPosition: true,
        tournament: {
          select: {
            id: true,
            slug: true,
            name: true,
            status: true,
            format: true,
          },
        },
      },
    });

    return progressions.map((p: any, i: number) => ({
      rank: i + 1,
      id: p.id,
      name: p.teamName,
      points: p.points ?? 0,
      kills: p.kills ?? 0,
      placement: p.finalPosition ?? null,
      tournamentName: p.tournament?.name ?? null,
      tournamentId: p.tournament?.id ?? null,
      tournamentStatus: (p.tournament?.status || "").toUpperCase(),
      format: p.tournament?.format ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function Rankings() {
  const session = await getSession();
  const teams = await getRankingsData();

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "100vh", background: "var(--black)" }}>
        <RankingsPage teams={teams} />
      </main>
      <SiteFooter />
    </>
  );
}