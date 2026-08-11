import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TournaOps — Professional PUBG Mobile Tournament Operations",
  description: "The complete tournament operations system for competitive PUBG Mobile. Registration, groups, matches, results, scoring, broadcast, and champion.",
  keywords: "PUBG Mobile tournament, esports tournament platform, tournament management, PUBG tournament organizer",
  openGraph: {
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description: "The operating system for PUBG Mobile competition.",
    url: "https://www.tournaops.com",
    siteName: "TournaOps",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description: "The operating system for PUBG Mobile competition.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}