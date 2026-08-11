import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import TournamentPublicPage from "@/components/tournament/TournamentPublicPage";

export const dynamic = "force-dynamic";

async function getTournament(id: string) {
  const tournament = await prisma.tournament.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    include: {
      createdBy: {
        select: { displayName: true, username: true, avatar: true },
      },
      teams: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          logo: true,
          seed: true,
        },
      },
      matches: {
        orderBy: { matchNumber: "asc" },
        select: {
          id: true,
          name: true,
          matchNumber: true,
          map: true,
          status: true,
          startTime: true,
          endTime: true,
        },
      },
      progressions: {
        select: {
          teamId: true,
          teamName: true,
          points: true,
          kills: true,
          matchesPlayed: true,
          wwcds: true,
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

  // Merge progression stats into teams
  const progressionMap = new Map(
    tournament.progressions.map((p: any) => [p.teamId, p])
  );

  const teamsWithStats = tournament.teams.map((team: any) => {
    const prog: any = progressionMap.get(team.id);
    return {
      id: team.id,
      name: team.name,
      logo: team.logo,
      points: prog?.points ?? 0,
      kills: prog?.kills ?? 0,
      placement: null,
      matchesPlayed: prog?.matchesPlayed ?? 0,
    };
  });

  const tournamentData = {
    id: tournament.id,
    name: tournament.name,
    status: (tournament.status || "").toUpperCase(),
    game: tournament.game,
    format: tournament.format,
    region: null,
    startDate: null,
    endDate: null,
    maxTeams: tournament.maxTeams,
    description: tournament.description,
    rules: tournament.rules,
    prizePool: tournament.prizePool,
    entryFee: null,
    scoringPreset: null,
    organizer: tournament.createdBy
      ? {
          name: tournament.createdBy.displayName,
          username: tournament.createdBy.username,
          image: tournament.createdBy.avatar,
        }
      : null,
    teams: teamsWithStats,
    matches: tournament.matches.map((m: any) => ({
      id: m.id,
      matchNumber: m.matchNumber ?? 0,
      map: m.map,
      status: (m.status || "").toUpperCase(),
      scheduledAt: m.startTime?.toISOString() ?? null,
      completedAt: m.endTime?.toISOString() ?? null,
    })),
    _count: tournament._count,
  };

  return (
    <>
      <SiteHeader session={session} />
      <main style={{ minHeight: "100vh", background: "var(--black)" }}>
        <TournamentPublicPage tournament={tournamentData as any} session={session} />
      </main>
      <SiteFooter />
    </>
  );
}