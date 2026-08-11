import Link from "next/link";

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
      {/* HEADER */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
      }}>
        <div className="container-ops" style={{ padding: "24px 24px" }}>
          {/* BREADCRUMB */}
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
              {subtitle && <div className="section-label">{subtitle}</div>}
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

      {/* CONTENT */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        {children}
      </div>
    </div>
  );
}