export default function DiscordSection() {
  return (
    <section className="section" style={{ background: "var(--charcoal-deep)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            alignItems: "center",
          }}
          className="discord-grid"
        >
          {/* Left */}
          <div>
            <p className="label-section" style={{ marginBottom: "12px" }}>Discord</p>
            <h2 className="section-title" style={{ marginBottom: "16px" }}>Discord Sync</h2>
            <p style={{ color: "var(--muted-light)", fontSize: "15px", lineHeight: 1.7, marginBottom: "24px" }}>
              Keep your community updated automatically. Results, standings and announcements 
              post directly to your Discord server after each match.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                "Match result announcements",
                "Live standings updates",
                "Schedule reminders",
                "Champion announcements",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      width: "18px",
                      height: "18px",
                      background: "rgba(45,155,90,0.15)",
                      border: "1px solid rgba(45,155,90,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: "var(--green-bright)", fontSize: "10px", fontWeight: 700 }}>✓</span>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Discord preview */}
          <div>
            <div
              style={{
                background: "#1e1f22",
                border: "1px solid #2b2d31",
                padding: "0",
                overflow: "hidden",
              }}
            >
              {/* Discord channel header */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #2b2d31",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#6d6f78", fontSize: "16px" }}>#</span>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "11px",
                    color: "#dbdee1",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                  }}
                >
                  tournament-results
                </span>
              </div>

              {/* Message */}
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    background: "#2b2d31",
                    border: "1px solid #3a3c41",
                    borderLeft: "4px solid var(--gold)",
                    padding: "14px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--gold-bright)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                    }}
                  >
                    Match 18 Results — Erangel
                  </p>

                  {[
                    { step: "Results imported", done: true },
                    { step: "Scores calculated", done: true },
                    { step: "Standings updated", done: true },
                    { step: "Published to #results", done: true },
                  ].map((s) => (
                    <div
                      key={s.step}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <span style={{ color: s.done ? "var(--green-bright)" : "var(--muted)", fontSize: "11px" }}>
                        {s.done ? "✓" : "○"}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: s.done ? "#dbdee1" : "#6d6f78",
                          fontFamily: "Barlow, sans-serif",
                        }}
                      >
                        {s.step}
                      </span>
                    </div>
                  ))}

                  <div
                    style={{
                      marginTop: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid #3a3c41",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "10px",
                        color: "#6d6f78",
                        letterSpacing: "0.08em",
                        marginBottom: "8px",
                      }}
                    >
                      TOP 3 AFTER MATCH 18
                    </p>
                    {[
                      { rank: "01", team: "DRS GAMING", pts: "128" },
                      { rank: "02", team: "T2K ESPORTS", pts: "119" },
                      { rank: "03", team: "VENOM ESPORTS", pts: "111" },
                    ].map((t) => (
                      <div
                        key={t.rank}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#6d6f78" }}>
                          {t.rank}
                        </span>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "12px", color: "#dbdee1", letterSpacing: "0.06em", flex: 1, paddingLeft: "8px" }}>
                          {t.team}
                        </span>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--gold-bright)" }}>
                          {t.pts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p
                  style={{
                    marginTop: "8px",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "9px",
                    color: "#4e5058",
                    letterSpacing: "0.08em",
                  }}
                >
                  TODAY AT 9:42 PM — TOURNAOPS BOT
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .discord-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}