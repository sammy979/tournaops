import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/ui/DashboardShell";
import OverlaysClient from "./OverlaysClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "OBS Overlays — TournaOps" };

interface Props {
  params: { id: string };
}

export default async function TournamentOverlaysPage({ params }: Props) {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const tournament = await prisma.tournament.findFirst({
    where: {
      id: params.id,
      OR: [
        { userId: session.userId },
        ...(session.isAdmin ? [{}] : []),
      ],
    },
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      overlayToken: true,
    },
  });

  if (!tournament) notFound();

  return (
    <DashboardShell
      title={tournament.name}
      subtitle="OBS Overlays"
      breadcrumbs={[
        { label: "Tournaments", href: "/dashboard/tournaments" },
        { label: tournament.name, href: `/dashboard/tournaments/${tournament.id}/overview` },
        { label: "Overlays" },
      ]}
    >
      <OverlaysClient
        tournamentId={tournament.id}
        tournamentName={tournament.name}
        overlayToken={tournament.overlayToken}
      />
    </DashboardShell>
  );
}