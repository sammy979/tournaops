import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import TournamentPublicPage from "@/components/tournament/TournamentPublicPage";

export const dynamic = "force-dynamic";

async function getTournament(id: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: {
        select: { name: true, username: true, image: true },
      },
      teams: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          logo: true,
          points: true,
          kills: true,
          placement: true,
        },
      },
      matches: {
        orderBy: { matchNumber: "asc" },
        select: {
          id: true,
          matchNumber: true,
          map: true,
          status: true,
          scheduledAt: true,
          completedAt: true,
        },
      },
      _count: {
        select: { teams: true, matches: true },
      },
    },
  });

  return tournament;
}

export default async function TournamentPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  const tournament = await getTournament(params.id);

  if (!tournament) notFound();
  if (!tournament.isPublic) notFound();

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "100vh", background: "var(--black)" }}>
        <TournamentPublicPage tournament={tournament as any} session={session} />
      </main>
      <SiteFooter />
    </>
  );
}