export default function DiscordLoading() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1.5rem" }}>
        <div style={{ width: "3rem", height: "3rem", borderRadius: "0.875rem", background: "rgba(88,101,242,0.2)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div>
          <div style={{ width: "12rem", height: "1.5rem", background: "rgba(255,255,255,0.06)", borderRadius: "0.375rem", marginBottom: "0.375rem", animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ width: "8rem", height: "0.875rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.375rem", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
      </div>
      <div style={{ height: "8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", marginBottom: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      <div style={{ height: "16rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", animation: "pulse 1.5s ease-in-out infinite" }} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}