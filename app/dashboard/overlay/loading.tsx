export default function OverlayLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ width: "14rem", height: "2rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem", marginBottom: "1.5rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ height: "10rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ height: "6rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ height: "12rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ aspectRatio: "16/9", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}