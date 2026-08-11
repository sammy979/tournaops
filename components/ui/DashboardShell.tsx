import Link from "next/link";
import Image from "next/image";

interface Props {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
}: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      {/* TOP LOGO BAR */}
      <div style={{ background: "var(--black)", borderBottom: "1px solid var(--border)" }}>
        <div className="container-ops" style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
        }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <Image src="/logo.png" alt="TournaOps" width={28} height={28} priority style={{ objectFit: "contain" }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "1rem",
              letterSpacing: "0.08em",
              color: "var(--white)",
              textTransform: "uppercase",
            }}>TournaOps</span>
            <span style={{
              padding: "2px 8px",
              background: "var(--gold-dim)",
              color: "var(--gold)",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.65rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginLeft: "6px",
            }}>Dashboard</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { href: "/dashboard", label: "Home" },
              { href: "/dashboard/upgrade", label: "Upgrade" },
              { href: "/", label: "Site" },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 12px",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--white-70)",
                textDecoration: "none",
              }}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* TITLE HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px 24px" }}>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              flexWrap: "wrap",
            }}>
              <Link href="/dashboard" style={{ color: "var(--white-40)", textDecoration: "none" }}>Dashboard</Link>
              {breadcrumbs.map((b, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "var(--white-20)" }}>→</span>
                  {b.href ? (
                    <Link href={b.href} style={{ color: "var(--white-40)", textDecoration: "none" }}>{b.label}</Link>
                  ) : (
                    <span style={{ color: "var(--gold)" }}>{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}

          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <div>
              {subtitle && (
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  letterSpacing: "0.14em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}>{subtitle}</div>
              )}
              <h1 style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.8rem",
                color: "var(--white)",
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}>{title}</h1>
            </div>
            {actions}
          </div>
        </div>
      </div>

      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {children}
      </div>
    </div>
  );
}