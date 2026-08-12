export default function RankingsLoading() {
  return (
    <div style={{ background: "var(--black)", minHeight: "100vh" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>

      {/* Header skeleton */}
      <div style={{
        background: "var(--charcoal)",
        borderBottom: "1px solid var(--border)",
        padding: "48px 0 0",
      }}>
        <div className="container-ops">
          <div style={{
            width: "100px",
            height: "12px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            marginBottom: "16px",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{
            width: "280px",
            height: "40px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            marginBottom: "12px",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{
            width: "400px",
            maxWidth: "100%",
            height: "14px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            marginBottom: "32px",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{ display: "flex", gap: "0", borderTop: "1px solid var(--border)" }}>
            {["All Formats", "Solo", "Duo", "Squad"].map((f, i) => (
              <div key={f} style={{
                width: "100px",
                height: "40px",
                background: i === 0 ? "var(--surface-2)" : "transparent",
                borderBottom: i === 0 ? "2px solid var(--gold)" : "2px solid transparent",
                animation: "pulse 1.5s ease-in-out infinite",
                animationDelay: `${i * 0.1}s`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 0",
      }}>
        <div className="container-ops" style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{
            width: "120px",
            height: "14px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          <div style={{
            width: "200px",
            height: "32px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="container-ops" style={{ padding: "32px 24px" }}>
        <div style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
          {/* Header row */}
          <div style={{
            height: "40px",
            background: "var(--surface-2)",
            borderBottom: "1px solid var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
          {/* Data rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              height: "56px",
              borderBottom: i < 9 ? "1px solid var(--border)" : "none",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.05}s`,
            }}>
              <div style={{ width: "32px", height: "32px", background: "var(--surface-2)", border: "1px solid var(--border)" }} />
              <div style={{ width: "160px", height: "14px", background: "var(--surface-2)", border: "1px solid var(--border)" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}