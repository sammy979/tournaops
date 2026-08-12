"use client";

import { useState, useEffect, useCallback } from "react";
import AdminShell from "@/components/ui/AdminShell";

interface SystemErrorRow {
  id:              string;
  fingerprint:     string;
  severity:        string;
  route:           string | null;
  errorType:       string | null;
  message:         string;
  requestId:       string | null;
  userId:          string | null;
  tournamentId:    string | null;
  occurrenceCount: number;
  firstSeenAt:     string;
  lastSeenAt:      string;
  resolved:        boolean;
  resolvedAt:      string | null;
  resolvedBy:      string | null;
}

export default function AdminErrorLogsPage() {
  const [errors,       setErrors]       = useState<SystemErrorRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sevFilter,    setSevFilter]    = useState<"ALL" | "CRITICAL" | "ERROR" | "WARN" | "INFO">("ALL");
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [search,       setSearch]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams();
      if (sevFilter !== "ALL") params.set("severity", sevFilter);
      params.set("resolved", String(showResolved));
      const res = await fetch(`/api/admin/system-errors?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setErrors(data.errors || []);
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to load errors");
    } finally {
      setLoading(false);
    }
  }, [sevFilter, showResolved]);

  useEffect(() => { load(); }, [load]);

  const filtered = errors.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.message.toLowerCase().includes(q) ||
      (e.errorType || "").toLowerCase().includes(q) ||
      (e.route || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    critical: errors.filter((e) => e.severity === "CRITICAL" && !e.resolved).length,
    error:    errors.filter((e) => e.severity === "ERROR"    && !e.resolved).length,
    warn:     errors.filter((e) => e.severity === "WARN"     && !e.resolved).length,
    info:     errors.filter((e) => e.severity === "INFO"     && !e.resolved).length,
  };

  const sevColor = (s: string) => {
    switch (s) {
      case "CRITICAL": return "var(--red)";
      case "ERROR":    return "var(--red)";
      case "WARN":     return "var(--amber)";
      case "INFO":     return "var(--blue)";
      default:         return "var(--white-40)";
    }
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <AdminShell>
      <div style={{ padding: "24px", maxWidth: "1280px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div className="section-label">Admin</div>
            <h1 className="text-display" style={{ marginBottom: "6px" }}>Error Logs</h1>
            <p style={{ color: "var(--white-40)", fontSize: "0.85rem" }}>
              Real errors from the SystemError log. Grouped by fingerprint.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setShowResolved((v) => !v)}
              className="btn-secondary"
              style={{ fontSize: "0.72rem", padding: "7px 14px" }}
            >
              {showResolved ? "Show Unresolved" : "Show Resolved"}
            </button>
            <button
              onClick={load}
              className="btn-gold"
              style={{ fontSize: "0.72rem", padding: "7px 14px" }}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}>
          <Counter label="Critical" value={counts.critical} color="var(--red)"    />
          <Counter label="Error"    value={counts.error}    color="var(--red)"    />
          <Counter label="Warning"  value={counts.warn}     color="var(--amber)"  />
          <Counter label="Info"     value={counts.info}     color="var(--blue)"   />
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search message, route, error type..."
            style={{
              flex: 1,
              minWidth: "220px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: "0.85rem",
              outline: "none",
              fontFamily: "Barlow, sans-serif",
            }}
          />
          {(["ALL", "CRITICAL", "ERROR", "WARN", "INFO"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSevFilter(s)}
              style={{
                padding: "6px 12px",
                border: "1px solid " + (sevFilter === s ? "var(--gold)" : "var(--border-2)"),
                background: sevFilter === s ? "var(--gold)" : "transparent",
                color: sevFilter === s ? "var(--black)" : "var(--white-70)",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >{s === "ALL" ? "All" : s}</button>
          ))}
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div style={{
            padding: "12px 16px",
            background: "var(--red-dim)",
            border: "1px solid var(--red)",
            color: "var(--red)",
            marginBottom: "16px",
          }}>{errorMessage}</div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--white-40)", fontSize: "0.85rem" }}>
            Loading errors...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !errorMessage && filtered.length === 0 && (
          <div style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--white-40)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "6px",
            }}>No Errors</div>
            <p style={{ fontSize: "0.82rem" }}>No errors match your filters. System is healthy.</p>
          </div>
        )}

        {/* ERROR LIST */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gap: "8px" }}>
            {filtered.map((err) => {
              const expanded = expandedId === err.id;
              const color = sevColor(err.severity);
              return (
                <div key={err.id} style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${color}`,
                  opacity: err.resolved ? 0.55 : 1,
                }}>
                  <div
                    onClick={() => setExpandedId(expanded ? null : err.id)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{
                          padding: "2px 8px",
                          background: color === "var(--red)"   ? "var(--red-dim)"
                                    : color === "var(--amber)" ? "var(--amber-dim)"
                                    : color === "var(--blue)"  ? "var(--blue-dim)"
                                    : "var(--surface-2)",
                          border: `1px solid ${color}`,
                          color,
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 700,
                          fontSize: "0.65rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                        }}>{err.severity}</span>
                        {err.errorType && (
                          <code style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "0.72rem",
                            color: "var(--white-70)",
                            background: "var(--surface-2)",
                            padding: "2px 6px",
                            border: "1px solid var(--border)",
                          }}>{err.errorType}</code>
                        )}
                        {err.route && (
                          <span style={{
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "0.72rem",
                            color: "var(--white-40)",
                          }}>{err.route}</span>
                        )}
                        {err.resolved && (
                          <span style={{
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "0.65rem",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: "var(--green)",
                          }}>Resolved</span>
                        )}
                      </div>
                      <p style={{
                        color: "var(--white)",
                        fontSize: "0.88rem",
                        fontFamily: "Barlow, sans-serif",
                        margin: 0,
                        wordBreak: "break-word",
                      }}>{err.message}</p>
                      <div style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "6px",
                        color: "var(--white-40)",
                        fontSize: "0.72rem",
                        fontFamily: "JetBrains Mono, monospace",
                        flexWrap: "wrap",
                      }}>
                        <span>x{err.occurrenceCount}</span>
                        <span>first: {timeAgo(err.firstSeenAt)}</span>
                        <span>last: {timeAgo(err.lastSeenAt)}</span>
                      </div>
                    </div>
                    <div style={{
                      color: "var(--white-40)",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: "0.72rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}>
                      {expanded ? "Collapse" : "Expand"}
                    </div>
                  </div>

                  {expanded && (
                    <div style={{
                      padding: "0 16px 14px",
                      borderTop: "1px solid var(--border)",
                      marginTop: 0,
                      paddingTop: "12px",
                    }}>
                      <DetailRow label="Fingerprint" value={err.fingerprint} mono />
                      {err.requestId    && <DetailRow label="Request ID"    value={err.requestId}    mono />}
                      {err.userId       && <DetailRow label="User ID"       value={err.userId}       mono />}
                      {err.tournamentId && <DetailRow label="Tournament ID" value={err.tournamentId} mono />}
                      <DetailRow label="First Seen" value={new Date(err.firstSeenAt).toLocaleString()} />
                      <DetailRow label="Last Seen"  value={new Date(err.lastSeenAt).toLocaleString()} />
                      {err.resolved && err.resolvedAt && (
                        <DetailRow label="Resolved At" value={new Date(err.resolvedAt).toLocaleString()} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Counter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderTop: `3px solid ${color}`,
      padding: "14px 16px",
      textAlign: "left",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>{label}</div>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 900,
        fontSize: "1.8rem",
        color,
        lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "6px", fontSize: "0.78rem" }}>
      <div style={{
        color: "var(--white-40)",
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        minWidth: "120px",
      }}>{label}</div>
      <div style={{
        color: "var(--white-70)",
        fontFamily: mono ? "JetBrains Mono, monospace" : "Barlow, sans-serif",
        wordBreak: "break-all",
      }}>{value}</div>
    </div>
  );
}