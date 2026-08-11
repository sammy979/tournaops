export default function DiscordSection() {
  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}>
          {/* LEFT — DISCORD PREVIEW */}
          <div>
            <div style={{
              background: "#1e1f22",
              border: "1px solid #2b2d31",
              overflow: "hidden",
            }}>
              {/* Discord Header */}
              <div style={{
                background: "#2b2d31",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid #1e1f22",
              }}>
                <span style={{ color: "#949ba4", fontSize: "0.85rem", fontWeight: 600 }}># results</span>
              </div>

              {/* Discord Messages */}
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Bot Message */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    background: "var(--gold)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "0.7rem", color: "var(--black)" }}>TO</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--gold)" }}>TournaOps</span>
                      <span style={{
                        background: "#5865f2",
                        color: "white",
                        fontSize: "0.6rem",
                        padding: "1px 5px",
                        borderRadius: "2px",
                        fontWeight: 700,
                      }}>BOT</span>
                      <span style={{ color: "#949ba4", fontSize: "0.7rem" }}>Today at 8:34 PM</span>
                    </div>

                    <div style={{
                      background: "#2b2d31",
                      borderLeft: "4px solid var(--green)",
                      padding: "12px 14px",
                      borderRadius: "0 4px 4px 0",
                    }}>
                      <div style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        letterSpacing: "0.08em",
                        color: "var(--white)",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                      }}>MATCH 18 RESULTS PUBLISHED</div>

                      {[
                        "Results imported",
                        "Scores calculated",
                        "Standings updated",
                        "Published to #results",
                      ].map((item, i) => (
                        <div key={i} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.8rem",
                          color: "#b5bac1",
                          marginBottom: "4px",
                        }}>
                          <span style={{ color: "var(--green)" }}>✓</span>
                          {item}
                        </div>
                      ))}

                      <div style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #3c3f45",
                        display: "flex",
                        justifyContent: "space-between",
                      }}>
                        <span style={{ fontSize: "0.75rem", color: "#949ba4" }}>ERANGEL</span>
                        <span style={{ fontSize: "0.75rem", color: "#949ba4" }}>64 teams</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — COPY */}
          <div>
            <div className="section-label">Discord Integration</div>
            <h2 className="text-display" style={{ marginBottom: "16px" }}>
              Discord<br />Sync
            </h2>
            <p style={{
              color: "var(--white-70)",
              fontSize: "0.9rem",
              lineHeight: 1.7,
              marginBottom: "24px",
              maxWidth: "380px",
            }}>
              TournaOps automatically publishes match results, standings,
              and announcements to your Discord server.
              Teams always know what&apos;s happening.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
              {[
                "Match announcements",
                "Results publication",
                "Standings updates",
                "Next match reminders",
              ].map((item) => (
                <div key={item} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.85rem",
                  color: "var(--white-70)",
                }}>
                  <span style={{
                    color: "var(--green)",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.8rem",
                  }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}