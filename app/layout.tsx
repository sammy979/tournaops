import type { Metadata } from "next";
import "./globals.css";
import { CustomCursor, Particles } from "@/components/Effects";

export const metadata: Metadata = {
  title: "Tournaops - Free Tournament Operations Platform",
  description: "Enterprise-grade tournament management for esports. Single/Double elimination, Round Robin, Swiss. No signup required.",
  keywords: "tournament ops, bracket generator, esports, tournament management, round robin, swiss"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Particles />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}