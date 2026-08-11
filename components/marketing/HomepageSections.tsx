import Link from "next/link";

export function DiscordSection() {
  return (
    <section
      className="section-ops"
      style={{ background: "var(--color-surface-0)" }}
    >
      <div className="container-ops">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            <div className="section-eyebrow">
              <span className="label-section-accent">Discord</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: "16px" }}>
              DISCORD<br />SYNC
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9375rem",
                lineHeight: "1.65",
                marginBottom: "24px",
              }}
            >
              Publish match results, standings updates, and tournament
              announcements directly to your Discord server — automatically.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                    gap: "10px",
                    fontSize: "0.875rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "var(--color-success)",
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Discord Preview */}
          <div>
            <div
              style={{
                background: "#36393f",
                border: "1px solid #202225",
                borderRadius: "6px",
                overflow: "hidden",
                fontFamily: "var(--font-mono)",
              }}
            >
              {/* Channel Header */}
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #202225",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#72767d", fontSize: "0.875rem" }}>#</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#dcddde",
                    letterSpacing: "0.02em",
                  }}
                >
                  results
                </span>
              </div>

              {/* Messages */}
              <div style={{ padding: "16px 14px" }}>
                {/* Bot message */}
                <div
                  style={{
                    background: "#2f3136",
                    borderLeft: "3px solid var(--color-gold)",
                    borderRadius: "0 4px 4px 0",
                    padding: "10px 12px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "var(--color-gold)",
                      marginBottom: "6px",
                    }}
                  >
                    TOURNAOPS · MATCH 18 RESULTS
                  </div>
                  {[
                    "✓ Results imported",
                    "✓ Scores calculated",
                    "✓ Standings updated",
                    "✓ Published to #results",
                  ].map((line) => (
                    <div
                      key={line}
                      style={{
                        fontSize: "0.6875rem",
                        color: "#b9bbbe",
                        padding: "2px 0",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    background: "#2f3136",
                    borderLeft: "3px solid var(--color-live)",
                    borderRadius: "0 4px 4px 0",
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "var(--color-live)",
                      marginBottom: "4px",
                    }}
                  >
                    🏆 CURRENT LEADER
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#dcddde" }}>
                    DRS GAMING — 128 PTS
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OpsAISection() {
  return (
    <section
      className="section-ops"
      style={{
        background: "var(--color-near-black)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="container-ops">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left — AI Import Preview */}
          <div
            style={{
              order: 1,
            }}
          >
            <div className="panel-ops" style={{ maxWidth: "420px" }}>
              <div className="panel-header">
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--color-text-muted)",
                  }}
                >
                  AI RESULT IMPORT
                </span>
                <span className="badge-gold">OPS AI</span>
              </div>

              <div style={{ padding: "16px" }}>
                {/* Upload zone */}
                <div
                  style={{
                    border: "1px dashed var(--color-border-strong)",
                    borderRadius: "4px",
                    padding: "20px",
                    textAlign: "center",
                    marginBottom: "16px",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                      marginBottom: "4px",
                    }}
                  >
                    SCREENSHOT UPLOADED
                  </div>
                  <div
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-success)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    ✓ PROCESSING COMPLETE
                  </div>
                </div>

                {/* Extracted data */}
                <div
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="label-ops">Extracted Results</span>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-success)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                    }}
                  >
                    96% CONFIDENCE
                  </span>
                </div>

                {[
                  { pos: "01", team: "DRS GAMING", kills: "8", pts: "28" },
                  { pos: "02", team: "T2K ESPORTS", kills: "5", pts: "21" },
                  { pos: "03", team: "VENOM", kills: "3", pts: "18" },
                ].map((row) => (
                  <div
                    key={row.pos}
                    style={{
                      display: "flex",
                      gap: "8px",
                      padding: "7px 0",
                      borderBottom: "1px solid var(--color-border-subtle)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "var(--color-text-muted)", width: "20px" }}>
                      {row.pos}
                    </span>
                    <span style={{ flex: 1, color: "var(--color-text-primary)", fontWeight: 600 }}>
                      {row.team}
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.6875rem" }}>
                      {row.kills}K
                    </span>
                    <span style={{ color: "var(--color-gold)", fontWeight: 700 }}>
                      {row.pts}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: "14px", display: "flex", gap: "8px" }}>
                  <button className="btn btn-success btn-sm" style={{ flex: 1 }}>
                    Approve &amp; Save
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ order: 0 }}>
            <div className="section-eyebrow">
              <span className="label-section-accent">OPS AI</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: "16px" }}>
              RESULTS IN<br />SECONDS
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "0.9375rem",
                lineHeight: "1.65",
                marginBottom: "24px",
              }}
            >
              Upload a PUBG Mobile results screenshot. OPS AI extracts teams,
              kills, placements and points automatically. Review, confirm, done.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "28px",
              }}
            >
              {[
                { step: "01", label: "Upload screenshot" },
                { step: "02", label: "AI extracts results" },
                { step: "03", label: "Review & confirm" },
                { step: "04", label: "Standings auto-update" },
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: "var(--color-gold)",
                      width: "24px",
                    }}
                  >
                    {item.step}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link href="/dashboard/tournaments" className="btn btn-secondary">
              Try AI Import
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OrganizerCTA() {
  return (
    <section
      className="section-ops"
      style={{
        background: "var(--color-surface-0)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div className="container-ops">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-gold)",
              marginBottom: "20px",
            }}
          >
            FOR ORGANIZERS
          </div>

          <h2
            className="text-display-md"
            style={{ marginBottom: "20px", color: "var(--color-text-primary)" }}
          >
            YOUR TOURNAMENT.<br />YOUR CONTROL.
          </h2>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--color-text-secondary)",
              lineHeight: "1.65",
              marginBottom: "36px",
            }}
          >
            TournaOps gives you a complete operations platform — not just a
            bracket. Run professional PUBG Mobile tournaments with the tools
            the best organizers use.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/auth/register" className="btn btn-primary btn-xl">
              Create Free Tournament
            </Link>
            <Link href="/pricing" className="btn btn-secondary btn-xl">
              View Pricing
            </Link>
          </div>

          <div
            style={{
              marginTop: "32px",
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {[
              "Free to start",
              "Pro: Rs 299/mo",
              "No credit card needed",
            ].map((item) => (
              <span
                key={item}
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}