import Link from "next/link";
import { FileSearch, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ fontSize: "6rem", fontWeight: 900, color: "rgba(255,255,255,0.03)", lineHeight: 1, marginBottom: "-2rem" }}>404</div>
        <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", position: "relative", zIndex: 1 }}>
          <FileSearch style={{ width: "2rem", height: "2rem", color: "#f59e0b" }} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>Page Not Found</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f59e0b", color: "#000", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", textDecoration: "none" }}
          >
            <Home style={{ width: "1rem", height: "1rem" }} />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}