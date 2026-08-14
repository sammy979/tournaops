"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useState, useEffect } from "react";

interface SiteHeaderProps {
  user?: {
    username?: string;
    role?: string;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className="nav-ops"
        style={{
          borderBottomColor: scrolled
            ? "var(--color-border)"
            : "var(--color-border-subtle)",
        }}
      >
        <div
          className="container-ops"
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            gap: "32px",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: "1rem",
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                textTransform: "uppercase",
              }}
            >
              TOURNA
              <span style={{ color: "var(--color-gold)" }}>OPS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hide-mobile"
            style={{ display: "flex", alignItems: "center", gap: "24px", flex: 1 }}
          >
            <Link href="/tournaments" className="nav-link">Tournaments</Link>
            <Link href="/tournaments?status=LIVE" className="nav-link">
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--color-live)",
                    display: "inline-block",
                    animation: "live-pulse 1.5s ease-in-out infinite",
                  }}
                />
                Live
              </span>
            </Link>
            <Link href="/tournaments?tab=results" className="nav-link">Results</Link>
            <Link href="/rankings" className="nav-link">Rankings</Link>
            <Link href="/organizers" className="nav-link">Organizers</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
          </nav>

          {/* Right Actions */}
          <div
            className="hide-mobile"
            style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}
          >
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn btn-ghost btn-sm"
                >
                  Dashboard
                </Link>
                {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
                  <Link href="/admin" className="btn btn-ghost btn-sm">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">
                  Log In
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm">
                  Create Tournament
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="show-mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              color: "var(--color-text-primary)",
            }}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {menuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="show-mobile-only"
          style={{
            position: "fixed",
            top: "56px",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--color-surface-0)",
            borderTop: "1px solid var(--color-border)",
            zIndex: 99,
            overflowY: "auto",
          }}
        >
          <nav style={{ padding: "16px" }}>
            {[
              { href: "/tournaments", label: "Tournaments" },
              { href: "/tournaments?status=LIVE", label: "Live" },
              { href: "/tournaments?tab=results", label: "Results" },
              { href: "/rankings", label: "Rankings" },
              { href: "/organizers", label: "Organizers" },
              { href: "/pricing", label: "Pricing" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}

            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary btn-lg"
                  style={{ textAlign: "center" }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-secondary btn-lg"
                    style={{ textAlign: "center" }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMenuOpen(false)}
                    className="btn btn-primary btn-lg"
                    style={{ textAlign: "center" }}
                  >
                    Create Tournament
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}