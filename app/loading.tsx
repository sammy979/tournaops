export default function RootLoading() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0f",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "3rem", height: "3rem",
          borderRadius: "50%",
          border: "3px solid rgba(245,158,11,0.2)",
          borderTop: "3px solid #f59e0b",
          animation: "spin 0.8s linear infinite",
        }} />
        <span style={{ color: "#6b7280", fontSize: "0.875rem", fontWeight: 500 }}>Loading...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}