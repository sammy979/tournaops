export default function TournamentDetailLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Back button skeleton */}
      <div style={{ width: "8rem", height: "1rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.375rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />

      {/* Nav skeleton */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ width: "5.5rem", height: "2rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>

      {/* Header card skeleton */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "1.5rem",
        marginBottom: "1.5rem",
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <div style={{ width: "4rem", height: "4rem", borderRadius: "1rem", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: "16rem", height: "1.75rem", background: "rgba(255,255,255,0.08)", borderRadius: "0.375rem", marginBottom: "0.5rem" }} />
            <div style={{ width: "10rem", height: "1rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.375rem", marginBottom: "1rem" }} />
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ width: "5rem", height: "3.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "0.5rem" }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            height: "12rem",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1rem",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }} />
        ))}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}