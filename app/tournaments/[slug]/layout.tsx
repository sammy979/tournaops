import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    // Use the PUBLIC api endpoint — not the organizer endpoint
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL || "https://www.tournaops.com"}/api/public/tournaments/${slug}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = await res.json();
      const t = data.tournament;
      if (t) {
        const teamCount = (t.teams || []).length;
        return {
          title: `${t.name} — TournaOps`,
          description:
            `${t.description || "PUBG Mobile Tournament"} — ${teamCount} squads — ${t.prizePool || "Free entry"} — Follow live standings`,
          openGraph: {
            title: `🏆 ${t.name}`,
            description: `${teamCount} squads competing — ${t.prizePool || "Free"} prize pool — Live standings on TournaOps`,
            type: "website",
            siteName: "TournaOps",
            images: t.bannerImage ? [{ url: t.bannerImage }] : [],
          },
          twitter: {
            card: "summary_large_image",
            title: `🏆 ${t.name}`,
            description: `Live PUBG Mobile tournament — ${teamCount} squads — Follow on TournaOps`,
          },
        };
      }
    }
  } catch {
    // Silently fall through to default
  }

  return {
    title: "Tournament — TournaOps",
    description: "PUBG Mobile Tournament on TournaOps",
  };
}

export default function TournamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}