export default function TournamentsLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header skeleton */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ width: "12rem", height: "2rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem", marginBottom: "0.5rem", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "20rem", height: "1rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>

      {/* Cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "1rem",
            padding: "1.25rem",
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.875rem" }}>
              <div style={{ width: "60%", height: "1.25rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.375rem" }} />
              <div style={{ width: "4rem", height: "1.25rem", background: "rgba(255,255,255,0.04)", borderRadius: "9999px" }} />
            </div>
            <div style={{ width: "40%", height: "0.875rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem", marginBottom: "1rem" }} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ width: "5rem", height: "0.875rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem" }} />
              <div style={{ width: "5rem", height: "0.875rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem" }} />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}