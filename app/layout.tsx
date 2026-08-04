import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tournaops.com"),
  title: {
    default: "TournaOps — PUBG Mobile Tournament Platform",
    template: "%s | TournaOps",
  },
  description: "Free PUBG Mobile tournament management platform. Run qualifiers, track standings, generate results, and broadcast live with OBS overlays.",
  keywords: ["PUBG Mobile", "tournament", "esports", "PMGC", "PMPL", "organizer", "standings", "bracket"],
  authors: [{ name: "TournaOps" }],
  creator: "TournaOps",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tournaops.com",
    siteName: "TournaOps",
    title: "TournaOps — PUBG Mobile Tournament Platform",
    description: "Free PUBG Mobile tournament management. Run qualifiers, track standings, broadcast live.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TournaOps" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — PUBG Mobile Tournament Platform",
    description: "Free PUBG Mobile tournament management platform.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
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
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}