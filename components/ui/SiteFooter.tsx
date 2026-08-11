import Link from "next/link";
import Image from "next/image";

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
              <Image src="/logo.png" alt="TournaOps" width={28} height={28} style={{ objectFit: "contain" }} />
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "1.05rem",
                letterSpacing: "0.08em",
                color: "var(--white)",
                textTransform: "uppercase",
              }}>TournaOps</span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--white-40)", lineHeight: 1.6, maxWidth: "220px" }}>
              Tournament operations for competitive PUBG Mobile. From registration to trophy.
            </p>
          </div>

          {/* PLATFORM */}
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}>Platform</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/tournaments" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Tournaments</Link>
              <Link href="/tournaments?status=LIVE" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Live</Link>
              <Link href="/tournaments?status=COMPLETED" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Results</Link>
              <Link href="/rankings" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Rankings</Link>
              <Link href="/pricing" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Pricing</Link>
            </div>
          </div>

          {/* ORGANIZERS */}
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}>Organizers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/dashboard" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Dashboard</Link>
              <Link href="/create" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Create Tournament</Link>
              <Link href="/dashboard/upgrade" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Go Pro</Link>
              <Link href="/login" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Log In</Link>
            </div>
          </div>

          {/* LEGAL */}
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.14em",
              color: "var(--gold)",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}>Legal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/terms" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Terms</Link>
              <Link href="/privacy" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Privacy</Link>
              <Link href="/contact" style={{ color: "var(--white-70)", fontSize: "0.85rem", textDecoration: "none" }}>Contact</Link>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ color: "var(--white-40)", fontSize: "0.8rem" }}>© 2025 TournaOps. All rights reserved.</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--white-40)", fontSize: "0.75rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)" }} />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}