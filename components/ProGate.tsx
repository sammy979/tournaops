"use client";
import Link from "next/link";
import { Crown, Lock, ArrowRight } from "lucide-react";

interface ProGateProps {
  feature: string;
  description?: string;
  children?: React.ReactNode;
  isPro?: boolean;
}

// Client component that shows an upgrade CTA when user is not Pro
// Usage: <ProGate feature="AI Insights" isPro={user?.isPro}><InsightsUI /></ProGate>
export default function ProGate({ feature, description, children, isPro }: ProGateProps) {
  if (isPro) return <>{children}</>;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(245,158,11,0.06), rgba(249,115,22,0.03))",
      border: "1px solid rgba(245,158,11,0.2)",
      borderRadius: "1rem",
      padding: "2rem 1.5rem",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "3rem",
        height: "3rem",
        borderRadius: "0.75rem",
        background: "rgba(245,158,11,0.15)",
        border: "1px solid rgba(245,158,11,0.3)",
        marginBottom: "1rem",
      }}>
        <Lock style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b" }} />
      </div>

      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 700, marginBottom: "0.75rem", border: "1px solid rgba(245,158,11,0.25)" }}>
        <Crown style={{ width: "0.65rem", height: "0.65rem" }} />
        PRO FEATURE
      </div>

      <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
        {feature}
      </h3>

      {description && (
        <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: "420px", margin: "0 auto 1.5rem", lineHeight: 1.5 }}>
          {description}
        </p>
      )}

      <Link
        href="/dashboard/upgrade"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#f59e0b",
          color: "#000",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.75rem",
          fontWeight: 700,
          fontSize: "0.875rem",
          textDecoration: "none",
          boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
        }}
      >
        <Crown style={{ width: "1rem", height: "1rem" }} />
        Upgrade to Pro
        <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
      </Link>
    </div>
  );
}