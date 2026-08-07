"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3, TrendingUp, Trophy, Users, Crosshair,
  Flame, Calendar, Award, Clock, Target, Zap,
  Activity, Layers, ArrowUp, ArrowDown, Loader2,
  Sparkles, ChevronRight
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  status: string;
  createdAt?: string;
  _count?: { teams: number; matches?: number; rounds: number };
}

export default function AnalyticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then(r => r.json())
      .then(d => setTournaments(d.tournaments || []))
      .catch(() => setTournaments([]))
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

  // Calculate stats
  const totalTournaments = tournaments.length;
  const liveTournaments = tournaments.filter(t => t?.status === "live").length;
  const completedTournaments = tournaments.filter(t => t?.status === "completed").length;
  const draftTournaments = tournaments.filter(t => t?.status === "draft").length;
  const registrationTournaments = tournaments.filter(t => t?.status === "registration").length;
  const totalTeams = tournaments.reduce((a, t) => a + (t?._count?.teams || 0), 0);
  const totalMatches = tournaments.reduce((a, t) => a + (t?._count?.matches || 0), 0);
  const totalRounds = tournaments.reduce((a, t) => a + (t?._count?.rounds || 0), 0);

  const successRate = totalTournaments > 0
    ? Math.round((completedTournaments / totalTournaments) * 100)
    : 0;

  const avgTeamsPerTournament = totalTournaments > 0
    ? Math.round(totalTeams / totalTournaments)
    : 0;

  // Recent tournaments sorted by date
  const recentTournaments = [...tournaments]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  // Distribution
  const statusData = [
    { label: "Draft", value: draftTournaments, color: "#9ca3af", bg: "rgba(107,114,128,0.15)" },
    { label: "Registration", value: registrationTournaments, color: "#60a5fa", bg: "rgba(59,130,246,0.15)" },
    { label: "Live", value: liveTournaments, color: "#4ade80", bg: "rgba(34,197,94,0.15)" },
    { label: "Completed", value: completedTournaments, color: "#c084fc", bg: "rgba(168,85,247,0.15)" },
  ];

  const maxStatus = Math.max(...statusData.map(s => s.value), 1);

  const overallStats = [
    {
      label: "Total Tournaments",
      value: totalTournaments,
      icon: Trophy,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      sub: `${liveTournaments} live • ${completedTournaments} done`,
      trend: totalTournaments > 0 ? "up" : "neutral",
    },
    {
      label: "Total Teams",
      value: totalTeams,
      icon: Users,
      color: "#60a5fa",
      bg: "rgba(59,130,246,0.1)",
      sub: `Avg ${avgTeamsPerTournament} per tournament`,
      trend: totalTeams > 0 ? "up" : "neutral",
    },
    {
      label: "Matches Played",
      value: totalMatches,
      icon: Target,
      color: "#4ade80",
      bg: "rgba(34,197,94,0.1)",
      sub: `Across ${totalRounds} rounds`,
      trend: totalMatches > 0 ? "up" : "neutral",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: "#c084fc",
      bg: "rgba(168,85,247,0.1)",
      sub: "Tournaments completed",
      trend: successRate >= 50 ? "up" : "neutral",
    },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BarChart3 style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
          </div>
          Analytics
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.375rem" }}>
          Complete performance overview across all your tournaments
        </p>
      </div>

      {tournaments.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.08)",
          borderRadius: "1.25rem",
          padding: "5rem 2rem",
          textAlign: "center",
        }}>
          <BarChart3 style={{ width: "3.5rem", height: "3.5rem", color: "#374151", margin: "0 auto 1.25rem" }} />
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>
            No Data Yet
          </h3>
          <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Create tournaments to unlock powerful analytics and insights
          </p>
          <Link href="/dashboard/tournaments/create" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "#f59e0b", color: "#000",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.75rem",
            fontWeight: 700, fontSize: "0.875rem",
            textDecoration: "none",
          }}>
            <Sparkles style={{ width: "1rem", height: "1rem" }} />
            Create Your First Tournament
          </Link>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}>
            {overallStats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "120px", height: "120px",
                    background: `radial-gradient(circle, ${stat.color}15, transparent)`,
                    borderRadius: "50%",
                  }} />
                  <div style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                      <div style={{
                        width: "2.25rem", height: "2.25rem",
                        borderRadius: "0.625rem",
                        background: stat.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon style={{ width: "1.125rem", height: "1.125rem", color: stat.color }} />
                      </div>
                      {stat.trend === "up" && (
                        <ArrowUp style={{ width: "0.875rem", height: "0.875rem", color: "#4ade80" }} />
                      )}
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.375rem", fontWeight: 600 }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      {stat.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two Column: Status Distribution + Recent */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }} className="analytics-grid">

            {/* Status Distribution Chart */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Activity style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
                Tournament Status Distribution
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {statusData.map(item => {
                  const percentage = totalTournaments > 0 ? (item.value / totalTournaments) * 100 : 0;
                  return (
                    <div key={item.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem", fontSize: "0.75rem" }}>
                        <span style={{ color: "#d1d5db", fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: item.color, fontWeight: 800 }}>
                          {item.value} • {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        height: "0.5rem",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "9999px",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: "100%",
                          background: item.color,
                          borderRadius: "9999px",
                          boxShadow: `0 0 10px ${item.color}80`,
                          transition: "width 0.8s ease-out",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Insights */}
            <div style={{
              background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.03))",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles style={{ width: "1rem", height: "1rem", color: "#c084fc" }} />
                Quick Insights
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  {
                    icon: Trophy,
                    label: "Total Impact",
                    value: `${totalTeams} teams competed`,
                    color: "#f59e0b",
                  },
                  {
                    icon: Layers,
                    label: "Tournament Format",
                    value: `${totalRounds} rounds run`,
                    color: "#60a5fa",
                  },
                  {
                    icon: Zap,
                    label: "Match Activity",
                    value: `${totalMatches} matches completed`,
                    color: "#4ade80",
                  },
                  {
                    icon: Award,
                    label: "Current Focus",
                    value: liveTournaments > 0
                      ? `${liveTournaments} live tournament${liveTournaments > 1 ? "s" : ""}`
                      : registrationTournaments > 0
                      ? `${registrationTournaments} accepting registration`
                      : "No active tournaments",
                    color: "#c084fc",
                  },
                ].map((insight, i) => {
                  const Icon = insight.icon;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: "0.625rem",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div style={{
                        width: "2rem", height: "2rem",
                        borderRadius: "0.5rem",
                        background: `${insight.color}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: "1rem", height: "1rem", color: insight.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600 }}>
                          {insight.label}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 700, marginTop: "0.125rem" }}>
                          {insight.value}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Tournaments */}
          {recentTournaments.length > 0 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Clock style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
                  Recent Tournaments
                </h3>
                <Link href="/dashboard/tournaments" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                  fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600,
                  textDecoration: "none",
                }}>
                  View all
                  <ChevronRight style={{ width: "0.75rem", height: "0.75rem" }} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {recentTournaments.map(t => {
                  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
                    live: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.3)" },
                    draft: { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", border: "rgba(107,114,128,0.25)" },
                    registration: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
                    completed: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.25)" },
                  };
                  const s = statusColors[t.status] || statusColors.draft;
                  return (
                    <Link
                      key={t.id}
                      href={`/dashboard/tournaments/${t.id}`}
                      style={{
                        display: "flex", alignItems: "center", gap: "1rem",
                        padding: "0.75rem 1rem",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "0.625rem",
                        textDecoration: "none",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                      }}
                    >
                      <div style={{
                        width: "2.5rem", height: "2.5rem",
                        borderRadius: "0.5rem",
                        background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))",
                        border: "1px solid rgba(245,158,11,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Trophy style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem", display: "flex", gap: "0.75rem" }}>
                          <span>{t._count?.teams || 0} teams</span>
                          <span>•</span>
                          <span>{t._count?.matches || 0} matches</span>
                        </div>
                      </div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.25rem",
                        padding: "0.2rem 0.625rem",
                        borderRadius: "9999px",
                        fontSize: "0.6rem", fontWeight: 800,
                        background: s.bg, color: s.text,
                        border: `1px solid ${s.border}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {t.status}
                      </span>
                      <ChevronRight style={{ width: "1rem", height: "1rem", color: "#4b5563", flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}