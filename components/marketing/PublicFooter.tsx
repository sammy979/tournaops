import Link from "next/link";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  const cols = [
    {
      heading: "Platform",
      links: [
        { href: "/tournaments", label: "Tournaments" },
        { href: "/rankings",    label: "Rankings"    },
        { href: "/players",     label: "Players"     },
      ],
    },
    {
      heading: "Organizers",
      links: [
        { href: "/dashboard",        label: "Dashboard"   },
        { href: "/create",           label: "Create Tournament" },
        { href: "/dashboard/scoring",label: "Scoring"     },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/contact", label: "Contact"       },
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms",   label: "Terms of Use"  },
      ],
    },
  ];

  return (
    <footer style={{
      background: "var(--charcoal-deep)",
      borderTop: "1px solid var(--border)",
      padding: "48px 0 24px",
    }}>
      <div className="container">

        {/* Top Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr repeat(3, auto)",
          gap: "40px",
          marginBottom: "40px",
        }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "22px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--white)",
              }}>
                Tourna<span style={{ color: "var(--accent)" }}>Ops</span>
              </span>
            </Link>
            <p style={{
              marginTop: "10px",
              fontSize: "13px",
              color: "var(--muted-light)",
              maxWidth: "220px",
              lineHeight: 1.6,
            }}>
              Professional esports tournament management platform.
            </p>
          </div>

          {/* Link Columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted-light)",
                marginBottom: "14px",
              }}>
                {col.heading}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      textDecoration: "none",
                    }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ fontSize: "12px", color: "var(--muted-light)" }}>
            © {year} TournaOps. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "var(--muted-light)" }}>
            Built for competitive gaming.
          </p>
        </div>

      </div>
    </footer>
  );
}