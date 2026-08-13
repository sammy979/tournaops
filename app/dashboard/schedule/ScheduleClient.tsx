"use client";

import { useState } from "react";

interface Team {
  id: string;
  name: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  scheduledAt: string | null;
  map: string | null;
  status: string;
  teamA: Team | null;
  teamB: Team | null;
  scoreA: number | null;
  scoreB: number | null;
}

interface Stage {
  id: string;
  name: string;
  order: number;
  matches: Match[];
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  stages: Stage[];
}

interface Props {
  tournaments: Tournament[];
  userId: string;
}

export default function ScheduleClient({ tournaments, userId }: Props) {
  const [selectedTournament, setSelectedTournament] = useState<string>(
    tournaments[0]?.id || ""
  );
  const [view, setView] = useState<"list" | "calendar">("list");
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    scheduledAt: string;
    map: string;
  }>({ scheduledAt: "", map: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeTournament = tournaments.find((t) => t.id === selectedTournament);

  const allMatches: (Match & { stageName: string })[] =
    activeTournament?.stages.flatMap((s) =>
      s.matches.map((m) => ({ ...m, stageName: s.name }))
    ) || [];

  const scheduledMatches = allMatches.filter((m) => m.scheduledAt);
  const unscheduledMatches = allMatches.filter((m) => !m.scheduledAt);

  function startEdit(match: Match) {
    setEditingMatch(match.id);
    setEditData({
      scheduledAt: match.scheduledAt
        ? new Date(match.scheduledAt).toISOString().slice(0, 16)
        : "",
      map: match.map || "",
    });
    setError(null);
    setSuccess(null);
  }

  function cancelEdit() {
    setEditingMatch(null);
    setEditData({ scheduledAt: "", map: "" });
  }

  async function saveMatch(matchId: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt: editData.scheduledAt
            ? new Date(editData.scheduledAt).toISOString()
            : null,
          map: editData.map.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save match");
        return;
      }
      setSuccess("Match updated successfully");
      setEditingMatch(null);
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-NP", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusColor(status: string) {
    switch (status) {
      case "COMPLETED": return "var(--gold)";
      case "LIVE": return "#22c55e";
      case "CANCELLED": return "#ef4444";
      default: return "var(--charcoal)";
    }
  }

  const calendarDays = (() => {
    if (!scheduledMatches.length) return [];
    const dates = scheduledMatches
      .map((m) => new Date(m.scheduledAt!))
      .sort((a, b) => a.getTime() - b.getTime());
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    start.setDate(1);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    const days: Date[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  })();

  function matchesOnDay(day: Date) {
    return scheduledMatches.filter((m) => {
      const d = new Date(m.scheduledAt!);
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate()
      );
    });
  }

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "Barlow Condensed, sans-serif",
    }}>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--gold)",
          letterSpacing: "0.2em",
          marginBottom: "0.25rem",
        }}>
          DASHBOARD / SCHEDULE
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}>
          Match Schedule
        </h1>
      </div>

      {error && (
        <div style={{
          background: "#1a0000",
          border: "1px solid #ef4444",
          color: "#ef4444",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          marginBottom: "1rem",
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#001a00",
          border: "1px solid var(--gold)",
          color: "var(--gold)",
          padding: "0.75rem 1rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          marginBottom: "1rem",
        }}>
          {success}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div style={{
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--charcoal)",
            marginBottom: "1rem",
          }}>
            NO TOURNAMENTS FOUND
          </div>
          <div style={{ color: "var(--charcoal)", fontSize: "1rem" }}>
            Create a tournament first to manage its schedule.
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <label style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--charcoal)",
                letterSpacing: "0.15em",
                marginBottom: "0.4rem",
              }}>
                TOURNAMENT
              </label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                }}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.game})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignSelf: "flex-end" }}>
              {(["list", "calendar"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "0.5rem 1.25rem",
                    background: view === v ? "var(--gold)" : "var(--surface)",
                    color: view === v ? "var(--black)" : "var(--charcoal)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {v === "list" ? "LIST VIEW" : "CALENDAR"}
                </button>
              ))}
            </div>
          </div>

          {activeTournament && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}>
              <span style={{ color: "var(--charcoal)" }}>
                STATUS: <span style={{ color: "var(--gold)" }}>{activeTournament.status}</span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                TOTAL MATCHES: <span style={{ color: "#fff" }}>{allMatches.length}</span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                SCHEDULED: <span style={{ color: "#22c55e" }}>{scheduledMatches.length}</span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                UNSCHEDULED: <span style={{ color: "#ef4444" }}>{unscheduledMatches.length}</span>
              </span>
            </div>
          )}

          {view === "list" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {activeTournament?.stages.map((stage) => (
                <div key={stage.id}>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "var(--gold)",
                    letterSpacing: "0.2em",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.5rem",
                  }}>
                    STAGE {stage.order}: {stage.name.toUpperCase()}
                  </div>

                  {stage.matches.length === 0 ? (
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "var(--charcoal)",
                      padding: "1rem",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}>
                      No matches in this stage yet.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {stage.matches.map((match) => (
                        <div
                          key={match.id}
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            padding: "1rem 1.25rem",
                          }}
                        >
                          {editingMatch === match.id ? (
                            <div>
                              <div style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.65rem",
                                color: "var(--gold)",
                                marginBottom: "0.75rem",
                              }}>
                                EDITING MATCH #{match.matchNumber}
                              </div>
                              <div style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "1rem",
                                marginBottom: "0.75rem",
                              }}>
                                <div>
                                  <label style={{
                                    display: "block",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6rem",
                                    color: "var(--charcoal)",
                                    marginBottom: "0.3rem",
                                  }}>
                                    DATE & TIME
                                  </label>
                                  <input
                                    type="datetime-local"
                                    value={editData.scheduledAt}
                                    onChange={(e) =>
                                      setEditData((prev) => ({
                                        ...prev,
                                        scheduledAt: e.target.value,
                                      }))
                                    }
                                    style={{
                                      width: "100%",
                                      background: "var(--black)",
                                      border: "1px solid var(--border)",
                                      color: "#fff",
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.8rem",
                                      padding: "0.4rem 0.6rem",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{
                                    display: "block",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.6rem",
                                    color: "var(--charcoal)",
                                    marginBottom: "0.3rem",
                                  }}>
                                    MAP / LOCATION
                                  </label>
                                  <input
                                    type="text"
                                    value={editData.map}
                                    onChange={(e) =>
                                      setEditData((prev) => ({
                                        ...prev,
                                        map: e.target.value,
                                      }))
                                    }
                                    placeholder="e.g. Erangel, Miramar..."
                                    style={{
                                      width: "100%",
                                      background: "var(--black)",
                                      border: "1px solid var(--border)",
                                      color: "#fff",
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.8rem",
                                      padding: "0.4rem 0.6rem",
                                      boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                  onClick={() => saveMatch(match.id)}
                                  disabled={saving}
                                  style={{
                                    padding: "0.4rem 1rem",
                                    background: "var(--gold)",
                                    color: "var(--black)",
                                    border: "none",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    opacity: saving ? 0.6 : 1,
                                  }}
                                >
                                  {saving ? "SAVING..." : "SAVE"}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  style={{
                                    padding: "0.4rem 1rem",
                                    background: "transparent",
                                    color: "var(--charcoal)",
                                    border: "1px solid var(--border)",
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.75rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  CANCEL
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "0.75rem",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                <div style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.65rem",
                                  color: "var(--charcoal)",
                                  minWidth: "60px",
                                }}>
                                  R{match.round} · M{match.matchNumber}
                                </div>
                                <div style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  fontFamily: "Barlow Condensed, sans-serif",
                                  fontSize: "1rem",
                                  fontWeight: "700",
                                }}>
                                  <span style={{ color: "#fff" }}>
                                    {match.teamA?.name || "TBD"}
                                  </span>
                                  {match.scoreA !== null && match.scoreB !== null && (
                                    <span style={{
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.85rem",
                                      color: "var(--gold)",
                                    }}>
                                      {match.scoreA} — {match.scoreB}
                                    </span>
                                  )}
                                  {(match.scoreA === null || match.scoreB === null) && (
                                    <span style={{
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.75rem",
                                      color: "var(--charcoal)",
                                    }}>
                                      vs
                                    </span>
                                  )}
                                  <span style={{ color: "#fff" }}>
                                    {match.teamB?.name || "TBD"}
                                  </span>
                                </div>
                              </div>

                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                flexWrap: "wrap",
                              }}>
                                {match.map && (
                                  <span style={{
                                    fontFamily: "var(--font-mono)",
                                    fontSize: "0.7rem",
                                    color: "var(--charcoal)",
                                  }}>
                                    📍 {match.map}
                                  </span>
                                )}
                                <span style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.7rem",
                                  color: match.scheduledAt ? "#fff" : "var(--charcoal)",
                                }}>
                                  🕐 {formatDate(match.scheduledAt)}
                                </span>
                                <span style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.65rem",
                                  color: statusColor(match.status),
                                  border: `1px solid ${statusColor(match.status)}`,
                                  padding: "0.15rem 0.4rem",
                                }}>
                                  {match.status}
                                </span>
                                {match.status === "PENDING" && (
                                  <button
                                    onClick={() => startEdit(match)}
                                    style={{
                                      padding: "0.3rem 0.75rem",
                                      background: "transparent",
                                      color: "var(--gold)",
                                      border: "1px solid var(--gold)",
                                      fontFamily: "var(--font-mono)",
                                      fontSize: "0.65rem",
                                      cursor: "pointer",
                                    }}
                                  >
                                    EDIT
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {(!activeTournament || activeTournament.stages.length === 0) && (
                <div style={{
                  padding: "3rem 2rem",
                  textAlign: "center",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--charcoal)",
                }}>
                  No stages or matches found for this tournament.
                  Create stages and matches from the tournament editor.
                </div>
              )}
            </div>
          )}

          {view === "calendar" && (
            <div>
              {calendarDays.length === 0 ? (
                <div style={{
                  padding: "3rem 2rem",
                  textAlign: "center",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: "var(--charcoal)",
                }}>
                  No scheduled matches yet. Use list view to set dates.
                </div>
              ) : (
                <div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "1px",
                    background: "var(--border)",
                    marginBottom: "1px",
                  }}>
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                      <div key={d} style={{
                        background: "var(--surface)",
                        padding: "0.5rem",
                        textAlign: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--charcoal)",
                        letterSpacing: "0.1em",
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "1px",
                    background: "var(--border)",
                  }}>
                    {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
                      <div key={`empty-${i}`} style={{
                        background: "var(--black)",
                        minHeight: "80px",
                      }} />
                    ))}
                    {calendarDays.map((day) => {
                      const dayMatches = matchesOnDay(day);
                      const isToday =
                        day.toDateString() === new Date().toDateString();
                      return (
                        <div
                          key={day.toISOString()}
                          style={{
                            background: isToday ? "#1a1500" : "var(--surface)",
                            minHeight: "80px",
                            padding: "0.4rem",
                            border: isToday ? "1px solid var(--gold)" : "none",
                          }}
                        >
                          <div style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: isToday ? "var(--gold)" : "var(--charcoal)",
                            marginBottom: "0.3rem",
                          }}>
                            {day.getDate()}
                          </div>
                          {dayMatches.map((m) => (
                            <div
                              key={m.id}
                              style={{
                                background: "var(--black)",
                                border: "1px solid var(--border)",
                                padding: "0.2rem 0.3rem",
                                marginBottom: "0.2rem",
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.6rem",
                                color: "#fff",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {m.teamA?.name || "TBD"} vs {m.teamB?.name || "TBD"}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}