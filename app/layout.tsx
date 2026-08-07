import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tournaops.com"),
  title: {
    default: "TournaOps - PUBG Mobile Tournament Platform",
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
    title: "TournaOps - PUBG Mobile Tournament Platform",
    description: "Free PUBG Mobile tournament management. Run qualifiers, track standings, broadcast live.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TournaOps" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps - PUBG Mobile Tournament Platform",
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
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-title" content="TournaOps" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-white antialiased font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}