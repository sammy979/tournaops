import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import HeroSection from "@/components/marketing/HeroSection";
import LiveTournamentsSection from "@/components/marketing/LiveTournamentsSection";
import { TournamentWorkflow } from "@/components/marketing/TournamentWorkflow";
import { ControlRoomSection } from "@/components/marketing/ControlRoomSection";
import { LiveStandingsSection } from "@/components/marketing/LiveStandingsSection";
import BroadcastSection from "@/components/marketing/BroadcastSection";
import DiscordSection from "@/components/marketing/DiscordSection";
import OpsAISection from "@/components/marketing/OpsAISection";
import OrganizerCTA from "@/components/marketing/OrganizerCTA";
import NepalPaymentSection from "@/components/marketing/NepalPaymentSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TournaOps — Run Tournaments. Not Chaos.",
  description: "The operating system for PUBG Mobile competition. Professional tournament operations from registration to trophy.",
};

async function getLiveMatch() {
  try {
    const m = await prisma.match.findFirst({
      where:   { status: "live" },
      include: {
        tournament: { select: { name: true } },
        results: {
          include: { team: { select: { id: true, name: true } } },
          orderBy: { placement: "asc" },
          take: 8,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    if (!m) return null;
    return {
      tournamentName: m.tournament?.name ?? "Tournament",
      matchNumber:    m.matchNumber ?? 1,
      totalMatches:   24,
      map:            (m as any).map ?? "ERANGEL",
      teamCount:      m.results?.length ?? 0,
      results: (m.results ?? []).map((r: any) => ({
        team:        { id: r.team?.id ?? "", name: r.team?.name ?? "—" },
        placement:   r.placement ?? null,
        kills:       r.kills ?? 0,
        totalPoints: r.totalPoints ?? 0,
      })),
    };
  } catch { return null; }
}

async function getLiveTournaments() {
  try {
    const rows = await prisma.tournament.findMany({
      where:   { isPublic: true, status: { in: ["live", "upcoming", "registration"] } },
      orderBy: [{ status: "asc" }, { startDate: "asc" }],
      take: 6,
      select: {
        id: true, name: true, slug: true, status: true,
        format: true, startDate: true, endDate: true,
        maxTeams: true, coverImage: true,
        _count: { select: { teams: true } },
      },
    });
    return rows.map((t: any) => ({
      id: t.id, name: t.name,
      status: (t.status as string).toUpperCase(),
      teamCount: t._count?.teams ?? 0,
      maxTeams: t.maxTeams,
      startDate: t.startDate?.toISOString?.() ?? null,
      format: t.format ?? "",
    }));
  } catch { return []; }
}

async function getTopStandings() {
  try {
    const tournament = await prisma.tournament.findFirst({
      where:   { isPublic: true, status: "live" },
      orderBy: { startDate: "desc" },
      select:  { id: true, name: true, slug: true },
    });
    if (!tournament) return { tournamentName: undefined, tournamentId: undefined, standings: undefined };

    const grouped = await prisma.matchResult.groupBy({
      by: ["teamId"],
      where: { match: { tournamentId: tournament.id } },
      _sum: { totalPoints: true, kills: true },
      _count: { matchId: true },
      orderBy: { _sum: { totalPoints: "desc" } },
      take: 8,
    });
    const teams = await prisma.team.findMany({
      where: { id: { in: grouped.map((s: any) => s.teamId) } },
      select: { id: true, name: true },
    });
    const teamMap = Object.fromEntries(teams.map((t: any) => [t.id, t.name]));

    return {
      tournamentName: tournament.name,
      tournamentId: tournament.id,
      standings: grouped.map((s: any, i: number) => ({
        pos: i + 1,
        team: teamMap[s.teamId] ?? "—",
        matches: s._count?.matchId ?? 0,
        kills: s._sum?.kills ?? 0,
        points: s._sum?.totalPoints ?? 0,
      })),
    };
  } catch {
    return { tournamentName: undefined, tournamentId: undefined, standings: undefined };
  }
}

async function getPaymentSettings() {
  try { return await prisma.paymentSettings.findFirst(); }
  catch { return null; }
}

export default async function HomePage() {
  const session = await getSession();

  const [liveMatchData, liveTournaments, standingsData, paymentSettings] = await Promise.all([
    getLiveMatch(),
    getLiveTournaments(),
    getTopStandings(),
    getPaymentSettings(),
  ]);

  return (
    <>
      <SiteHeader session={session} />
      <main>
        <HeroSection liveMatch={liveMatchData} />
        <LiveTournamentsSection tournaments={liveTournaments} />
        <TournamentWorkflow />
        <ControlRoomSection />
        <LiveStandingsSection
          standings={standingsData.standings}
          tournamentName={standingsData.tournamentName}
          tournamentId={standingsData.tournamentId}
        />
        <BroadcastSection />
        <DiscordSection />
        <OpsAISection />
        <NepalPaymentSection settings={paymentSettings} variant="landing" />
        <OrganizerCTA />
      </main>
      <SiteFooter />
    </>
  );
}