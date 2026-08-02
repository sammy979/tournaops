import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TournaOps - PUBG Mobile Tournament Platform",
  description: "Run every PUBG Mobile tournament from one command center. Live leaderboards, OBS overlays, match results, and standings.",
  keywords: "PUBG Mobile tournament, esports tournament, bracket generator, OBS overlay, live leaderboard, tournament management",
  openGraph: {
    title: "TournaOps - Tournament Command Center",
    description: "Run every PUBG Mobile tournament from one command center.",
    type: "website",
    siteName: "TournaOps"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}