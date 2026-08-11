import Link from "next/link";

export default function OpsAISection() {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}>
          <div>
            <div className="section-label">Operations Assistant</div>
            <h2 className="text-display" style={{ marginBottom: "16px" }}>
              Ops AI
            </h2>
            <p style={{
              color: "var(--white-70)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              marginBottom: "24px",
              maxWidth: "440px",
            }}>
              Your tournament operations assistant. Ops AI reads PUBG Mobile screenshots
              and extracts kills, placements, and results automatically. Review and publish in seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                "Screenshot result extraction",
                "Auto-detect kills and placements",
                "Team name matching",
                "Confidence scoring",
                "One-click publish",
              ].map((item) => (
                <div key={item} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "var(--white-70)",
                }}>
                  <span style={{ color: "var(--gold)", fontFamily: "JetBrains Mono, monospace" }}>→</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderTop: "3px solid var(--gold)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  letterSpacing: "0.15em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                }}>Ops AI Extraction</span>
                <span className="badge-completed">Complete</span>
              </div>

              <div style={{ padding: "16px" }}>
                {[
                  { pos: "01", team: "DRS GAMING", kills: 12, pts: 24 },
                  { pos: "02", team: "T2K ESPORTS", kills: 8, pts: 18 },
                  { pos: "03", team: "VENOM ESPORTS", kills: 6, pts: 14 },
                  { pos: "04", team: "NEPAL X", kills: 5, pts: 10 },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 50px 50px",
                    padding: "8px 12px",
                    alignItems: "center",
                    background: i === 0 ? "var(--gold-dim)" : "transparent",
                    marginBottom: "2px",
                  }}>
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      color: i === 0 ? "var(--gold)" : "var(--white-40)",
                    }}>{row.pos}</span>
                    <span style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      color: "var(--white)",
                      textTransform: "uppercase",
                    }}>{row.team}</span>
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.8rem",
                      color: "var(--white-70)",
                      textAlign: "right",
                    }}>{row.kills}</span>
                    <span style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: i === 0 ? "var(--gold)" : "var(--white)",
                      textAlign: "right",
                    }}>{row.pts}</span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: "10px 16px",
                borderTop: "1px solid var(--border)",
                background: "var(--surface-2)",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.72rem",
                color: "var(--white-40)",
              }}>
                <span>AI CONFIDENCE: 98%</span>
                <span>4 TEAMS DETECTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}