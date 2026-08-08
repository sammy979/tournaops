export default function DashboardLoading() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "2.5rem", height: "2.5rem",
          borderRadius: "50%",
          border: "3px solid rgba(245,158,11,0.2)",
          borderTop: "3px solid #f59e0b",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>Loading dashboard...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}