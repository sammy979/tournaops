"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function SiteHeader({ session }: { session?: any }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(10,10,10,0.95)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(8px)",
    }}>
      <div className="container-ops" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
      }}>
        {/* LOGO */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <Image src="/logo.png" alt="TournaOps" width={32} height={32} priority style={{ objectFit: "contain" }} />
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "1.15rem",
            letterSpacing: "0.06em",
            color: "var(--white)",
            textTransform: "uppercase",
          }}>TournaOps</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav style={{ display: "flex", alignItems: "center", gap: "4px" }} className="hidden-mobile">
          {[
            { href: "/tournaments", label: "Tournaments" },
            { href: "/tournaments?status=LIVE", label: "Live" },
            { href: "/tournaments?status=COMPLETED", label: "Results" },
            { href: "/rankings", label: "Rankings" },
            { href: "/#discord", label: "Discord" },
            { href: "/pricing", label: "Pricing" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              style={{
                padding: "8px 14px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--white-70)",
                textDecoration: "none",
              }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {session ? (
            <Link href="/dashboard" style={{
              padding: "8px 18px",
              background: "var(--gold)",
              color: "var(--black)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{
                padding: "8px 14px",
                color: "var(--white-70)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}>
                Log In
              </Link>
              <Link href="/register" style={{
                padding: "8px 18px",
                background: "var(--gold)",
                color: "var(--black)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
              }}>
                Create Tournament
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}