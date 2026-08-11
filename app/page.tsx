import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import HeroSection from "@/components/marketing/HeroSection";
import LiveTournamentsSection from "@/components/marketing/LiveTournamentsSection";
import WorkflowSection from "@/components/marketing/WorkflowSection";
import BroadcastSection from "@/components/marketing/BroadcastSection";
import DiscordSection from "@/components/marketing/DiscordSection";
import OrganizerCTA from "@/components/marketing/OrganizerCTA";
import StandingsPreview from "@/components/marketing/StandingsPreview";

export const dynamic = "force-dynamic";

async function getHomeData() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: {
        isPublic: true,
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        maxTeams: true,
        game: true,
        format: true,
        organizer: {
          select: { name: true, username: true },
        },
        _count: { select: { teams: true } },
      },
    });

    const mapped = tournaments.map((t: any) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      startDate: t.startDate?.toISOString() ?? null,
      maxTeams: t.maxTeams,
      teamCount: t._count.teams,
      game: t.game ?? "PUBG MOBILE",
      format: t.format ?? null,
      organizer: t.organizer ?? null,
    }));

    return { tournaments: mapped };
  } catch {
    return { tournaments: [] };
  }
}

export default async function HomePage() {
  const session = await getSession();
  const { tournaments } = await getHomeData();

  return (
    <>
      <SiteHeader session={session} />
      <main>
        <HeroSection liveMatch={null} />
        <LiveTournamentsSection tournaments={tournaments} />
        <WorkflowSection />
        <BroadcastSection />
        <DiscordSection />
        <OrganizerCTA />
      </main>
      <SiteFooter />
    </>
  );
}