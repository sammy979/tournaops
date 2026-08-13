"use client";

import { useState } from "react";

interface Match {
  id: string;
  name: string;
  map: string;
  status: string;
  matchNumber: number | null;
  scheduledAt: string | null;
  startTime: string | null;
  endTime: string | null;
  stageId: string | null;
  groupId: string | null;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  matches: Match[];
}

interface Props {
  tournaments: Tournament[];
}

export default function ScheduleClient({ tournaments }: Props) {
  const [selectedTournament, setSelectedTournament] = useState<string>(
    tournaments[0]?.id || ""
  );
  const [view, setView] = useState<"list" | "calendar">("list");
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ scheduledAt: string; map: string }>({ scheduledAt: "", map: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeTournament = tournaments.find((t) => t.id === selectedTournament);
  const allMatches = activeTournament?.matches || [];
  const scheduledMatches = allMatches.filter((m) => m.scheduledAt);
  const unscheduledMatches = allMatches.filter((m) => !m.scheduledAt);

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setEditData({
      scheduledAt: match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : "",
      map: match.map || "",
    });
    setError(null); setSuccess(null);
  }

  function cancelEdit() {
    setEditingMatch(null);
    setEditData({ scheduledAt: "", map: "" });
  }

  async function saveMatch(matchId: string) {
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: editData.scheduledAt ? new Date(editData.scheduledAt).toISOString() : null,
          map: editData.map.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setSuccess("Match updated");
      setEditingMatch(null);
      setTimeout(() => window.location.reload(), 800);
    } catch { setError("Network error"); } finally { setSaving(false); }
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-NP", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function statusColor(s: string) {
    const st = s.toLowerCase();
    if (st === "completed") return "#D4AF37";
    if (st === "live") return "#22c55e";
    if (st === "cancelled") return "#ef4444";
    return "#8a8a8a";
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif", color: "#fff" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "0.35rem", fontWeight: "600" }}>
          DASHBOARD / SCHEDULE
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", color: "#fff", margin: 0 }}>
          Match Schedule
        </h1>
      </div>

      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#001a00", border: "1px solid #D4AF37", color: "#D4AF37", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#b8b8b8", marginBottom: "1rem" }}>
            NO TOURNAMENTS FOUND
          </div>
          <div style={{ color: "#b8b8b8", fontSize: "1rem" }}>
            Create a tournament first to manage its schedule.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#b8b8b8", letterSpacing: "0.15em", marginBottom: "0.4rem", fontWeight: "600" }}>
                TOURNAMENT
              </label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "0.6rem 0.75rem", cursor: "pointer" }}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.game})</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "0.6rem 1.5rem",
                    background: view === v ? "#D4AF37" : "#141414",
                    color: view === v ? "#0a0a0a" : "#b8b8b8",
                    border: "1px solid " + (view === v ? "#D4AF37" : "#2a2a2a"),
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {activeTournament && (
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", gap: "2rem", flexWrap: "wrap", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
              <span style={{ color: "#b8b8b8" }}>
                STATUS: <span style={{ color: "#D4AF37" }}>{activeTournament.status.toUpperCase()}</span>
              </span>
              <span style={{ color: "#b8b8b8" }}>
                TOTAL: <span style={{ color: "#fff" }}>{allMatches.length}</span>
              </span>
              <span style={{ color: "#b8b8b8" }}>
                SCHEDULED: <span style={{ color: "#22c55e" }}>{scheduledMatches.length}</span>
              </span>
              <span style={{ color: "#b8b8b8" }}>
                UNSCHEDULED: <span style={{ color: "#ef4444" }}>{unscheduledMatches.length}</span>
              </span>
            </div>
          )}

          {view === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {allMatches.length === 0 ? (
                <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#b8b8b8" }}>
                  No matches yet. Create matches from the tournament editor.
                </div>
              ) : (
                allMatches.map((match) => (
                  <div key={match.id} style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "1rem 1.25rem" }}>
                    {editingMatch === match.id ? (
                      <div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#D4AF37", marginBottom: "0.75rem", fontWeight: "600" }}>
                          EDITING {match.name.toUpperCase()}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "0.75rem" }}>
                          <div>
                            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#b8b8b8", marginBottom: "0.3rem" }}>DATE & TIME</label>
                            <input
                              type="datetime-local"
                              value={editData.scheduledAt}
                              onChange={(e) => setEditData((p) => ({ ...p, scheduledAt: e.target.value }))}
                              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "0.5rem 0.6rem", boxSizing: "border-box" }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#b8b8b8", marginBottom: "0.3rem" }}>MAP</label>
                            <input
                              type="text"
                              value={editData.map}
                              onChange={(e) => setEditData((p) => ({ ...p, map: e.target.value }))}
                              placeholder="e.g. Erangel, Miramar..."
                              style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.85rem", padding: "0.5rem 0.6rem", boxSizing: "border-box" }}
                            />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => saveMatch(match.id)} disabled={saving} style={{ padding: "0.5rem 1.25rem", background: "#D4AF37", color: "#0a0a0a", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                            {saving ? "SAVING..." : "SAVE"}
                          </button>
                          <button onClick={cancelEdit} style={{ padding: "0.5rem 1.25rem", background: "transparent", color: "#b8b8b8", border: "1px solid #2a2a2a", fontFamily: "var(--font-mono)", fontSize: "0.8rem", cursor: "pointer" }}>
                            CANCEL
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                        <div style={{ flex: 1, minWidth: "200px" }}>
                          <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.05rem", fontWeight: "700", color: "#fff", textTransform: "uppercase" }}>
                            {match.name}
                          </div>
                          {match.matchNumber !== null && (
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#8a8a8a", marginTop: "0.15rem" }}>
                              MATCH #{match.matchNumber}
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                          {match.map && (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#b8b8b8" }}>
                              📍 {match.map}
                            </span>
                          )}
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: match.scheduledAt ? "#fff" : "#8a8a8a" }}>
                            🕐 {formatDate(match.scheduledAt)}
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: statusColor(match.status), border: "1px solid " + statusColor(match.status), padding: "0.2rem 0.5rem", fontWeight: "600" }}>
                            {match.status.toUpperCase()}
                          </span>
                          <button onClick={() => startEdit(match)} style={{ padding: "0.35rem 0.85rem", background: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", fontFamily: "var(--font-mono)", fontSize: "0.7rem", cursor: "pointer", fontWeight: "700" }}>
                            EDIT
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {view === "calendar" && (
            <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414", fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "#b8b8b8" }}>
              {scheduledMatches.length === 0 ? "No scheduled matches yet." : `${scheduledMatches.length} matches scheduled — calendar view coming soon`}
            </div>
          )}
        </>
      )}
    </div>
  );
}