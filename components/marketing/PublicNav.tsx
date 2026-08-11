"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function PublicNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/tournaments", label: "Tournaments" },
    { href: "/rankings",    label: "Rankings"    },
    { href: "/players",     label: "Players"     },
    { href: "/contact",     label: "Contact"     },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "56px",
      background: "var(--charcoal-deep)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "18px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--white)",
          }}>
            Tourna<span style={{ color: "var(--accent)" }}>Ops</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="desktop-nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: pathname === l.href ? "var(--white)" : "var(--muted-light)",
                borderBottom: pathname === l.href ? "2px solid var(--accent)" : "2px solid transparent",
                transition: "color 0.15s",
              }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/dashboard"
            style={{
              marginLeft: "12px",
              padding: "7px 18px",
              background: "var(--accent)",
              color: "var(--white)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: "2px",
            }}
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--white)",
            fontSize: "20px",
            padding: "4px",
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: "absolute", top: "56px", left: 0, right: 0,
          background: "var(--charcoal-deep)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 0",
          display: "flex", flexDirection: "column",
        }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                textDecoration: "none",
                color: pathname === l.href ? "var(--white)" : "var(--muted-light)",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            style={{
              margin: "8px 24px 4px",
              padding: "10px 18px",
              background: "var(--accent)",
              color: "var(--white)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              textAlign: "center",
              borderRadius: "2px",
            }}
          >
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}