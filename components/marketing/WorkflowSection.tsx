export default function WorkflowSection() {
  const steps = [
    {
      number: "01",
      title: "Create Tournament",
      description: "Set up your tournament in minutes. Choose format, scoring, maps, and invite teams.",
    },
    {
      number: "02",
      title: "Import Teams",
      description: "Bulk import via CSV, Discord slots, or AI screenshot parsing. No manual entry needed.",
    },
    {
      number: "03",
      title: "Run Matches",
      description: "Enter results match by match. Auto-scoring calculates placement + kill points instantly.",
    },
    {
      number: "04",
      title: "Broadcast Live",
      description: "OBS overlays update in real time. Push standings to Discord with one click.",
    },
  ];

  return (
    <section style={{ padding: "80px 0", background: "var(--black-rich)" }}>
      <div className="container">

        <div style={{ marginBottom: "48px" }}>
          <p className="label-section" style={{ marginBottom: "10px" }}>
            How It Works
          </p>
          <h2 style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(28px, 4vw, 44px)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            color: "var(--white)",
          }}>
            Tournament Workflow
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "2px",
          background: "var(--border)",
        }}>
          {steps.map((step) => (
            <div key={step.number} style={{
              background: "var(--charcoal)",
              padding: "32px 28px",
            }}>
              <p style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: "var(--accent)",
                marginBottom: "16px",
              }}>
                {step.number}
              </p>
              <h3 style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 800,
                fontSize: "20px",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--white)",
                marginBottom: "12px",
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "13px",
                color: "var(--muted-light)",
                lineHeight: 1.6,
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}