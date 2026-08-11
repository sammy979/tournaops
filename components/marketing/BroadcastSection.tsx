import Link from "next/link";

const overlays = [
  { name: "Live Standings", desc: "Real-time team standings for your stream." },
  { name: "Chicken Dinner", desc: "Dramatic winner announcement overlay." },
  { name: "Top Fragger", desc: "Highlight the most kills in the match." },
  { name: "Final Results", desc: "Clean end-of-match results board." },
  { name: "Next Match", desc: "Upcoming match countdown and info." },
  { name: "Current Match", desc: "Live match status and details." },
];

export default function BroadcastSection() {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "start",
        }}>
          {/* LEFT */}
          <div>
            <div className="section-label">OBS Integration</div>
            <h2 className="text-display" style={{ marginBottom: "16px" }}>
              Built for<br />Broadcast
            </h2>
            <p style={{
              color: "var(--white-70)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              marginBottom: "24px",
              maxWidth: "380px",
            }}>
              Make your tournament look professional on stream.
              TournaOps overlays connect directly to OBS via browser source.
              Results update automatically. No manual work.
            </p>
            <Link href="/dashboard/broadcast" className="btn-primary">
              View Broadcast Overlays
            </Link>
          </div>

          {/* RIGHT — OVERLAY GRID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
          }}>
            {overlays.map((overlay, i) => (
              <div key={i} className="broadcast-overlay-card" style={{ padding: "20px" }}>
                {/* PREVIEW MOCKUP */}
                <div style={{
                  background: "var(--black)",
                  border: "1px solid var(--border-2)",
                  height: "60px",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "12px",
                  gap: "8px",
                }}>
                  <div style={{
                    width: "4px",
                    height: "32px",
                    background: "var(--gold)",
                  }} />
                  <div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      letterSpacing: "0.1em",
                      color: "var(--white-40)",
                      textTransform: "uppercase",
                    }}>TOURNAOPS</div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: "var(--white)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>{overlay.name}</div>
                  </div>
                </div>

                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}>{overlay.name}</div>
                <div style={{
                  fontSize: "0.75rem",
                  color: "var(--white-40)",
                  lineHeight: 1.5,
                }}>{overlay.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .broadcast-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </section>
  );
}