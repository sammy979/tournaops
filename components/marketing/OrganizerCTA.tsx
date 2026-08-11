import Link from "next/link";

export default function OrganizerCTA() {
  return (
    <section
      style={{
        borderTop: "1px solid var(--border)",
        padding: "96px 0",
        background: "var(--black-rich)",
      }}
    >
      <div className="container">
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <p className="label-section" style={{ marginBottom: "16px" }}>
            Start Organizing
          </p>

          <h2
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 0.95,
              textTransform: "uppercase",
              color: "var(--white)",
              marginBottom: "20px",
            }}
          >
            Ready To Run A Professional Tournament?
          </h2>

          <p
            style={{
              color: "var(--muted-light)",
              fontSize: "15px",
              lineHeight: 1.7,
              marginBottom: "36px",
            }}
          >
            Join organizers running competitive PUBG Mobile tournaments on TournaOps.
            Registration to champion — completely handled.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/auth/register" className="btn-primary" style={{ fontSize: "15px", padding: "14px 36px" }}>
              Create Tournament
            </Link>
            <Link href="/tournaments" className="btn-secondary" style={{ fontSize: "15px", padding: "14px 36px" }}>
              Explore Tournaments
            </Link>
          </div>

          <p
            style={{
              marginTop: "24px",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "10px",
              color: "var(--muted)",
              letterSpacing: "0.12em",
            }}
          >
            NO SETUP FEE · FIRST TOURNAMENT FREE
          </p>
        </div>
      </div>
    </section>
  );
}