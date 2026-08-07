"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy, Plus, TrendingUp, Users, Target,
  Crosshair, ArrowRight, Crown, Zap,
  BarChart3, Radio, Clock, Star
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/tournaments").then(r => r.json()),
    ]).then(([userData, tourData]) => {
      if (userData.user) setUser(userData.user);
      setTournaments(tourData.tournaments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tournaments.length,
    live: tournaments.filter(t => t.status === "live").length,
    completed: tournaments.filter(t => t.status === "completed").length,
    totalTeams: tournaments.reduce((a, t) => a + (t._count?.teams || 0), 0),
  };

  const recentTournaments = tournaments.slice(0, 5);

  const quickActions = [
    { icon: Plus, label: "New Tournament", href: "/dashboard/tournaments/create", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { icon: Radio, label: "OBS Overlays", href: "/dashboard/overlay", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
    { icon: Zap, label: "AI Assistant", href: "/dashboard/ai", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  ];

  const statusColors: Record<string, string> = {
    live: "#4ade80",
    draft: "#9ca3af",
    registration: "#60a5fa",
    completed: "#c084fc",
    cancelled: "#f87171",
  };

  const statusBg: Record<string, string> = {
    live: "rgba(34,197,94,0.1)",
    draft: "rgba(107,114,128,0.1)",
    registration: "rgba(59,130,246,0.1)",
    completed: "rgba(168,85,247,0.1)",
    cancelled: "rgba(239,68,68,0.1)",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{
        width: "2rem", height: "2rem",
        border: "2px solid rgba(245,158,11,0.3)",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#fff", marginBottom: "0.25rem" }}>
          {user ? `Welcome back, ${user.displayName || user.username}` : "Dashboard"}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Pro Banner */}
      {user && !user.isPro && (
        <div style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.05))",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Crown style={{ width: "1.25rem", height: "1.25rem", color: "#f59e0b", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem" }}>Upgrade to Pro</div>
              <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Unlimited tournaments, AI assistant, 400 teams</div>
            </div>
          </div>
          <Link href="/dashboard/upgrade" style={{
            background: "#f59e0b",
            color: "#000",
            padding: "0.5rem 1.25rem",
            borderRadius: "0.625rem",
            fontWeight: 700,
            fontSize: "0.8rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            Start Free Trial
          </Link>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        {[
          { icon: Trophy, label: "Tournaments", value: stats.total, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { icon: TrendingUp, label: "Live Now", value: stats.live, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
          { icon: Target, label: "Completed", value: stats.completed, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
          { icon: Users, label: "Total Teams", value: stats.totalTeams, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <div style={{
                width: "2.25rem", height: "2.25rem",
                borderRadius: "0.625rem",
                background: stat.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.875rem",
              }}>
                <Icon style={{ width: "1.125rem", height: "1.125rem", color: stat.color }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.875rem" }}>
          Quick Actions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "0.875rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{
                  width: "2rem", height: "2rem",
                  borderRadius: "0.5rem",
                  background: action.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon style={{ width: "1rem", height: "1rem", color: action.color }} />
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#d1d5db", whiteSpace: "nowrap" }}>
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Tournaments */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Recent Tournaments
          </div>
          <Link href="/dashboard/tournaments" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600, textDecoration: "none" }}>
            View all <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
          </Link>
        </div>

        {recentTournaments.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "2px dashed rgba(255,255,255,0.08)",
            borderRadius: "1.25rem",
            padding: "3rem",
            textAlign: "center",
          }}>
            <Trophy style={{ width: "2.5rem", height: "2.5rem", color: "#374151", margin: "0 auto 1rem" }} />
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>No tournaments yet</div>
            <div style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Create your first tournament and start running events
            </div>
            <Link href="/dashboard/tournaments/create" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "#f59e0b", color: "#000",
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.875rem",
              textDecoration: "none",
            }}>
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {recentTournaments.map(t => (
              <Link
                key={t.id}
                href={`/dashboard/tournaments/${t.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderRadius: "0.875rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{
                  width: "2.5rem", height: "2.5rem",
                  borderRadius: "0.625rem",
                  background: "rgba(245,158,11,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Trophy style={{ width: "1.125rem", height: "1.125rem", color: "#f59e0b" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.125rem" }}>
                    {t._count?.teams || 0} teams
                  </div>
                </div>

                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  background: statusBg[t.status] || "rgba(107,114,128,0.1)",
                  color: statusColors[t.status] || "#9ca3af",
                  border: `1px solid ${statusColors[t.status] || "#9ca3af"}30`,
                  flexShrink: 0,
                }}>
                  {t.status === "live" && (
                    <div style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#4ade80" }} />
                  )}
                  {t.status}
                </div>

                <ArrowRight style={{ width: "1rem", height: "1rem", color: "#4b5563", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}