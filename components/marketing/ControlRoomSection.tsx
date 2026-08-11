import Link from "next/link";

export function ControlRoomSection() {
  return (
    <section
      className="section-ops"
      style={{
        background: "var(--color-near-black)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="container-ops">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div className="section-eyebrow">
              <span className="label-section-accent">Command Center</span>
            </div>
            <h2 className="section-title">
              TOURNAMENT<br />CONTROL ROOM
            </h2>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.875rem",
                marginTop: "10px",
                maxWidth: "360px",
              }}
            >
              Everything you need to run a professional tournament — visible at a glance.
            </p>
          </div>
          <Link href="/dashboard/command-center" className="btn btn-secondary">
            Open Command Center
          </Link>
        </div>

        {/* Control Room Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "auto auto",
            gap: "1px",
            background: "var(--color-border)",
            border: "1px solid var(--color-border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* CURRENT MATCH — Large */}
          <div
            style={{
              gridRow: "span 2",
              background: "var(--color-surface-1)",
              borderRight: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--color-surface-2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge-live">LIVE</span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    color: "var(--color-text-muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  CURRENT MATCH
                </span>
              </div>
            </div>
            <div style={{ padding: "20px 16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  MATCH 18
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.08em",
                  marginBottom: "20px",
                }}
              >
                ERANGEL · GRAND FINAL
              </div>

              {/* Submission Progress */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    SUBMISSIONS
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    61 / 64
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: "95%" }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--color-surface-3)",
                  borderRadius: "4px",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "var(--color-warning)",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  3 PENDING REVIEW
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Teams awaiting result confirmation
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  Import Results
                </button>
                <button className="btn btn-secondary btn-sm">
                  Review
                </button>
                <button className="btn btn-secondary btn-sm">
                  Publish
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS QUEUE */}
          <div
            style={{
              background: "var(--color-surface-1)",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
              }}
            >
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                RESULTS QUEUE
              </span>
            </div>
            <div>
              {[
                { match: "M18", map: "ERANGEL", time: "2 MIN AGO", status: "PENDING" },
                { match: "M17", map: "MIRAMAR", time: "12 MIN", status: "VERIFIED" },
                { match: "M16", map: "SANHOK", time: "25 MIN", status: "VERIFIED" },
              ].map((item) => (
                <div
                  key={item.match}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {item.match}
                    </div>
                    <div
                      style={{
                        fontSize: "0.625rem",
                        color: "var(--color-text-muted)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.map} · {item.time}
                    </div>
                  </div>
                  <span
                    className={
                      item.status === "PENDING" ? "badge-warning" : "badge-verified"
                    }
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOURNAMENT HEALTH */}
          <div
            style={{
              background: "var(--color-surface-1)",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
              }}
            >
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                HEALTH
              </span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {[
                { label: "TEAMS", status: "GOOD" },
                { label: "GROUPS", status: "GOOD" },
                { label: "SCHEDULE", status: "GOOD" },
                { label: "RESULTS", status: "WARNING" },
                { label: "STANDINGS", status: "GOOD" },
                { label: "DISCORD", status: "GOOD" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {item.label}
                  </span>
                  <div
                    className={
                      item.status === "GOOD"
                        ? "health-dot-good"
                        : item.status === "WARNING"
                        ? "health-dot-warning"
                        : "health-dot-error"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div
            style={{
              background: "var(--color-surface-1)",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--color-border)",
                background: "var(--color-surface-2)",
              }}
            >
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                QUICK ACTIONS
              </span>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Add Match Result",
                "AI Screenshot",
                "Manage Teams",
                "OBS Overlays",
                "Discord",
              ].map((action) => (
                <button
                  key={action}
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "flex-start", fontSize: "0.75rem" }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note */}
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--color-text-muted)",
            marginTop: "12px",
            letterSpacing: "0.04em",
          }}
        >
          Live preview — connect your tournament to see real data.
        </p>
      </div>
    </section>
  );
}