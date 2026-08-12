"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function TournamentsError({
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
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      background: "var(--black)",
    }}>
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <div style={{
          width: "48px",
          height: "3px",
          background: "var(--red)",
          margin: "0 auto 24px",
        }} />

        <h2 style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 800,
          fontSize: "1.5rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--white)",
          marginBottom: "8px",
        }}>Failed to Load Tournaments</h2>

        <p style={{
          color: "var(--white-40)",
          fontSize: "0.85rem",
          marginBottom: "32px",
          lineHeight: 1.6,
        }}>
          Could not load tournament data. Please try again.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} className="btn-gold">
            Try Again
          </button>
          <Link href="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}