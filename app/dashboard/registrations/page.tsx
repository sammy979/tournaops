"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Check, X, Clock, Link2, Copy, Share2, ExternalLink,
  Sparkles, Loader2, RefreshCw, User, Mail, MessageSquare, Filter
} from "lucide-react";

interface TournamentItem {
  id: string;
  name: string;
  slug: string;
}

interface RegistrationPlayer {
  name: string;
  ign?: string;
  role?: string;
}

interface RegistrationItem {
  id: string;
  teamName: string;
  teamTag?: string;
  contact?: string;
  players: RegistrationPlayer[];
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export default function RegistrationsPage() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [selected, setSelected] = useState("");
  const [selectedTournament, setSelectedTournament] = useState<TournamentItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [copied, setCopied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then(r => r.json())
      .then(data => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = tournaments.find(t => t.id === selected);
    if (t) setSelectedTournament(t);
  }, [selected, tournaments]);

  const loadRegistrations = useCallback((id: string, silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    fetch("/api/tournaments/" + id + "/registrations", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
        setLastRefresh(new Date());
      })
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) loadRegistrations(selected);
  }, [selected, loadRegistrations]);

  // Auto refresh every 8 seconds
  useEffect(() => {
    if (!autoRefresh || !selected) return;
    const interval = setInterval(() => loadRegistrations(selected, true), 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, selected, loadRegistrations]);

  const updateStatus = async (registrationId: string, action: "approve" | "reject") => {
    if (!selected) return;
    setProcessingId(registrationId);
    try {
      const res = await fetch("/api/tournaments/" + selected + "/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update registration");
        return;
      }
      setRegistrations(data.registrations || []);
    } catch {
      alert("Failed to update registration");
    } finally {
      setProcessingId("");
    }
  };

  const copyRegistrationLink = () => {
    if (!selectedTournament) return;
    const url = `${window.location.origin}/tournaments/${selectedTournament.slug}/register`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (!selectedTournament) return;
    const url = `${window.location.origin}/tournaments/${selectedTournament.slug}/register`;
    const text = `Register your team for ${selectedTournament.name}!`;
    if (navigator.share) {
      navigator.share({ title: selectedTournament.name, text, url });
    } else {
      copyRegistrationLink();
    }
  };

  const filtered = registrations.filter(r => filter === "all" || r.status === filter);
  const counts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === "pending").length,
    approved: registrations.filter(r => r.status === "approved").length,
    rejected: registrations.filter(r => r.status === "rejected").length,
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.625rem", background: "linear-gradient(135deg, #6366f1, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
            </div>
            Registrations
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.375rem" }}>
            Manage team registration requests • Auto-refreshes every 8s
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
            Last: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
            style={{
              padding: "0.5rem",
              background: autoRefresh ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${autoRefresh ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "0.5rem",
              color: autoRefresh ? "#4ade80" : "#9ca3af",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: "0.25rem",
            }}
          >
            <RefreshCw style={{ width: "0.875rem", height: "0.875rem", animation: autoRefresh ? "spin 3s linear infinite" : "none" }} />
          </button>
          <button
            onClick={() => loadRegistrations(selected)}
            style={{
              padding: "0.5rem 0.75rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "0.5rem",
              color: "#fff",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Tournament Selector + Share Link */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "1rem",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.75rem", alignItems: "end", flexWrap: "wrap" }} className="reg-header-grid">
          <div>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.375rem" }}>
              Tournament
            </label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "0.625rem 0.875rem",
                color: "#fff",
                fontSize: "0.875rem",
                outline: "none",
              }}
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id} style={{ background: "#111116" }}>{t.name}</option>
              ))}
            </select>
          </div>
          {selectedTournament && (
            <>
              <button
                onClick={copyRegistrationLink}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  background: copied ? "#4ade80" : "rgba(99,102,241,0.15)",
                  border: `1px solid ${copied ? "#4ade80" : "rgba(99,102,241,0.3)"}`,
                  color: copied ? "#000" : "#a5b4fc",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied
                  ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Copied!</>
                  : <><Copy style={{ width: "0.875rem", height: "0.875rem" }} />Copy Link</>
                }
              </button>
              <button
                onClick={shareLink}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  background: "#6366f1",
                  border: "none",
                  color: "#fff",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem", fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
                }}
              >
                <Share2 style={{ width: "0.875rem", height: "0.875rem" }} />
                Share
              </button>
            </>
          )}
        </div>

        {selectedTournament && (
          <div style={{
            marginTop: "0.875rem",
            padding: "0.625rem 0.875rem",
            background: "rgba(99,102,241,0.05)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
          }}>
            <Link2 style={{ width: "0.875rem", height: "0.875rem", color: "#818cf8", flexShrink: 0 }} />
            <code style={{ color: "#a5b4fc", flex: 1, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {typeof window !== "undefined" ? window.location.origin : ""}/tournaments/{selectedTournament.slug}/register
            </code>
            <a
              href={`/tournaments/${selectedTournament.slug}/register`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                color: "#818cf8",
                fontSize: "0.7rem",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Open <ExternalLink style={{ width: "0.7rem", height: "0.7rem" }} />
            </a>
          </div>
        )}
      </div>

      {/* Stats + Filters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}>
        {[
          { key: "all", label: "Total", count: counts.all, color: "#60a5fa", bg: "rgba(59,130,246,0.1)" },
          { key: "pending", label: "Pending", count: counts.pending, color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
          { key: "approved", label: "Approved", count: counts.approved, color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
          { key: "rejected", label: "Rejected", count: counts.rejected, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key as any)}
            style={{
              background: filter === s.key ? s.bg : "rgba(255,255,255,0.03)",
              border: filter === s.key ? `1px solid ${s.color}40` : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
              padding: "1rem",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: filter === s.key ? s.color : "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.375rem" }}>
              {s.label}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
              {s.count}
            </div>
          </button>
        ))}
      </div>

      {/* Registrations List */}
      {filtered.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.08)",
          borderRadius: "1rem",
          padding: "4rem 2rem",
          textAlign: "center",
        }}>
          <Users style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
            {registrations.length === 0 ? "No registrations yet" : `No ${filter} registrations`}
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            {registrations.length === 0
              ? "Share the registration link to receive team submissions"
              : `Switch filter above to see other statuses`
            }
          </p>
          {registrations.length === 0 && selectedTournament && (
            <button
              onClick={shareLink}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                background: "#6366f1", color: "#fff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontSize: "0.85rem", fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              <Share2 style={{ width: "1rem", height: "1rem" }} />
              Share Registration Link
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(reg => {
            const statusColors: Record<string, { bg: string; text: string; border: string }> = {
              pending: { bg: "rgba(245,158,11,0.1)", text: "#fbbf24", border: "rgba(245,158,11,0.25)" },
              approved: { bg: "rgba(34,197,94,0.1)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
              rejected: { bg: "rgba(239,68,68,0.1)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
            };
            const status = statusColors[reg.status] || statusColors.pending;

            return (
              <div
                key={reg.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                  padding: "1.25rem",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: "2.75rem", height: "2.75rem",
                      background: "linear-gradient(135deg, #6366f1, #a78bfa)",
                      borderRadius: "0.625rem",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 800, color: "#fff",
                      flexShrink: 0,
                    }}>
                      {reg.teamName[0]?.toUpperCase() || "?"}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{reg.teamName}</h3>
                        {reg.teamTag && (
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 800,
                            background: "rgba(99,102,241,0.15)",
                            color: "#a5b4fc",
                            padding: "0.125rem 0.5rem",
                            borderRadius: "0.25rem",
                          }}>
                            [{reg.teamTag}]
                          </span>
                        )}
                        <span style={{
                          fontSize: "0.6rem", fontWeight: 800,
                          background: status.bg,
                          color: status.text,
                          border: `1px solid ${status.border}`,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "9999px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          {reg.status}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem", fontSize: "0.7rem", color: "#6b7280", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <User style={{ width: "0.7rem", height: "0.7rem" }} />
                          {reg.players?.length || 0} players
                        </span>
                        {reg.contact && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <MessageSquare style={{ width: "0.7rem", height: "0.7rem" }} />
                            {reg.contact}
                          </span>
                        )}
                        {reg.createdAt && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <Clock style={{ width: "0.7rem", height: "0.7rem" }} />
                            {new Date(reg.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {reg.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button
                        onClick={() => updateStatus(reg.id, "approve")}
                        disabled={processingId === reg.id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.5rem 0.875rem",
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          color: "#4ade80",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem", fontWeight: 700,
                          cursor: processingId === reg.id ? "not-allowed" : "pointer",
                          opacity: processingId === reg.id ? 0.5 : 1,
                        }}
                      >
                        <Check style={{ width: "0.875rem", height: "0.875rem" }} />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(reg.id, "reject")}
                        disabled={processingId === reg.id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          padding: "0.5rem 0.875rem",
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.25)",
                          color: "#f87171",
                          borderRadius: "0.5rem",
                          fontSize: "0.75rem", fontWeight: 700,
                          cursor: processingId === reg.id ? "not-allowed" : "pointer",
                          opacity: processingId === reg.id ? 0.5 : 1,
                        }}
                      >
                        <X style={{ width: "0.875rem", height: "0.875rem" }} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {reg.players && reg.players.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {reg.players.map((p, i) => (
                      <div key={i} style={{
                        padding: "0.5rem 0.75rem",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                        borderRadius: "0.5rem",
                      }}>
                        <div style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600 }}>
                          {p.name || "Unnamed Player"}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.65rem", color: "#6b7280", marginTop: "0.125rem" }}>
                          {p.ign && <span>IGN: {p.ign}</span>}
                          {p.role && (
                            <span style={{
                              padding: "0.05rem 0.375rem",
                              borderRadius: "0.25rem",
                              background: "rgba(139,92,246,0.15)",
                              color: "#c084fc",
                              fontWeight: 700,
                            }}>
                              {p.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}