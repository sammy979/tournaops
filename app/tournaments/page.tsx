import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import TournamentDiscovery from "@/components/tournament/TournamentDiscovery";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tournaments — TournaOps",
  description: "Discover and join competitive PUBG Mobile tournaments.",
};

async function getTournaments(params: {
  status?: string;
  format?: string;
  search?: string;
}) {
  const where: any = { isPublic: true };

  if (params.status && params.status !== "ALL") {
    where.status = params.status.toLowerCase();
  }

  if (params.format && params.format !== "ALL") {
    where.format = params.format;
  }

  if (params.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      maxTeams: true,
      game: true,
      format: true,
      prizePool: true,
      coverImage: true,
      createdAt: true,
      createdBy: {
        select: { displayName: true, username: true },
      },
      _count: { select: { teams: true } },
    },
  });

  return tournaments.map((t: any) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    status: (t.status || "").toUpperCase(),
    startDate: null as string | null,
    endDate: null as string | null,
    maxTeams: t.maxTeams,
    teamCount: t._count.teams,
    game: t.game || "PUBG MOBILE",
    format: t.format || null,
    region: null as string | null,
    prizePool: t.prizePool || null,
    entryFee: null as string | null,
    coverImage: t.coverImage || null,
    organizer: t.createdBy
      ? { name: t.createdBy.displayName, username: t.createdBy.username }
      : null,
  }));
}

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: { status?: string; format?: string; region?: string; search?: string };
}) {
  const session = await getSession();
  const tournaments = await getTournaments({
    status: searchParams.status,
    format: searchParams.format,
    search: searchParams.search,
  });

  const counts = {
    all: tournaments.length,
    live: tournaments.filter((t) => t.status === "LIVE").length,
    upcoming: tournaments.filter((t) =>
      t.status === "UPCOMING" || t.status === "REGISTRATION" || t.status === "DRAFT"
    ).length,
    completed: tournaments.filter((t) => t.status === "COMPLETED").length,
  };

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "100vh", background: "var(--black)" }}>
        <TournamentDiscovery
          tournaments={tournaments}
          counts={counts}
          activeStatus={searchParams.status || "ALL"}
          activeFormat={searchParams.format || "ALL"}
          activeRegion={searchParams.region || "ALL"}
          search={searchParams.search || ""}
        />
      </main>
      <SiteFooter />
    </>
  );
}