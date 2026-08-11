import Link from "next/link";

const OVERLAYS = [
  { id: "standings", label: "Live Standings", desc: "Real-time points table for your stream." },
  { id: "chicken-dinner", label: "Chicken Dinner", desc: "Match winner announcement overlay." },
  { id: "top-fragger", label: "Top Fragger", desc: "Highest kill player highlight." },
  { id: "final-results", label: "Final Results", desc: "End-of-match results summary." },
  { id: "next-match", label: "Next Match", desc: "Upcoming match info for viewers." },
  { id: "current-match", label: "Current Match", desc: "Live match map and team info." },
];

export default function BroadcastSection() {
  return (
    <section className="section" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <div className="section-title-row">
          <div>
            <p className="label-section" style={{ marginBottom: "10px" }}>Broadcast</p>
            <h2 className="section-title">Built For Stream</h2>
            <p style={{ color: "var(--muted-light)", fontSize: "15px", marginTop: "10px", maxWidth: "440px" }}>
              Make your tournament look professional on stream. OBS overlays that update automatically.
            </p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            View Overlays →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            marginBottom: "40px",
          }}
          className="broadcast-grid"
        >
          {OVERLAYS.map((overlay) => (
            <div
              key={overlay.id}
              style={{
                background: "var(--charcoal)",
                padding: "20px",
              }}
            >
              {/* Preview box */}
              <div
                style={{
                  height: "80px",
                  background: "#000",
                  border: "1px solid var(--border-light)",
                  marginBottom: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Simulated overlay preview */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "rgba(10,10,10,0.9)",
                    borderTop: "2px solid var(--gold-dim)",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--white)",
                    }}
                  >
                    {overlay.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "8px",
                      color: "var(--gold)",
                      letterSpacing: "0.12em",
                    }}
                  >
                    OBS OVERLAY
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--white)",
                  marginBottom: "4px",
                }}
              >
                {overlay.label}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--muted-light)",
                  lineHeight: 1.5,
                }}
              >
                {overlay.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "24px",
          }}
          className="broadcast-features"
        >
          {[
            { label: "Auto-updating", desc: "Overlays pull live data. No manual refresh needed." },
            { label: "OBS Browser Source", desc: "Paste the URL into OBS. Done in 30 seconds." },
            { label: "Custom Branding", desc: "Your tournament name, your team names, your stream." },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                padding: "20px",
                background: "var(--charcoal)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--gold-bright)",
                  marginBottom: "6px",
                }}
              >
                {f.label}
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted-light)", lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .broadcast-grid { grid-template-columns: 1fr !important; }
          .broadcast-features { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}