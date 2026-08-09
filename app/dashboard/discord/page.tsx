"use client";
import { useDialog } from "@/lib/use-confirm";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Zap, Check, Users, X, ArrowRight, Loader2, Bot, AlertCircle } from "lucide-react";
import { Tournament } from "@/types/tournament";

interface PendingImport {
  id: string;
  discordGuildName: string;
  discordChannelName: string;
  discordUsername: string;
  parseResult: {
    slots: Array<{ slotNumber: number; teamName: string }>;
    totalDetected: number;
    confidence: number;
    format: string;
  };
  receivedAt: string;
}

export default function DiscordPage() {
  const dialog = useDialog();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImport, setSelectedImport] = useState<PendingImport | null>(null);
  const [importTarget, setImportTarget] = useState("");
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/discord/pending", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPendingImports(data.pendingImports || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tournaments");
        if (res.ok) {
          const data = await res.json();
          const list = data.tournaments || [];
          setTournaments(list);
          if (list.length > 0) setImportTarget(list[0].id);
        }
      } catch {}
      await fetchPending();
      setLoading(false);
    })();
    const interval = setInterval(fetchPending, 8000);
    return () => clearInterval(interval);
  }, [fetchPending]);

  const handleImport = async () => {
    if (!selectedImport || !importTarget) return;
    setImporting(true);
    setImportSuccess(false);

    try {
      const teamsPayload = selectedImport.parseResult.slots.map((slot) => ({
        name: slot.teamName,
        tag: slot.teamName.substring(0, 4).toUpperCase(),
        seed: slot.slotNumber,
        players: Array.from({ length: 4 }, (_, i) => ({
          name: `Player ${i + 1}`,
          ign: "",
          role: (["IGL", "Fragger", "Support", "Entry"])[i],
        })),
      }));

      const res = await fetch(`/api/tournaments/${importTarget}/teams/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: teamsPayload }),
      });

      if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Bulk import failed (status " + res.status + ")");
        }
        const importResult = await res.json();
        console.log("Import result:", importResult);

      await fetch(`/api/discord/pending?id=${selectedImport.id}`, { method: "DELETE" });

      setImportSuccess(true);
      setSelectedImport(null);
      setPendingImports((prev) => prev.filter((p) => p.id !== selectedImport.id));
    } catch {
      void dialog.alert({ title: "Import Failed", description: "Import failed. Please try again.", variant: "danger" });
    } finally {
      setImporting(false);
    }
  };

  const dismissImport = async (importId: string) => {
    try {
      await fetch(`/api/discord/pending?id=${importId}`, { method: "DELETE" });
      setPendingImports((prev) => prev.filter((p) => p.id !== importId));
      if (selectedImport?.id === importId) setSelectedImport(null);
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
        <Loader2 style={{ width: "1.5rem", height: "1.5rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading Discord imports...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
        <div style={{
          width: "3rem", height: "3rem",
          borderRadius: "0.875rem",
          background: "linear-gradient(135deg, #5865F2, #7289DA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 30px rgba(88,101,242,0.35)",
        }}>
          <MessageSquare style={{ width: "1.5rem", height: "1.5rem", color: "#fff" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
            Discord Integration
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Import team rosters from Discord messages
          </p>
        </div>
        {pendingImports.length > 0 && (
          <div style={{
            marginLeft: "auto",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "9999px",
            padding: "0.375rem 0.875rem",
            display: "flex", alignItems: "center", gap: "0.375rem",
            fontSize: "0.8rem", fontWeight: 700, color: "#f59e0b",
          }}>
            <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite" }} />
            {pendingImports.length} pending
          </div>
        )}
      </div>

      {/* Success Banner */}
      {importSuccess && (
        <div style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "0.75rem",
          padding: "0.875rem 1.25rem",
          marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.625rem",
          fontSize: "0.875rem", color: "#4ade80",
        }}>
          <Check style={{ width: "1rem", height: "1rem" }} />
          Teams imported successfully! Check your tournament&apos;s team list.
        </div>
      )}

      {/* How It Works */}
      <div style={{
        background: "linear-gradient(135deg, rgba(88,101,242,0.08), rgba(114,137,218,0.04))",
        border: "1px solid rgba(88,101,242,0.2)",
        borderRadius: "1rem",
        padding: "1.25rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Bot style={{ width: "1.125rem", height: "1.125rem", color: "#7289DA" }} />
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>How It Works</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { step: "1", title: "Bot Receives Message", desc: "Your Discord bot reads team registration messages in your channel" },
            { step: "2", title: "AI Parses Teams", desc: "AI extracts team names, slots, and roster data from raw text" },
            { step: "3", title: "Review Here", desc: "Pending imports appear below — review before importing" },
            { step: "4", title: "One-Click Import", desc: "Select a tournament and import all teams instantly" },
          ].map((item) => (
            <div key={item.step} style={{
              display: "flex", gap: "0.625rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "0.625rem",
              padding: "0.75rem",
            }}>
              <div style={{
                width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                background: "rgba(88,101,242,0.2)", color: "#7289DA",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
              }}>{item.step}</div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff", marginBottom: "0.2rem" }}>{item.title}</div>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Imports */}
      <div style={{ display: "grid", gridTemplateColumns: selectedImport ? "1fr 380px" : "1fr", gap: "1.5rem" }} className="discord-grid">

        {/* Import List */}
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>
            Pending Imports ({pendingImports.length})
          </div>

          {pendingImports.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "4rem 2rem",
              textAlign: "center",
            }}>
              <MessageSquare style={{ width: "2.5rem", height: "2.5rem", color: "#374151", margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                No Pending Imports
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", lineHeight: 1.5 }}>
                When your Discord bot receives team registration messages,<br />
                they will appear here for review.
              </p>
              <div style={{
                marginTop: "1.25rem",
                display: "inline-flex", alignItems: "center", gap: "0.375rem",
                fontSize: "0.7rem", color: "#9ca3af",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.875rem",
              }}>
                <Zap style={{ width: "0.75rem", height: "0.75rem", color: "#f59e0b" }} />
                Auto-refreshes every 8 seconds
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pendingImports.map((imp) => {
                const isSelected = selectedImport?.id === imp.id;
                const confidence = imp.parseResult?.confidence ?? 0;
                const teamCount = imp.parseResult?.slots?.length ?? 0;
                const confidenceColor = confidence >= 0.8 ? "#4ade80" : confidence >= 0.6 ? "#f59e0b" : "#f87171";

                return (
                  <div
                    key={imp.id}
                    onClick={() => setSelectedImport(isSelected ? null : imp)}
                    style={{
                      background: isSelected ? "rgba(88,101,242,0.08)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isSelected ? "rgba(88,101,242,0.35)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "0.875rem",
                      padding: "1rem 1.25rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#fff" }}>
                            #{imp.discordGuildName}
                          </span>
                          <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>›</span>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>#{imp.discordChannelName}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.625rem" }}>
                          from <strong style={{ color: "#9ca3af" }}>{imp.discordUsername}</strong>
                          {" · "}{new Date(imp.receivedAt).toLocaleString()}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 700,
                            padding: "0.2rem 0.625rem", borderRadius: "9999px",
                            background: "rgba(59,130,246,0.1)", color: "#60a5fa",
                            border: "1px solid rgba(59,130,246,0.2)",
                          }}>
                            <Users style={{ width: "0.625rem", height: "0.625rem", display: "inline", marginRight: "0.25rem" }} />
                            {teamCount} teams
                          </span>
                          <span style={{
                            fontSize: "0.7rem", fontWeight: 700,
                            padding: "0.2rem 0.625rem", borderRadius: "9999px",
                            background: `rgba(${confidence >= 0.8 ? "34,197,94" : confidence >= 0.6 ? "245,158,11" : "239,68,68"},0.1)`,
                            color: confidenceColor,
                            border: `1px solid rgba(${confidence >= 0.8 ? "34,197,94" : confidence >= 0.6 ? "245,158,11" : "239,68,68"},0.2)`,
                          }}>
                            {Math.round(confidence * 100)}% confidence
                          </span>
                          {imp.parseResult?.format && (
                            <span style={{
                              fontSize: "0.7rem", fontWeight: 600,
                              padding: "0.2rem 0.625rem", borderRadius: "9999px",
                              background: "rgba(168,85,247,0.1)", color: "#c084fc",
                              border: "1px solid rgba(168,85,247,0.2)",
                            }}>
                              {imp.parseResult.format}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.375rem", flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); dismissImport(imp.id); }}
                          style={{
                            width: "1.75rem", height: "1.75rem",
                            borderRadius: "0.375rem",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          title="Dismiss"
                        >
                          <X style={{ width: "0.75rem", height: "0.75rem" }} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedImport(isSelected ? null : imp); }}
                          style={{
                            width: "1.75rem", height: "1.75rem",
                            borderRadius: "0.375rem",
                            background: isSelected ? "rgba(88,101,242,0.2)" : "rgba(255,255,255,0.05)",
                            border: `1px solid ${isSelected ? "rgba(88,101,242,0.4)" : "rgba(255,255,255,0.1)"}`,
                            color: isSelected ? "#7289DA" : "#9ca3af",
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                          title="Review"
                        >
                          <ArrowRight style={{ width: "0.75rem", height: "0.75rem" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Import Panel */}
        {selectedImport && (
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "1.25rem",
            height: "fit-content",
            position: "sticky",
            top: "1rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>Review Import</h3>
              <button
                onClick={() => setSelectedImport(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.375rem",
                  color: "#9ca3af", cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X style={{ width: "0.875rem", height: "0.875rem" }} />
              </button>
            </div>

            {/* Team Preview */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                Teams Detected ({selectedImport.parseResult?.slots?.length ?? 0})
              </div>
              <div style={{
                maxHeight: "220px",
                overflowY: "auto",
                display: "flex", flexDirection: "column", gap: "0.375rem",
              }}>
                {(selectedImport.parseResult?.slots || []).map((slot) => (
                  <div key={slot.slotNumber} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 0.625rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <span style={{
                      width: "1.5rem", height: "1.5rem",
                      borderRadius: "0.25rem",
                      background: "rgba(88,101,242,0.15)",
                      color: "#7289DA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 800, flexShrink: 0,
                    }}>{slot.slotNumber}</span>
                    <span style={{ fontSize: "0.8rem", color: "#e5e7eb", fontWeight: 600 }}>{slot.teamName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Tournament */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                Import Into
              </label>
              {tournaments.length === 0 ? (
                <div style={{
                  padding: "0.75rem",
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "0.5rem",
                  display: "flex", gap: "0.5rem", alignItems: "center",
                  fontSize: "0.75rem", color: "#f87171",
                }}>
                  <AlertCircle style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
                  No tournaments found. Create one first.
                </div>
              ) : (
                <select
                  value={importTarget}
                  onChange={(e) => setImportTarget(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.625rem",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: "#111116" }}>
                      {t.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Confidence Warning */}
            {selectedImport.parseResult?.confidence < 0.7 && (
              <div style={{
                padding: "0.625rem 0.75rem",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                display: "flex", gap: "0.5rem", alignItems: "flex-start",
                fontSize: "0.72rem", color: "#f59e0b", lineHeight: 1.4,
              }}>
                <AlertCircle style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0, marginTop: "0.1rem" }} />
                Low confidence parse. Review team names carefully before importing.
              </div>
            )}

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={importing || !importTarget || tournaments.length === 0}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: importing ? "rgba(34,197,94,0.3)" : "linear-gradient(135deg, #4ade80, #22c55e)",
                border: "none",
                borderRadius: "0.625rem",
                color: importing ? "#9ca3af" : "#000",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: importing || !importTarget ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "all 0.15s",
              }}
            >
              {importing ? (
                <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Importing...</>
              ) : (
                <><Check style={{ width: "1rem", height: "1rem" }} />Import {selectedImport.parseResult?.slots?.length ?? 0} Teams</>
              )}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) {
          .discord-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}