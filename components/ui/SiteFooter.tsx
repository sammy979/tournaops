import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer style={{
      background: "var(--charcoal)",
      borderTop: "1px solid var(--border)",
      marginTop: "80px",
    }}>
      <div className="container-ops" style={{ padding: "48px 24px 32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}>
          {/* BRAND */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                background: "var(--gold)",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 900,
                  fontSize: "0.75rem",
                  color: "var(--black)",
                }}>TO</span>
              </div>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "1rem",
                letterSpacing: "0.08em",
                color: "var(--white)",
                textTransform: "uppercase",
              }}>TournaOps</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--white-40)", lineHeight: 1.6, maxWidth: "200px" }}>
              Tournament operations for competitive PUBG Mobile.
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <div className="text-label" style={{ marginBottom: "14px" }}>Platform</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/tournaments" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Tournaments</Link>
              <Link href="/tournaments?status=LIVE" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Live</Link>
              <Link href="/tournaments?status=COMPLETED" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Results</Link>
              <Link href="/rankings" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Rankings</Link>
            </div>
          </div>

          {/* ORGANIZERS */}
          <div>
            <div className="text-label" style={{ marginBottom: "14px" }}>Organizers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/auth/signup" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Create Account</Link>
              <Link href="/dashboard" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Dashboard</Link>
              <Link href="#pricing" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Pricing</Link>
            </div>
          </div>

          {/* LEGAL */}
          <div>
            <div className="text-label" style={{ marginBottom: "14px" }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/terms" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Terms</Link>
              <Link href="/privacy" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Privacy</Link>
            </div>
          </div>
        </div>

        <hr className="divider" style={{ marginBottom: "20px" }} />

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <span style={{ fontSize: "0.75rem", color: "var(--white-40)" }}>
            © {new Date().getFullYear()} TournaOps. All rights reserved.
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--white-40)" }}>
            Built for PUBG Mobile competition.
          </span>
        </div>
      </div>
    </footer>
  );
}