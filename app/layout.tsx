import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { DialogProvider } from "@/lib/use-confirm";
import { GoogleAnalytics } from "@next/third-parties/google";
import CommandPalette from "@/components/CommandPalette";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tournaops.com"),
  title: {
    default: "TournaOps — Run Tournaments. Not Chaos.",
    template: "%s | TournaOps",
  },
  description: "The operating system for PUBG Mobile competition. Professional tournament operations from registration to trophy.",
  keywords: ["PUBG Mobile", "tournament", "esports", "PMGC", "PMPL", "organizer", "standings", "bracket", "tournaops"],
  authors: [{ name: "TournaOps" }],
  creator: "TournaOps",
  verification: {
    google: "aZlkt6TzykfZYpgnQRofrfr-DeuTRgEvFQiXMddnT6M",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tournaops.com",
    siteName: "TournaOps",
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description: "The operating system for PUBG Mobile competition.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TournaOps" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — Run Tournaments. Not Chaos.",
    description: "The operating system for PUBG Mobile competition.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
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
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-title" content="TournaOps" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <DialogProvider>
          <ToastProvider>
            {children}
            <CommandPalette />
          </ToastProvider>
        </DialogProvider>
        <GoogleAnalytics gaId="G-03N4EE8LBN" />
      </body>
    </html>
  );
}