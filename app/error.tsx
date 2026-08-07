"use client";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
          <AlertTriangle style={{ width: "2rem", height: "2rem", color: "#f87171" }} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>Something went wrong</h2>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "2rem", lineHeight: 1.6 }}>
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f59e0b", color: "#000", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
          >
            <RefreshCw style={{ width: "1rem", height: "1rem" }} />
            Try Again
          </button>
          <a
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0.625rem 1.25rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.875rem", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none" }}
          >
            <Home style={{ width: "1rem", height: "1rem" }} />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}