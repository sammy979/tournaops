export default function AIImagesLoading() {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ width: "14rem", height: "2rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.5rem", marginBottom: "1.5rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: "1.25rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: i === 0 ? "14rem" : i === 1 ? "16rem" : "8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.875rem", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div style={{ height: "32rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}