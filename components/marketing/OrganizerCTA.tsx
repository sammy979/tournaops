import Link from "next/link";

export default function OrganizerCTA() {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: "3px solid var(--gold)",
          padding: "60px 48px",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "40px",
          alignItems: "center",
        }}>
          <div>
            <div className="section-label" style={{ marginBottom: "16px" }}>For Organizers</div>
            <h2 className="text-display" style={{ marginBottom: "12px" }}>
              Start Running<br />Professional Tournaments
            </h2>
            <p style={{
              color: "var(--white-70)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              maxWidth: "480px",
            }}>
              TournaOps gives you everything you need to run competitive PUBG Mobile tournaments
              at a professional level. Registration to champion — fully managed.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0 }}>
            <Link href="/auth/signup" className="btn-gold" style={{ whiteSpace: "nowrap" }}>
              Create Free Account
            </Link>
            <Link href="#pricing" className="btn-secondary" style={{ textAlign: "center" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}