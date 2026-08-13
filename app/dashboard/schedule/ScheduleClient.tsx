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

interface Props { tournaments: Tournament[]; }

export default function ScheduleClient({ tournaments }: Props) {
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id || "");
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editData, setEditData] = useState({ scheduledAt: "", map: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeTournament = tournaments.find((t) => t.id === selectedTournament);
  const allMatches = activeTournament?.matches || [];
  const scheduledCount = allMatches.filter((m) => m.scheduledAt).length;
  const unscheduledCount = allMatches.length - scheduledCount;

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setEditData({
      scheduledAt: match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : "",
      map: match.map || "",
    });
    setError(null); setSuccess(null);
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
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setSuccess("Match updated");
      setEditingMatch(null);
      setTimeout(() => window.location.reload(), 700);
    } catch { setError("Network error"); } finally { setSaving(false); }
  }

  function formatDate(d: string | null) {
    if (!d) return "Not scheduled";
    return new Date(d).toLocaleString("en-NP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function statusColor(s: string) {
    const st = s.toLowerCase();
    if (st === "completed") return "#D4AF37";
    if (st === "live") return "#22c55e";
    if (st === "cancelled") return "#ef4444";
    return "#8a8a8a";
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "0.35rem", fontWeight: "600" }}>
          DASHBOARD / SCHEDULE
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: "800", textTransform: "uppercase", color: "#fff", margin: 0 }}>
          Match Schedule
        </h1>
      </div>

      {error && <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>}
      {success && <div style={{ background: "#001a00", border: "1px solid #D4AF37", color: "#D4AF37", padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>{success}</div>}

      {tournaments.length === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#b8b8b8", marginBottom: "1rem" }}>NO TOURNAMENTS FOUND</div>
          <div style={{ color: "#b8b8b8", fontSize: "1rem" }}>Create a tournament first to manage its schedule.</div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#b8b8b8", letterSpacing: "0.15em", marginBottom: "0.4rem", fontWeight: "600" }}>TOURNAMENT</label>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", padding: "0.75rem", cursor: "pointer", minHeight: "44px" }}
            >
              {tournaments.map((t) => (<option key={t.id} value={t.id}>{t.name} ({t.game})</option>))}
            </select>
          </div>

          {activeTournament && (
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "0.85rem 1rem", marginBottom: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>STATUS</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#D4AF37", fontWeight: "700" }}>{activeTournament.status.toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>TOTAL</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#fff", fontWeight: "700" }}>{allMatches.length}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>SCHEDULED</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#22c55e", fontWeight: "700" }}>{scheduledCount}</div>
              </div>
              <div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>PENDING</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#ef4444", fontWeight: "700" }}>{unscheduledCount}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {allMatches.length === 0 ? (
              <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#b8b8b8" }}>
                No matches yet. Create matches from the tournament editor.
              </div>
            ) : (
              allMatches.map((match) => (
                <div key={match.id} style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "1rem" }}>
                  {editingMatch === match.id ? (
                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#D4AF37", marginBottom: "0.75rem", fontWeight: "600" }}>
                        EDITING {match.name.toUpperCase()}
                      </div>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#b8b8b8", marginBottom: "0.35rem" }}>DATE & TIME</label>
                        <input
                          type="datetime-local"
                          value={editData.scheduledAt}
                          onChange={(e) => setEditData((p) => ({ ...p, scheduledAt: e.target.value }))}
                          style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", padding: "0.6rem", boxSizing: "border-box", minHeight: "44px" }}
                        />
                      </div>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#b8b8b8", marginBottom: "0.35rem" }}>MAP</label>
                        <input
                          type="text"
                          value={editData.map}
                          onChange={(e) => setEditData((p) => ({ ...p, map: e.target.value }))}
                          placeholder="Erangel, Miramar..."
                          style={{ width: "100%", background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", padding: "0.6rem", boxSizing: "border-box", minHeight: "44px" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button onClick={() => saveMatch(match.id)} disabled={saving} style={{ flex: 1, minWidth: "120px", padding: "0.75rem 1.25rem", background: "#D4AF37", color: "#0a0a0a", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, minHeight: "44px" }}>
                          {saving ? "SAVING..." : "SAVE"}
                        </button>
                        <button onClick={() => setEditingMatch(null)} style={{ flex: 1, minWidth: "120px", padding: "0.75rem 1.25rem", background: "transparent", color: "#b8b8b8", border: "1px solid #2a2a2a", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", cursor: "pointer", minHeight: "44px" }}>
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.05rem", fontWeight: "700", color: "#fff", textTransform: "uppercase" }}>
                            {match.name}
                          </div>
                          {match.matchNumber !== null && (
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#8a8a8a", marginTop: "0.15rem" }}>
                              MATCH #{match.matchNumber}
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: statusColor(match.status), border: "1px solid " + statusColor(match.status), padding: "0.25rem 0.6rem", fontWeight: "700", flexShrink: 0 }}>
                          {match.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                        {match.map && (
                          <div style={{ color: "#b8b8b8" }}>📍 {match.map}</div>
                        )}
                        <div style={{ color: match.scheduledAt ? "#fff" : "#8a8a8a" }}>
                          🕐 {formatDate(match.scheduledAt)}
                        </div>
                      </div>

                      <button onClick={() => startEdit(match)} style={{ width: "100%", padding: "0.6rem", background: "transparent", color: "#D4AF37", border: "1px solid #D4AF37", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", cursor: "pointer", fontWeight: "700", letterSpacing: "0.1em", minHeight: "44px" }}>
                        EDIT MATCH
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}