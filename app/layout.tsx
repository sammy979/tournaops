import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TournaOps — PUBG Mobile Tournament Management Platform",
  description: "Run professional PUBG Mobile tournaments in minutes. Live leaderboards, OBS overlays, PMGC scoring, squad management, and social media card generation. Free to start.",
  keywords: "PUBG Mobile tournament, BGMI tournament, esports tournament management, PMGC scoring, tournament leaderboard, OBS overlay, tournament organizer tool",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TournaOps",
  },
  openGraph: {
    title: "TournaOps — PUBG Mobile Tournament Platform",
    description: "Stop managing chaos. Start running tournaments. Live leaderboards, OBS overlays, and PMGC scoring — all in one place.",
    type: "website",
    siteName: "TournaOps",
    url: "https://www.tournaops.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — PUBG Mobile Tournament Platform",
    description: "Professional tournament management for PUBG Mobile organizers. Free to start.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}