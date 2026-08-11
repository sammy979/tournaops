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
  region?: string;
  search?: string;
}) {
  const where: any = {
    isPublic: true,
  };

  if (params.status && params.status !== "ALL") {
    if (params.status === "REGISTRATION") {
      where.status = { in: ["REGISTRATION", "UPCOMING"] };
    } else {
      where.status = params.status;
    }
  }

  if (params.format && params.format !== "ALL") {
    where.format = params.format;
  }

  if (params.region && params.region !== "ALL") {
    where.region = params.region;
  }

  if (params.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }

  const tournaments = await prisma.tournament.findMany({
    where,
    orderBy: [
      { status: "asc" },
      { startDate: "desc" },
      { createdAt: "desc" },
    ],
    take: 50,
    select: {
      id: true,
      name: true,
      status: true,
      startDate: true,
      endDate: true,
      maxTeams: true,
      game: true,
      format: true,
      region: true,
      prizePool: true,
      entryFee: true,
      coverImage: true,
      organizer: {
        select: { name: true, username: true },
      },
      _count: { select: { teams: true } },
    },
  });

  return tournaments.map((t: any) => ({
    id: t.id,
    name: t.name,
    status: t.status,
    startDate: t.startDate?.toISOString() ?? null,
    endDate: t.endDate?.toISOString() ?? null,
    maxTeams: t.maxTeams,
    teamCount: t._count.teams,
    game: t.game ?? "PUBG MOBILE",
    format: t.format ?? null,
    region: t.region ?? null,
    prizePool: t.prizePool ?? null,
    entryFee: t.entryFee ?? null,
    coverImage: t.coverImage ?? null,
    organizer: t.organizer ?? null,
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
    region: searchParams.region,
    search: searchParams.search,
  });

  const counts = {
    all: tournaments.length,
    live: tournaments.filter((t) => t.status === "LIVE").length,
    upcoming: tournaments.filter((t) =>
      t.status === "UPCOMING" || t.status === "REGISTRATION"
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