import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "https://www.tournaops.com"}/api/tournaments/${slug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const t = data.tournament;
      if (t) {
        const leader = "Live on TournaOps";
        return {
          title: `${t.name} · TournaOps`,
          description: `${t.description || "PUBG Mobile Tournament"} · ${(t.teams || []).length} squads · ${t.prizePool || "Free entry"} · Follow live standings`,
          openGraph: {
            title: `🏆 ${t.name}`,
            description: `${(t.teams || []).length} squads competing · ${t.prizePool || "Free"} prize pool · Live standings on TournaOps`,
            type: "website",
            siteName: "TournaOps",
          },
          twitter: {
            card: "summary_large_image",
            title: `🏆 ${t.name}`,
            description: `Live PUBG Mobile tournament · ${(t.teams || []).length} squads · Follow on TournaOps`,
          },
        };
      }
    }
  } catch {}

  return {
    title: "Tournament · TournaOps",
    description: "PUBG Mobile Tournament on TournaOps",
  };
}

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}