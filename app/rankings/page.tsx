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
    const teams = await prisma.team.findMany({
      where: {
        tournament: {
          isPublic: true,
          status: { in: ["COMPLETED", "LIVE"] },
        },
      },
      select: {
        id: true,
        name: true,
        points: true,
        kills: true,
        placement: true,
        tournament: {
          select: {
            id: true,
            name: true,
            status: true,
            format: true,
          },
        },
      },
      orderBy: { points: "desc" },
      take: 100,
    });

    return teams.map((t: any, i: number) => ({
      rank: i + 1,
      id: t.id,
      name: t.name,
      points: t.points ?? 0,
      kills: t.kills ?? 0,
      placement: t.placement ?? null,
      tournamentName: t.tournament?.name ?? null,
      tournamentId: t.tournament?.id ?? null,
      tournamentStatus: t.tournament?.status ?? null,
      format: t.tournament?.format ?? null,
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