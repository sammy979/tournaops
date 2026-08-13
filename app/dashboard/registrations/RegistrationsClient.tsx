"use client";

import { useState, useMemo } from "react";

interface Captain {
  id: string;
  name: string | null;
  email: string | null;
}

interface Team {
  id: string;
  name: string;
  tag: string | null;
  captain: Captain | null;
  members: { id: string }[];
}

interface Registration {
  id: string;
  status: string;
  createdAt: string;
  team: Team | null;
}

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  maxTeams: number;
  registrations: Registration[];
}

interface Props {
  tournaments: Tournament[];
  userId: string;
}

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "WAITLISTED";

export default function RegistrationsClient({ tournaments }: Props) {
  const [selectedTournament, setSelectedTournament] = useState<string>(
    tournaments[0]?.id || ""
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [regs, setRegs] = useState<Record<string, Registration[]>>(
    Object.fromEntries(tournaments.map((t) => [t.id, t.registrations]))
  );

  const activeTournament = tournaments.find((t) => t.id === selectedTournament);
  const activeRegs = regs[selectedTournament] || [];

  const filtered = useMemo(() => {
    let list = activeRegs;
    if (statusFilter !== "ALL") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.team?.name.toLowerCase().includes(q) ||
          r.team?.tag?.toLowerCase().includes(q) ||
          r.team?.captain?.name?.toLowerCase().includes(q) ||
          r.team?.captain?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeRegs, statusFilter, search]);

  const counts = useMemo(() => ({
    ALL: activeRegs.length,
    PENDING: activeRegs.filter((r) => r.status === "PENDING").length,
    APPROVED: activeRegs.filter((r) => r.status === "APPROVED").length,
    REJECTED: activeRegs.filter((r) => r.status === "REJECTED").length,
    WAITLISTED: activeRegs.filter((r) => r.status === "WAITLISTED").length,
  }), [activeRegs]);

  async function updateStatus(
    registrationId: string,
    newStatus: "APPROVED" | "REJECTED" | "WAITLISTED"
  ) {
    setLoading(registrationId + newStatus);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update registration");
        return;
      }
      setSuccess(`Registration ${newStatus.toLowerCase()} successfully`);
      setRegs((prev) => ({
        ...prev,
        [selectedTournament]: prev[selectedTournament].map((r) =>
          r.id === registrationId ? { ...r, status: newStatus } : r
        ),
      }));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "APPROVED": return "var(--gold)";
      case "REJECTED": return "#ef4444";
      case "WAITLISTED": return "#f97316";
      default: return "var(--charcoal)";
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short",
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
          DASHBOARD / REGISTRATIONS
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}>
          Team Registrations
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
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          color: "var(--charcoal)",
        }}>
          No tournaments found. Create a tournament first.
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}>
            <div>
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
                onChange={(e) => {
                  setSelectedTournament(e.target.value);
                  setStatusFilter("ALL");
                  setSearch("");
                }}
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

            <div>
              <label style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--charcoal)",
                letterSpacing: "0.15em",
                marginBottom: "0.4rem",
              }}>
                SEARCH TEAM / CAPTAIN
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by team name, tag, or captain..."
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  padding: "0.5rem 0.75rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {activeTournament && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              display: "flex",
              gap: "2rem",
              flexWrap: "wrap",
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
            }}>
              <span style={{ color: "var(--charcoal)" }}>
                SLOTS:{" "}
                <span style={{ color: "var(--gold)" }}>
                  {counts.APPROVED} / {activeTournament.maxTeams}
                </span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                PENDING:{" "}
                <span style={{ color: "#fff" }}>{counts.PENDING}</span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                WAITLISTED:{" "}
                <span style={{ color: "#f97316" }}>{counts.WAITLISTED}</span>
              </span>
              <span style={{ color: "var(--charcoal)" }}>
                REJECTED:{" "}
                <span style={{ color: "#ef4444" }}>{counts.REJECTED}</span>
              </span>
            </div>
          )}

          <div style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}>
            {(["ALL", "PENDING", "APPROVED", "WAITLISTED", "REJECTED"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: "0.4rem 1rem",
                  background: statusFilter === s ? "var(--gold)" : "var(--surface)",
                  color: statusFilter === s ? "var(--black)" : "var(--charcoal)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{
              padding: "3rem 2rem",
              textAlign: "center",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              color: "var(--charcoal)",
            }}>
              No registrations match your filters.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1.5fr 80px 100px 160px",
                gap: "1rem",
                padding: "0.5rem 1rem",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--charcoal)",
                letterSpacing: "0.1em",
                borderBottom: "1px solid var(--border)",
              }}>
                <span>TEAM</span>
                <span>CAPTAIN</span>
                <span>PLAYERS</span>
                <span>STATUS</span>
                <span>ACTIONS</span>
              </div>

              {filtered.map((reg) => (
                <div
                  key={reg.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 80px 100px 160px",
                    gap: "1rem",
                    padding: "0.875rem 1rem",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: "1rem",
                      fontWeight: "700",
                      color: "#fff",
                    }}>
                      {reg.team?.name || "Unknown Team"}
                    </div>
                    {reg.team?.tag && (
                      <div style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        color: "var(--gold)",
                      }}>
                        [{reg.team.tag}]
                      </div>
                    )}
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--charcoal)",
                      marginTop: "0.2rem",
                    }}>
                      {formatDate(reg.createdAt)}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.75rem",
                      color: "#fff",
                    }}>
                      {reg.team?.captain?.name || "—"}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--charcoal)",
                    }}>
                      {reg.team?.captain?.email || "—"}
                    </div>
                  </div>

                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    color: "#fff",
                    textAlign: "center",
                  }}>
                    {reg.team?.members.length ?? 0}
                  </div>

                  <div>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: statusColor(reg.status),
                      border: `1px solid ${statusColor(reg.status)}`,
                      padding: "0.2rem 0.5rem",
                    }}>
                      {reg.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {reg.status !== "APPROVED" && (
                      <button
                        onClick={() => updateStatus(reg.id, "APPROVED")}
                        disabled={loading === reg.id + "APPROVED"}
                        style={{
                          padding: "0.3rem 0.6rem",
                          background: "var(--gold)",
                          color: "var(--black)",
                          border: "none",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          fontWeight: "700",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading === reg.id + "APPROVED" ? "..." : "APPROVE"}
                      </button>
                    )}
                    {reg.status !== "WAITLISTED" && (
                      <button
                        onClick={() => updateStatus(reg.id, "WAITLISTED")}
                        disabled={loading === reg.id + "WAITLISTED"}
                        style={{
                          padding: "0.3rem 0.6rem",
                          background: "transparent",
                          color: "#f97316",
                          border: "1px solid #f97316",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          fontWeight: "700",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading === reg.id + "WAITLISTED" ? "..." : "WAIT"}
                      </button>
                    )}
                    {reg.status !== "REJECTED" && (
                      <button
                        onClick={() => updateStatus(reg.id, "REJECTED")}
                        disabled={loading === reg.id + "REJECTED"}
                        style={{
                          padding: "0.3rem 0.6rem",
                          background: "transparent",
                          color: "#ef4444",
                          border: "1px solid #ef4444",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          fontWeight: "700",
                          cursor: loading ? "not-allowed" : "pointer",
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        {loading === reg.id + "REJECTED" ? "..." : "REJECT"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}