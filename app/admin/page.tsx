"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield, Users, Trophy, Activity, AlertCircle,
  TrendingUp, Loader2, Sparkles, Crown, Database,
  Zap, ChevronRight
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: stats?.totalUsers || 0, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
    { icon: Trophy, label: "Total Tournaments", value: stats?.totalTournaments || 0, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: Activity, label: "Active Live", value: stats?.liveTournaments || 0, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
    { icon: Database, label: "Total Teams", value: stats?.totalTeams || 0, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
    { icon: Zap, label: "Total Matches", value: stats?.totalMatches || 0, color: "#f472b6", bg: "rgba(236,72,153,0.1)" },
    { icon: Crown, label: "Pro Users", value: stats?.proUsers || 0, color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(245,158,11,0.1)", color: "#f59e0b", padding: "0.3rem 0.875rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, marginBottom: "0.875rem", border: "1px solid rgba(245,158,11,0.25)" }}>
          <Shield style={{ width: "0.75rem", height: "0.75rem" }} />
          SYSTEM ADMIN
        </div>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield style={{ width: "2rem", height: "2rem", color: "#f59e0b" }} />
          Platform Administration
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.375rem" }}>
          Complete system overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${stat.color}40`;
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}>
              <div style={{
                position: "absolute", top: "-20px", right: "-20px",
                width: "100px", height: "100px",
                background: `radial-gradient(circle, ${stat.color}15, transparent)`,
                borderRadius: "50%",
              }} />
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "2.5rem", height: "2.5rem",
                  borderRadius: "0.625rem",
                  background: stat.bg,
                  border: `1px solid ${stat.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1rem",
                }}>
                  <Icon style={{ width: "1.125rem", height: "1.125rem", color: stat.color }} />
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                  {stat.value.toLocaleString()}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.375rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Panel */}
      <div style={{
        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.03))",
        border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: "1rem",
        padding: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
          <AlertCircle style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b", flexShrink: 0, marginTop: "0.125rem" }} />
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem" }}>
              Admin Access
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#d1d5db", lineHeight: 1.6, marginBottom: "1rem" }}>
              You have elevated system privileges. Use responsibly. All admin actions are logged for audit purposes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.625rem" }}>
              {[
                { label: "View All Tournaments", href: "/dashboard/tournaments", icon: Trophy },
                { label: "System Analytics", href: "/dashboard/analytics", icon: TrendingUp },
                { label: "Manage Users", href: "/admin", icon: Users },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.625rem 0.875rem",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "0.5rem",
                      color: "#fff",
                      fontSize: "0.8rem", fontWeight: 600,
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(245,158,11,0.1)";
                      e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <Icon style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b" }} />
                    <span style={{ flex: 1 }}>{action.label}</span>
                    <ChevronRight style={{ width: "0.75rem", height: "0.75rem", color: "#6b7280" }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}