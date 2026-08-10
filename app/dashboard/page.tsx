"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Users, Activity, Clock, TrendingUp, Plus, ArrowRight, Loader2, Radio, Calendar, CheckCircle, Shield } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/tournaments").then(r => r.json()),
    ]).then(([u, t]) => {
      if (u.user) setUser(u.user);
      setTournaments(t.tournaments || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const live = tournaments.filter(t => t.status === "live");
  const registration = tournaments.filter(t => t.status === "registration");
  const completed = tournaments.filter(t => t.status === "completed");
  const draft = tournaments.filter(t => t.status === "draft");
  const totalTeams = tournaments.reduce((a, t) => a + (t._count?.teams || 0), 0);
  const totalMatches = tournaments.reduce((a, t) => a + (t._count?.matches || 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "SUPER_ADMIN";

  const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot?: boolean }> = {
    live:         { color: "#4ade80", bg: "rgba(34,197,94,0.12)",    border: "rgba(34,197,94,0.3)",    dot: true },
    registration: { color: "#60a5fa", bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.25)" },
    completed:    { color: "#c084fc", bg: "rgba(168,85,247,0.12)",   border: "rgba(168,85,247,0.25)" },
    draft:        { color: "#9ca3af", bg: "rgba(107,114,128,0.1)",   border: "rgba(107,114,128,0.2)" },
    cancelled:    { color: "#f87171", bg: "rgba(239,68,68,0.1)",     border: "rgba(239,68,68,0.2)" },
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", gap: "0.75rem" }}>
      <Loader2 style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              {greeting}{user?.displayName ? `, ${user.displayName}` : ""} 👋
            </h1>
            <p style={{ color: "#9ca3af", marginTop: "0.375rem", fontSize: "0.9rem" }}>
              Here is what is happening with your tournaments today.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {isOrganizer && (
              <Link href="/dashboard/command-center"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", borderRadius: "0.625rem",
                  fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Shield style={{ width: "1rem", height: "1rem" }} />
                Command Center
              </Link>
            )}
            <Link href="/dashboard/tournaments/create"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem",
                background: "#f59e0b", color: "#000", borderRadius: "0.625rem",
                fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
              <Plus style={{ width: "1rem", height: "1rem" }} />
              New Tournament
            </Link>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: Trophy,   label: "Total Tournaments", value: tournaments.length, color: "#f59e0b" },
          { icon: Activity, label: "Live Now",           value: live.length,        color: "#4ade80" },
          { icon: Users,    label: "Total Teams",        value: totalTeams,         color: "#60a5fa" },
          { icon: Radio,    label: "Matches Played",     value: totalMatches,       color: "#c084fc" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: "rgba(30,30,35,0.6)", borderRadius: "0.875rem", padding: "1.25rem",
              border: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <Icon style={{ width: "1.25rem", height: "1.25rem", color: s.color }} />
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── TOURNAMENTS LIST ── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#fff", margin: 0 }}>Your Tournaments</h2>
          <Link href="/dashboard/tournaments" style={{ color: "#9ca3af", fontSize: "0.875rem", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            View all <ArrowRight style={{ width: "0.875rem", height: "0.875rem" }} />
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div style={{ background: "rgba(30,30,35,0.6)", borderRadius: "0.875rem", padding: "3rem", textAlign: "center",
            border: "1px dashed rgba(255,255,255,0.1)" }}>
            <Trophy style={{ width: "3rem", height: "3rem", color: "#4b5563", margin: "0 auto 1rem" }} />
            <h3 style={{ color: "#fff", marginBottom: "0.5rem", fontWeight: 600 }}>No tournaments yet</h3>
            <p style={{ color: "#9ca3af", marginBottom: "1.25rem", fontSize: "0.875rem" }}>Create your first tournament to get started</p>
            <Link href="/dashboard/tournaments/create"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem",
                background: "#f59e0b", color: "#000", borderRadius: "0.625rem", fontWeight: 600, textDecoration: "none", fontSize: "0.875rem" }}>
              <Plus style={{ width: "1rem", height: "1rem" }} /> Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {tournaments.slice(0, 6).map(t => {
              const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.draft;
              return (
                <Link key={t.id} href={`/dashboard/tournaments/${t.id}`}
                  style={{ background: "rgba(30,30,35,0.6)", borderRadius: "0.75rem", padding: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)", textDecoration: "none", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: "1rem", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0, flex: 1 }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem",
                      background: status.bg, border: `1px solid ${status.border}`, display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Trophy style={{ width: "1.125rem", height: "1.125rem", color: status.color }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9375rem", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.25rem" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.125rem 0.5rem", background: status.bg, border: `1px solid ${status.border}`,
                          borderRadius: "0.375rem", fontSize: "0.7rem", color: status.color, fontWeight: 600, textTransform: "uppercase" }}>
                          {status.dot && <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%",
                            background: status.color, animation: "pulse 2s infinite" }} />}
                          {t.status}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {t._count?.teams || 0} teams · {t._count?.matches || 0} matches
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight style={{ width: "1rem", height: "1rem", color: "#6b7280", flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}