export default function TournamentDetailLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>

      {/* Back button skeleton */}
      <div style={{
        width: "120px",
        height: "14px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        marginBottom: "20px",
        animation: "pulse 1.5s ease-in-out infinite",
      }} />

      {/* Tab nav skeleton */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", flexWrap: "wrap" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            width: "88px",
            height: "32px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.05}s`,
          }} />
        ))}
      </div>

      {/* Header card skeleton */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: "24px",
        marginBottom: "24px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{
            width: "56px",
            height: "56px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            flexShrink: 0,
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              width: "240px",
              height: "24px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              marginBottom: "10px",
            }} />
            <div style={{
              width: "160px",
              height: "14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              marginBottom: "20px",
            }} />
            <div style={{ display: "flex", gap: "12px" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  width: "80px",
                  height: "52px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content grid skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: "180px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>
    </div>
  );
}