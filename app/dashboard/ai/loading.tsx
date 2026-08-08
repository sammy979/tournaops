export default function AILoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
        <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", background: "rgba(168,85,247,0.2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ width: "10rem", height: "1.75rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.375rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ height: "5rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", marginBottom: "1.5rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "0.875rem" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ height: "9rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}