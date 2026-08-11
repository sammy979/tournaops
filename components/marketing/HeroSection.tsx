import Link from "next/link";

interface LiveMatch {
  tournamentName?: string;
  matchNumber?: number;
  totalMatches?: number;
  map?: string;
  teamCount?: number;
}

interface HeroSectionProps {
  liveMatch?: LiveMatch | null;
}

export default function HeroSection({ liveMatch }: HeroSectionProps) {
  return (
    <section style={{
      background: "var(--black)",
      borderBottom: "1px solid var(--border)",
      overflow: "hidden",
    }}>
      <div className="container-ops" style={{ padding: "72px 24px 64px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
        }}>
          {/* LEFT — COPY */}
          <div>
            <div className="section-label" style={{ marginBottom: "24px" }}>
              The Operating System for PUBG Mobile Competition
            </div>

            <h1 className="text-hero" style={{ marginBottom: "24px" }}>
              <span style={{ display: "block" }}>Run</span>
              <span style={{ display: "block" }}>Tournaments.</span>
              <span style={{ display: "block", color: "var(--gold)" }}>Not Chaos.</span>
            </h1>

            <p style={{
              fontSize: "1rem",
              color: "var(--white-70)",
              lineHeight: 1.7,
              maxWidth: "420px",
              marginBottom: "32px",
            }}>
              The complete tournament operations system for competitive PUBG Mobile.
              From registration to trophy — one platform.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/auth/signup" className="btn-primary">
                Create Tournament
              </Link>
              <Link href="/tournaments" className="btn-secondary">
                Explore Tournaments
              </Link>
            </div>

            {/* STATS ROW */}
            <div style={{
              display: "flex",
              gap: "32px",
              marginTop: "48px",
              paddingTop: "32px",
              borderTop: "1px solid var(--border)",
            }}>
              {[
                { value: "REGISTRATION", label: "→ GROUPS → MATCHES" },
                { value: "RESULTS", label: "→ SCORING → CHAMPION" },
              ].map((item) => (
                <div key={item.value}>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    color: "var(--gold)",
                    textTransform: "uppercase",
                  }}>{item.value}</div>
                  <div style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.08em",
                    color: "var(--white-40)",
                    textTransform: "uppercase",
                    marginTop: "2px",
                  }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — LIVE MATCH MODULE */}
          <div>
            <LiveMatchModule liveMatch={liveMatch} />
          </div>
        </div>
      </div>

      {/* MOBILE — stack vertically */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
}

function LiveMatchModule({ liveMatch }: { liveMatch?: LiveMatch | null }) {
  if (liveMatch) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderTop: "3px solid var(--red)",
      }}>
        {/* HEADER */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span className="badge-live">Live</span>
          <span style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--white-40)",
          }}>GRAND FINAL</span>
        </div>

        {/* MATCH INFO */}
        <div style={{ padding: "20px" }}>
          <div style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "0.08em",
            color: "var(--white-70)",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}>{liveMatch.tournamentName}</div>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.75rem",
            color: "var(--white-40)",
            marginBottom: "20px",
          }}>
            MATCH {liveMatch.matchNumber} / {liveMatch.totalMatches} · {liveMatch.map}
          </div>

          {/* TEAMS PLACEHOLDER */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { pos: "01", team: "DRS GAMING", points: 128 },
              { pos: "02", team: "T2K ESPORTS", points: 119 },
              { pos: "03", team: "VENOM ESPORTS", points: 111 },
              { pos: "04", team: "NEPAL X", points: 98 },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: i === 0 ? "var(--gold-dim)" : "transparent",
                border: i === 0 ? "1px solid rgba(201,168,76,0.3)" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: i === 0 ? "var(--gold)" : "var(--white-40)",
                    minWidth: "24px",
                  }}>{row.pos}</span>
                  <span style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    letterSpacing: "0.05em",
                    color: "var(--white)",
                  }}>{row.team}</span>
                </div>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: i === 0 ? "var(--gold)" : "var(--white-70)",
                }}>{row.points}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "0.75rem",
              color: "var(--white-40)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>{liveMatch.teamCount} TEAMS</span>
            <Link href="/tournaments" style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: "var(--gold)",
              textDecoration: "none",
              textTransform: "uppercase",
            }}>View Full Standings →</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
    }}>
      {/* MODULE HEADER */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 700,
          fontSize: "0.75rem",
          letterSpacing: "0.12em",
          color: "var(--white-40)",
          textTransform: "uppercase",
        }}>Tournament Control</span>
        <span style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.7rem",
          color: "var(--white-40)",
        }}>TOURNAOPS</span>
      </div>

      {/* WORKFLOW PREVIEW */}
      <div style={{ padding: "20px" }}>
        {[
          { step: "01", label: "REGISTRATION", status: "complete" },
          { step: "02", label: "GROUPS", status: "complete" },
          { step: "03", label: "MATCHES", status: "active" },
          { step: "04", label: "RESULTS", status: "pending" },
          { step: "05", label: "SCORING", status: "pending" },
          { step: "06", label: "BROADCAST", status: "pending" },
          { step: "07", label: "CHAMPION", status: "pending" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "8px 0",
            borderBottom: i < 6 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "0.7rem",
              color: item.status === "complete" ? "var(--green)" : item.status === "active" ? "var(--gold)" : "var(--white-20)",
              minWidth: "22px",
            }}>{item.step}</span>
            <div style={{
              flex: 1,
              height: "1px",
              background: item.status === "complete" ? "var(--green)" : item.status === "active" ? "var(--gold)" : "var(--border)",
              maxWidth: "16px",
            }} />
            <span style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 600,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              color: item.status === "complete" ? "var(--green)" : item.status === "active" ? "var(--gold)" : "var(--white-20)",
              textTransform: "uppercase",
              flex: 1,
            }}>{item.label}</span>
            {item.status === "complete" && (
              <span style={{ color: "var(--green)", fontSize: "0.7rem" }}>✓</span>
            )}
            {item.status === "active" && (
              <span className="live-dot" />
            )}
          </div>
        ))}

        <div style={{
          marginTop: "16px",
          paddingTop: "14px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontSize: "0.7rem",
            color: "var(--white-40)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>No Live Match</span>
          <Link href="/tournaments" style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            color: "var(--gold)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>Explore Tournaments →</Link>
        </div>
      </div>
    </div>
  );
}