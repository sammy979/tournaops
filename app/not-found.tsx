import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--black)" }}>
      <SiteHeader />
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}>
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "8rem",
            lineHeight: 1,
            color: "var(--border)",
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}>404</div>

          <div style={{
            width: "40px",
            height: "3px",
            background: "var(--gold)",
            margin: "0 auto 24px",
          }} />

          <h2 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "1.8rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--white)",
            marginBottom: "12px",
          }}>Page Not Found</h2>

          <p style={{
            color: "var(--white-40)",
            fontSize: "0.875rem",
            marginBottom: "32px",
            lineHeight: 1.6,
          }}>
            The page you are looking for does not exist or has been moved.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn-gold">
              Home
            </Link>
            <Link href="/tournaments" className="btn-secondary">
              Tournaments
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}