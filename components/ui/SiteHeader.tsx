"use client";
import Link from "next/link";
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
        height: "56px",
      }}>
        {/* LOGO */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "var(--gold)",
            width: "28px",
            height: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "0.9rem",
              color: "var(--black)",
              letterSpacing: "-0.02em",
            }}>TO</span>
          </div>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "0.08em",
            color: "var(--white)",
            textTransform: "uppercase",
          }}>TournaOps</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link href="/tournaments" className="nav-link">Tournaments</Link>
          <Link href="/tournaments?status=LIVE" className="nav-link" style={{ color: "var(--red)" }}>
            <span className="live-dot" style={{ marginRight: "6px" }}></span>Live
          </Link>
          <Link href="/tournaments?status=COMPLETED" className="nav-link">Results</Link>
          <Link href="/rankings" className="nav-link">Rankings</Link>
          <Link href="#organizers" className="nav-link">Organizers</Link>
          <Link href="#pricing" className="nav-link">Pricing</Link>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {session ? (
            <>
              <Link href="/dashboard" className="nav-link">Dashboard</Link>
              <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 18px" }}>
                Command Center
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="btn-secondary" style={{ padding: "8px 18px" }}>
                Log In
              </Link>
              <Link href="/auth/signup" className="btn-primary" style={{ padding: "8px 18px" }}>
                Create Tournament
              </Link>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="show-mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            color: "var(--white)",
            padding: "8px 12px",
            cursor: "pointer",
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          {menuOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{
          background: "var(--charcoal)",
          borderTop: "1px solid var(--border)",
          padding: "20px 24px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link href="/tournaments" className="nav-link" onClick={() => setMenuOpen(false)}>Tournaments</Link>
            <Link href="/tournaments?status=LIVE" className="nav-link" style={{ color: "var(--red)" }} onClick={() => setMenuOpen(false)}>Live</Link>
            <Link href="/tournaments?status=COMPLETED" className="nav-link" onClick={() => setMenuOpen(false)}>Results</Link>
            <Link href="/rankings" className="nav-link" onClick={() => setMenuOpen(false)}>Rankings</Link>
            <Link href="#pricing" className="nav-link" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <hr className="divider" />
            {session ? (
              <Link href="/dashboard" className="btn-primary" style={{ textAlign: "center" }} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary" style={{ textAlign: "center" }} onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link href="/auth/signup" className="btn-primary" style={{ textAlign: "center" }} onClick={() => setMenuOpen(false)}>
                  Create Tournament
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}