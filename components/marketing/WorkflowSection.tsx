export default function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "REGISTRATION",
      desc: "Teams register through one link. Set slots, entry requirements, and auto-close when full.",
    },
    {
      number: "02",
      title: "GROUPS",
      desc: "Organize and seed teams into groups automatically or manually.",
    },
    {
      number: "03",
      title: "MATCHES",
      desc: "Schedule and run matches. Track submission status in real time.",
    },
    {
      number: "04",
      title: "RESULTS",
      desc: "Import results via screenshot. AI extracts kills and placements instantly.",
    },
    {
      number: "05",
      title: "SCORING",
      desc: "Points are calculated automatically using PMGC or custom scoring presets.",
    },
    {
      number: "06",
      title: "BROADCAST",
      desc: "Publish standings to OBS overlays and Discord simultaneously.",
    },
    {
      number: "07",
      title: "CHAMPION",
      desc: "Crown the winner with a verified final result and trophy announcement.",
    },
  ];

  return (
    <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border)" }}>
      <div className="container-ops">
        <div className="section-label">Tournament Lifecycle</div>
        <h2 className="text-display" style={{ marginBottom: "8px" }}>
          How TournaOps Works
        </h2>
        <p style={{ color: "var(--white-40)", fontSize: "0.9rem", marginBottom: "48px", maxWidth: "480px" }}>
          Every tournament follows the same operational path. TournaOps handles each step.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0",
          border: "1px solid var(--border)",
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              padding: "28px 32px",
              borderRight: i % 2 === 0 ? "1px solid var(--border)" : "none",
              borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none",
              display: "flex",
              gap: "20px",
              alignItems: "flex-start",
              background: "var(--surface)",
              gridColumn: i === 6 ? "1 / -1" : "auto",
            }}>
              <span style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "3rem",
                color: "var(--border-2)",
                lineHeight: 1,
                flexShrink: 0,
              }}>{step.number}</span>
              <div>
                <div style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  letterSpacing: "0.1em",
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}>{step.title}</div>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--white-70)",
                  lineHeight: 1.6,
                  maxWidth: "320px",
                }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .workflow-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}