"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Tournament {
  id: string;
  name: string;
  status: string;
  slug?: string;
}

interface HealthItem {
  label: string;
  status: "good" | "warn" | "error" | "unknown";
  note?: string;
}

export function OrganizerCommandCenter() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/tournaments")
      .then(r => r.json())
      .then(d => {
        const list = d.tournaments ?? d ?? [];
        setTournaments(list);
        const live = list.find((t: Tournament) => t.status === "LIVE");
        const first = live ?? list[0];
        if (first) setSelected(first.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    fetch(`/api/dashboard/tournaments/${selected}/summary`)
      .then(r => r.json())
      .then(d => setSummary(d))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [selected]);

  const health: HealthItem[] = summary ? [
    { label: "Teams",       status: summary.teamCount > 0 ? "good" : "warn",    note: `${summary.teamCount ?? 0} registered`       },
    { label: "Stages",      status: summary.stageCount > 0 ? "good" : "warn",   note: `${summary.stageCount ?? 0} configured`      },
    { label: "Results",     status: summary.pendingResults > 0 ? "warn" : "good", note: `${summary.pendingResults ?? 0} pending`   },
    { label: "Discord",     status: summary.discordConnected ? "good" : "unknown", note: summary.discordConnected ? "Connected" : "Not configured" },
    { label: "Standings",   status: "good",    note: "Auto-calculated"            },
    { label: "Progression", status: summary.stageCount > 0 ? "good" : "unknown", note: summary.stageCount > 0 ? "Configured" : "Not set" },
  ] : [];

  const QUICK = [
    { label: "Add Match Result",   href: (id: string) => `/dashboard/tournaments/${id}/match-results`  },
    { label: "AI Screenshot",      href: (id: string) => `/dashboard/tournaments/${id}/ai-import`       },
    { label: "Manage Teams",       href: (id: string) => `/dashboard/tournaments/${id}/teams`           },
    { label: "Group Seeding",      href: (id: string) => `/dashboard/tournaments/${id}/stages`          },
    { label: "Standings",          href: (id: string) => `/dashboard/tournaments/${id}/standings`       },
    { label: "OBS Overlays",       href: (id: string) => `/dashboard/tournaments/${id}/overlays`        },
    { label: "Discord",            href: (id: string) => `/dashboard/tournaments/${id}/discord`         },
    { label: "Broadcast",          href: (id: string) => `/dashboard/tournaments/${id}/broadcast`       },
    { label: "Export",             href: (id: string) => `/dashboard/tournaments/${id}/export`          },
    { label: "Settings",           href: (id: string) => `/dashboard/tournaments/${id}/settings`        },
  ];

  const dotColor = (s: HealthItem["status"]) =>
    s === "good" ? "var(--success)" : s === "warn" ? "var(--warning)" : s === "error" ? "var(--danger)" : "var(--muted-light)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--black-rich)", paddingTop: "var(--nav-height)" }}>

      {/* Header */}
      <div style={{ background: "var(--charcoal-deep)", borderBottom: "1px solid var(--border)", padding: "24px 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-light)", marginBottom: "6px" }}>
                Organizer
              </p>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "28px", textTransform: "uppercase", letterSpacing: "0.02em", color: "var(--white)" }}>
                Command Center
              </h1>
            </div>
            {/* Tournament selector */}
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="ops-select"
              style={{ width: "280px" }}
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Loading...
            </p>
          </div>
        ) : !summary && !loading ? (
          <div style={{ padding: "60px", textAlign: "center", background: "var(--charcoal)", border: "1px solid var(--border)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
              No Tournament Selected
            </p>
            <Link href="/dashboard/tournaments/create" className="btn btn-primary btn-sm">
              Create Tournament
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: "16px" }}>

            {/* Col 1 — Current & Results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Current Match */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Current Match</span>
                  {summary?.currentMatch?.status === "LIVE" && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span className="live-dot" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--live)" }}>Live</span>
                    </div>
                  )}
                </div>
                <div className="control-module-body">
                  {summary?.currentMatch ? (
                    <>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "22px", textTransform: "uppercase", color: "var(--white)", marginBottom: "4px" }}>
                        Match {summary.currentMatch.matchNumber}
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)", marginBottom: "16px" }}>
                        {summary.currentMatch.map ?? "—"}
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Link href={`/dashboard/tournaments/${selected}/match-results`} className="btn btn-primary btn-sm">
                          Add Result
                        </Link>
                        <Link href={`/dashboard/tournaments/${selected}/standings`} className="btn btn-secondary btn-sm">
                          Standings
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: "13px", color: "var(--muted-light)" }}>No active match</p>
                  )}
                </div>
              </div>

              {/* Results Queue */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Results Queue</span>
                  {(summary?.pendingResults ?? 0) > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--warning)", border: "1px solid var(--warning)", padding: "2px 8px" }}>
                      {summary.pendingResults} Pending
                    </span>
                  )}
                </div>
                <div className="control-module-body">
                  {(summary?.pendingResults ?? 0) > 0 ? (
                    <>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                        {summary.pendingResults} result{summary.pendingResults !== 1 ? "s" : ""} awaiting review.
                      </p>
                      <Link href={`/dashboard/tournaments/${selected}/match-results`} className="btn btn-primary btn-sm">
                        Review Results
                      </Link>
                    </>
                  ) : (
                    <p style={{ fontSize: "13px", color: "var(--muted-light)" }}>All results verified</p>
                  )}
                </div>
              </div>

              {/* Next Match */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Next Match</span>
                </div>
                <div className="control-module-body">
                  {summary?.nextMatch ? (
                    <>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "20px", textTransform: "uppercase", color: "var(--white)", marginBottom: "4px" }}>
                        Match {summary.nextMatch.matchNumber}
                      </p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted-light)" }}>
                        {summary.nextMatch.map ?? "—"}
                      </p>
                    </>
                  ) : (
                    <p style={{ fontSize: "13px", color: "var(--muted-light)" }}>No upcoming match scheduled</p>
                  )}
                </div>
              </div>
            </div>

            {/* Col 2 — Standings & Activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Live Standings */}
              <div className="control-module" style={{ flex: 1 }}>
                <div className="control-module-header">
                  <span className="control-module-title">Live Standings</span>
                  <Link href={`/dashboard/tournaments/${selected}/standings`} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, color: "var(--accent)", textDecoration: "none", letterSpacing: "0.06em" }}>
                    Full →
                  </Link>
                </div>
                <div style={{ padding: "0" }}>
                  {(summary?.standings ?? []).length === 0 ? (
                    <div style={{ padding: "20px 16px" }}>
                      <p style={{ fontSize: "12px", color: "var(--muted-light)" }}>No results yet</p>
                    </div>
                  ) : (
                    (summary.standings as any[]).slice(0, 8).map((s: any, i: number) => (
                      <div key={s.teamId ?? i} style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 16px",
                        borderBottom: "1px solid var(--border-subtle)",
                        background: i === 0 ? "rgba(255,215,0,0.03)" : "transparent",
                      }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: i < 3 ? "var(--gold-bright)" : "var(--muted-light)", minWidth: "22px", fontWeight: 700 }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "var(--white)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.teamName}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--white)" }}>
                          {s.totalPoints ?? s.points ?? 0}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Recent Activity</span>
                </div>
                <div className="control-module-body">
                  {(summary?.recentActivity ?? []).length === 0 ? (
                    <p style={{ fontSize: "12px", color: "var(--muted-light)" }}>No recent activity</p>
                  ) : (
                    (summary.recentActivity as any[]).slice(0, 4).map((a: any, i: number) => (
                      <div key={i} style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: i < 3 ? "1px solid var(--border-subtle)" : "none" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{a.message ?? a.action}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted-light)", marginTop: "2px" }}>{a.time ?? a.createdAt}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Col 3 — Health + Quick Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Tournament Health */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Tournament Health</span>
                </div>
                <div style={{ padding: "8px 16px 16px" }}>
                  {health.map(h => (
                    <div key={h.label} className="health-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="health-dot" style={{ background: dotColor(h.status) }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--white)" }}>{h.label}</span>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--muted-light)" }}>{h.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="control-module">
                <div className="control-module-header">
                  <span className="control-module-title">Quick Actions</span>
                </div>
                <div style={{ padding: "8px" }}>
                  {QUICK.map(a => (
                    <Link
                      key={a.label}
                      href={selected ? a.href(selected) : "#"}
                      style={{
                        display: "block", padding: "9px 12px",
                        fontSize: "12px", fontWeight: 600,
                        color: "var(--text-secondary)",
                        textDecoration: "none",
                        borderBottom: "1px solid var(--border-subtle)",
                        transition: "color 0.15s",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizerCommandCenter;