"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useDialog } from "@/lib/use-confirm";
import {
  Plus, Trophy, Users, Trash2, Search, Eye,
  Edit, Grid3x3, List, Filter, Calendar, Target,
  Loader2, ArrowUpRight
} from "lucide-react";

interface Tournament {
  id: string;
  slug: string;
  name: string;
  status: string;
  format?: string;
  prizePool?: string;
  maxTeams: number;
  createdAt?: string;
  bannerImage?: string;
  _count?: {
    teams: number;
    rounds: number;
    matches?: number;
  };
}

export default function TournamentsPage() {
  const dialog = useDialog();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "draft" | "registration" | "live" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tournaments", { cache: "no-store" });
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = tournaments
    .filter(t => {
      if (!t?.name) return false;
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || t.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return a.name.localeCompare(b.name);
    });

  const handleDelete = async (id: string, name: string) => {
    const ok = await dialog.confirm({
      title: `Delete "${name}"?`,
      description: "All teams, matches, and results for this tournament will be permanently deleted. This cannot be undone.",
      confirmLabel: "Delete tournament",
      variant: "danger",
    });
    if (!ok) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
      if (res.ok) await loadData();
      else alert("Failed to delete tournament");
    } catch {
      alert("Failed to delete tournament");
    }
    setDeleting(null);
  };

  const statusColor: Record<string, { bg: string; text: string; border: string }> = {
    live: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
    draft: { bg: "rgba(107,114,128,0.1)", text: "#9ca3af", border: "rgba(107,114,128,0.25)" },
    registration: { bg: "rgba(59,130,246,0.1)", text: "#60a5fa", border: "rgba(59,130,246,0.25)" },
    completed: { bg: "rgba(168,85,247,0.1)", text: "#c084fc", border: "rgba(168,85,247,0.25)" },
    cancelled: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  };

  const counts = {
    all: tournaments.length,
    draft: tournaments.filter(t => t.status === "draft").length,
    registration: tournaments.filter(t => t.status === "registration").length,
    live: tournaments.filter(t => t.status === "live").length,
    completed: tournaments.filter(t => t.status === "completed").length,
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.875rem", fontWeight: 800, color: "#fff" }}>Tournaments</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage all your tournaments in one place
          </p>
        </div>
        <Link
          href="/dashboard/tournaments/create"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "#f59e0b", color: "#000",
            padding: "0.625rem 1.25rem",
            borderRadius: "0.75rem",
            fontWeight: 700, fontSize: "0.875rem",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#fbbf24"}
          onMouseLeave={e => e.currentTarget.style.background = "#f59e0b"}
        >
          <Plus style={{ width: "1rem", height: "1rem" }} />New Tournament
        </Link>
      </div>

      {tournaments.length > 0 && (
        <>
          {/* Filters Bar */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            padding: "0.75rem",
            marginBottom: "1.25rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            alignItems: "center",
          }}>

            {/* Search */}
            <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
              <Search style={{
                position: "absolute", left: "0.75rem", top: "50%",
                transform: "translateY(-50%)",
                width: "1rem", height: "1rem", color: "#6b7280",
              }} />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "0.625rem",
                  padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Status Filters */}
            <div style={{ display: "flex", gap: "0.25rem", padding: "0.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.06)" }}>
              {(["all", "draft", "registration", "live", "completed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: filter === f ? "rgba(245,158,11,0.15)" : "transparent",
                    color: filter === f ? "#f59e0b" : "#9ca3af",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  {f}
                  <span style={{
                    fontSize: "0.65rem",
                    background: filter === f ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.05)",
                    padding: "0.05rem 0.4rem",
                    borderRadius: "9999px",
                    fontWeight: 700,
                  }}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "0.625rem",
                padding: "0.5rem 0.75rem",
                color: "#d1d5db",
                fontSize: "0.75rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>

            {/* View Toggle */}
            <div style={{ display: "flex", gap: "0.25rem", padding: "0.25rem", background: "rgba(255,255,255,0.03)", borderRadius: "0.625rem", border: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={() => setView("grid")}
                style={{
                  padding: "0.375rem",
                  borderRadius: "0.375rem",
                  background: view === "grid" ? "rgba(245,158,11,0.15)" : "transparent",
                  color: view === "grid" ? "#f59e0b" : "#6b7280",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                title="Grid view"
              >
                <Grid3x3 style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>
              <button
                onClick={() => setView("list")}
                style={{
                  padding: "0.375rem",
                  borderRadius: "0.375rem",
                  background: view === "list" ? "rgba(245,158,11,0.15)" : "transparent",
                  color: view === "list" ? "#f59e0b" : "#6b7280",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                title="List view"
              >
                <List style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {filtered.length === 0 && (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.08)",
          borderRadius: "1.5rem",
          padding: "4rem 2rem",
          textAlign: "center",
        }}>
          <div style={{
            width: "4rem", height: "4rem",
            background: "rgba(245,158,11,0.08)",
            borderRadius: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}>
            <Trophy style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />
          </div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            {tournaments.length === 0 ? "No tournaments yet" : "No matches found"}
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
            {tournaments.length === 0
              ? "Create your first PUBG Mobile tournament and start managing teams, matches, and standings."
              : "Try adjusting your search or filter to find what you are looking for."
            }
          </p>
          {tournaments.length === 0 && (
            <Link
              href="/dashboard/tournaments/create"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "#f59e0b", color: "#000",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: 700, fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              <Plus style={{ width: "1rem", height: "1rem" }} />
              Create Tournament
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {filtered.length > 0 && view === "grid" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1rem",
        }}>
          {filtered.map(t => {
            const status = statusColor[t.status] || statusColor.draft;
            return (
              <div
                key={t.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  transition: "all 0.2s ease",
                  opacity: deleting === t.id ? 0.5 : 1,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Banner */}
                {t.bannerImage && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "5rem",
                    backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.4), rgba(10,10,15,1)), url(${t.bannerImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.4,
                    zIndex: 0,
                  }} />
                )}

                {/* Content */}
                <div style={{ position: "relative", zIndex: 1 }}>

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: "2.5rem", height: "2.5rem",
                        background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))",
                        borderRadius: "0.625rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid rgba(245,158,11,0.2)",
                        flexShrink: 0,
                      }}>
                        <Trophy style={{ width: "1.125rem", height: "1.125rem", color: "#f59e0b" }} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.name}
                        </h3>
                        <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.2rem 0.625rem",
                      borderRadius: "9999px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: status.bg,
                      color: status.text,
                      border: `1px solid ${status.border}`,
                      flexShrink: 0,
                    }}>
                      {t.status === "live" && (
                        <span style={{ width: "0.35rem", height: "0.35rem", borderRadius: "50%", background: "#4ade80" }} />
                      )}
                      {t.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem", marginBottom: "1rem" }}>
                    {[
                      { icon: Users, label: "Teams", value: t._count?.teams || 0, color: "#60a5fa" },
                      { icon: Target, label: "Matches", value: t._count?.matches || 0, color: "#c084fc" },
                      { icon: Calendar, label: "Rounds", value: t._count?.rounds || 0, color: "#4ade80" },
                    ].map(stat => {
                      const Icon = stat.icon;
                      return (
                        <div key={stat.label} style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          background: "rgba(255,255,255,0.03)",
                          textAlign: "center",
                        }}>
                          <Icon style={{ width: "0.75rem", height: "0.75rem", color: stat.color, margin: "0 auto 0.25rem" }} />
                          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.875rem" }}>{stat.value}</div>
                          <div style={{ color: "#4b5563", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {stat.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Prize Pool */}
                  {t.prizePool && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.375rem",
                      padding: "0.5rem 0.75rem",
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.15)",
                      borderRadius: "0.5rem",
                      marginBottom: "1rem",
                    }}>
                      <Trophy style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b", flexShrink: 0 }} />
                      <span style={{ color: "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>
                        Prize: {t.prizePool}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.375rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link
                      href={`/dashboard/tournaments/${t.id}`}
                      style={{
                        flex: 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                        background: "#f59e0b", color: "#000",
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        fontWeight: 700, fontSize: "0.75rem",
                        textDecoration: "none",
                      }}
                    >
                      <Edit style={{ width: "0.875rem", height: "0.875rem" }} />
                      Manage
                    </Link>
                    {t.slug && (
                      <Link
                        href={`/tournaments/${t.slug}`}
                        target="_blank"
                        title="View public page"
                        style={{
                          padding: "0.5rem",
                          borderRadius: "0.5rem",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Eye style={{ width: "0.875rem", height: "0.875rem" }} />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      disabled={deleting === t.id}
                      title="Delete"
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#6b7280",
                        cursor: deleting === t.id ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => {
                        if (deleting !== t.id) {
                          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                          e.currentTarget.style.color = "#f87171";
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#6b7280";
                      }}
                    >
                      {deleting === t.id
                        ? <Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} />
                        : <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {filtered.length > 0 && view === "list" && (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}>
          {filtered.map((t, idx) => {
            const status = statusColor[t.status] || statusColor.draft;
            return (
              <Link
                key={t.id}
                href={`/dashboard/tournaments/${t.id}`}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem",
                  textDecoration: "none",
                  borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{
                  width: "2.5rem", height: "2.5rem",
                  background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.1))",
                  borderRadius: "0.625rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid rgba(245,158,11,0.2)",
                  flexShrink: 0,
                }}>
                  <Trophy style={{ width: "1.125rem", height: "1.125rem", color: "#f59e0b" }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.name}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", fontSize: "0.7rem", color: "#6b7280" }}>
                    <span>{t._count?.teams || 0} teams</span>
                    <span>•</span>
                    <span>{t._count?.matches || 0} matches</span>
                    {t.prizePool && (<><span>•</span><span style={{ color: "#fbbf24" }}>{t.prizePool}</span></>)}
                  </div>
                </div>

                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.25rem",
                  padding: "0.2rem 0.625rem",
                  borderRadius: "9999px",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  background: status.bg,
                  color: status.text,
                  border: `1px solid ${status.border}`,
                }}>
                  {t.status === "live" && (
                    <span style={{ width: "0.35rem", height: "0.35rem", borderRadius: "50%", background: "#4ade80" }} />
                  )}
                  {t.status}
                </span>

                <ArrowUpRight style={{ width: "1rem", height: "1rem", color: "#4b5563", flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}