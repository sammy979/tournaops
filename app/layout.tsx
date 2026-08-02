import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TournaOps - Organize. Compete. Elevate.",
  description: "Run every tournament from one command center. Live leaderboards, OBS overlays, Discord integration, and AI automation for esports tournaments.",
  keywords: "tournament operations, esports tournament, bracket generator, OBS overlay, live leaderboard, tournament management",
  openGraph: {
    title: "TournaOps - Tournament Command Center",
    description: "Enter data once. Everything updates automatically.",
    type: "website",
    siteName: "TournaOps"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="bg-mesh" />
        <div className="grid-bg" />
        {children}
      </body>
    </html>
  );
}