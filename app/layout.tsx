import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TournaOps — Tournament Operations for Competitive PUBG Mobile",
    template: "%s | TournaOps",
  },
  description:
    "The complete tournament operations system for competitive PUBG Mobile. Registration, groups, matches, results, scoring, broadcast, and champion — all in one platform.",
  keywords: [
    "PUBG Mobile tournament",
    "esports tournament organizer",
    "tournament management",
    "PUBG Mobile organizer",
    "tournament operations",
    "esports platform",
    "tournament bracket",
    "PUBG Mobile competition",
  ],
  authors: [{ name: "TournaOps" }],
  creator: "TournaOps",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tournaops.com",
    siteName: "TournaOps",
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description:
      "The complete tournament operations system for competitive PUBG Mobile.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description:
      "The complete tournament operations system for competitive PUBG Mobile.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}