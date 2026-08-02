import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TournaOps - PUBG Mobile Tournament Platform",
  description: "Run every PUBG Mobile tournament from one command center. Live leaderboards, OBS overlays, match results, and standings.",
  keywords: "PUBG Mobile tournament, esports tournament, OBS overlay, live leaderboard, tournament management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TournaOps",
  },
  openGraph: {
    title: "TournaOps - Tournament Command Center",
    description: "Run every PUBG Mobile tournament from one command center.",
    type: "website",
    siteName: "TournaOps",
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