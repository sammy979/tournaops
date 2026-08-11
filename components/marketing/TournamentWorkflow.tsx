"use client";

const STEPS = [
  {
    num: "01",
    title: "REGISTRATION",
    desc: "Teams register through a single shareable link. One-click approval or auto-verification.",
  },
  {
    num: "02",
    title: "GROUPS",
    desc: "Seed and organize teams into groups. Manual or automated seeding.",
  },
  {
    num: "03",
    title: "MATCHES",
    desc: "Schedule matches. Manage slots, maps, and timing across all rounds.",
  },
  {
    num: "04",
    title: "RESULTS",
    desc: "Import results via screenshot or manual entry. AI extraction in seconds.",
  },
  {
    num: "05",
    title: "SCORING",
    desc: "Points are calculated automatically using PMGC or custom scoring rules.",
  },
  {
    num: "06",
    title: "BROADCAST",
    desc: "Publish live standings. Push overlays to OBS with one click.",
  },
  {
    num: "07",
    title: "CHAMPION",
    desc: "Crown the winner. Publish results to Discord. Archive the tournament.",
  },
];

export function TournamentWorkflow() {
  return (
    <section
      className="section-ops"
      style={{ background: "var(--color-surface-0)" }}
    >
      <div className="container-ops">
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div className="section-eyebrow">
            <span className="label-section-accent">Tournament Lifecycle</span>
          </div>
          <h2 className="section-title">
            FROM REGISTRATION<br />TO CHAMPION
          </h2>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "0.9375rem",
              marginTop: "12px",
              maxWidth: "480px",
            }}
          >
            Every tournament runs the same proven operational flow.
          </p>
        </div>

        {/* Two-column layout: Timeline left, detail right (on larger screens) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "0",
          }}
        >
          {/* Left: Numbered Steps */}
          <div style={{ borderRight: "1px solid var(--color-border)" }}>
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0",
                  borderBottom:
                    idx < STEPS.length - 1
                      ? "1px solid var(--color-border-subtle)"
                      : "none",
                  padding: "20px 24px",
                  position: "relative",
                }}
              >
                {/* Number */}
                <div
                  style={{
                    flexShrink: 0,
                    width: "44px",
                    height: "44px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--color-border-strong)",
                    borderRadius: "2px",
                    marginRight: "16px",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-gold)",
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--color-text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      lineHeight: "1.5",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>

                {/* Connector Arrow */}
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-1px",
                      left: "43px",
                      width: "1px",
                      height: "1px",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Right: Visual Diagram */}
          <div
            style={{
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "0",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
                marginBottom: "20px",
                letterSpacing: "0.08em",
              }}
            >
              OPERATIONAL FLOW
            </div>

            {STEPS.map((step, idx) => (
              <div key={step.num}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background:
                        idx === 0 ? "var(--color-gold)" : "var(--color-border-strong)",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color:
                        idx === 0
                          ? "var(--color-gold)"
                          : idx === STEPS.length - 1
                          ? "var(--color-text-primary)"
                          : "var(--color-text-muted)",
                    }}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      marginLeft: "2px",
                      width: "2px",
                      height: "20px",
                      background: "var(--color-border)",
                      borderRadius: "1px",
                    }}
                  />
                )}
              </div>
            ))}

            {/* CTA */}
            <div
              style={{
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <a
                href="/auth/register"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Start Your Tournament
              </a>
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--color-text-muted)",
                  marginTop: "10px",
                  textAlign: "center",
                  letterSpacing: "0.06em",
                }}
              >
                FREE TO START · NO CREDIT CARD REQUIRED
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}