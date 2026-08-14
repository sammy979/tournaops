import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tournaops.com"),
  title: {
    default: "TournaOps — PUBG Mobile Tournament Manager Nepal",
    template: "%s | TournaOps",
  },
  description: "Nepal's #1 PUBG Mobile tournament management platform. Create brackets, manage teams, run overlays, accept Khalti & eSewa payments. Built for Nepali esports organizers.",
  keywords: [
    "PUBG Mobile tournament Nepal",
    "esports tournament manager Nepal",
    "PUBG tournament bracket",
    "Khalti esports payment",
    "eSewa tournament",
    "Nepal gaming tournament",
    "PUBG Mobile Nepal",
    "tournament organizer Nepal",
    "TournaOps",
    "PUBG tournament software",
  ],
  authors: [{ name: "TournaOps", url: "https://www.tournaops.com" }],
  creator: "TournaOps",
  publisher: "TournaOps",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tournaops.com",
    siteName: "TournaOps",
    title: "TournaOps — PUBG Mobile Tournament Manager Nepal",
    description: "Nepal's #1 PUBG Mobile tournament management platform. Khalti & eSewa payments. Real-time overlays. Team management.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TournaOps — Nepal PUBG Mobile Tournament Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TournaOps — PUBG Mobile Tournament Manager Nepal",
    description: "Nepal's #1 PUBG Mobile tournament management platform.",
    images: ["/og-image.png"],
    creator: "@tournaops",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://www.tournaops.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#D4AF37",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${jetbrainsMono.variable}`}>
      <body style={{ margin: 0, padding: 0, background: "#0a0a0a", color: "#ffffff", fontFamily: "var(--font-barlow), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}