export default function DashboardLoading() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "2px solid var(--border)",
          borderTop: "2px solid var(--gold)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 600,
          fontSize: "0.72rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--white-40)",
        }}>Loading Dashboard</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}