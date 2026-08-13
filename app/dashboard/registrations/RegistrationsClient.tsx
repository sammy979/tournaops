"use client";

import { useState, useMemo } from "react";

interface Team {
  id: string;
  name: string;
  tag: string | null;
  playersList: { id: string }[];
}

interface UserInfo {
  id: string;
  displayName: string | null;
  email: string | null;
}

interface Registration {
  id: string;
  status: string;
  createdAt: string;
  team: Team | null;
  user: UserInfo | null;
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
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id || "");
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
    if (statusFilter !== "ALL") list = list.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.team?.name.toLowerCase().includes(q) ||
        r.team?.tag?.toLowerCase().includes(q) ||
        r.user?.displayName?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q)
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

  async function updateStatus(regId: string, newStatus: "APPROVED" | "REJECTED" | "WAITLISTED") {
    setLoading(regId + newStatus); setError(null); setSuccess(null);
    try {
      const res = await fetch(`/api/registrations/${regId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setSuccess(`Registration ${newStatus.toLowerCase()}`);
      setRegs((prev) => ({
        ...prev,
        [selectedTournament]: prev[selectedTournament].map((r) => r.id === regId ? { ...r, status: newStatus } : r),
      }));
    } catch { setError("Network error"); } finally { setLoading(null); }
  }

  function statusColor(s: string) {
    if (s === "APPROVED") return "#D4AF37";
    if (s === "REJECTED") return "#ef4444";
    if (s === "WAITLISTED") return "#f97316";
    return "#8a8a8a";
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "'Barlow Condensed', sans-serif", color: "#fff" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "#D4AF37", letterSpacing: "0.2em", marginBottom: "0.35rem", fontWeight: "600" }}>
          DASHBOARD / REGISTRATIONS
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)", fontWeight: "800", textTransform: "uppercase", color: "#fff", margin: 0 }}>
          Team Registrations
        </h1>
      </div>

      {error && <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</div>}
      {success && <div style={{ background: "#001a00", border: "1px solid #D4AF37", color: "#D4AF37", padding: "0.75rem 1rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>{success}</div>}

      {tournaments.length === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#b8b8b8" }}>
          No tournaments found. Create a tournament first.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#b8b8b8", letterSpacing: "0.15em", marginBottom: "0.4rem", fontWeight: "600" }}>TOURNAMENT</label>
            <select value={selectedTournament} onChange={(e) => { setSelectedTournament(e.target.value); setStatusFilter("ALL"); setSearch(""); }} style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", padding: "0.75rem", cursor: "pointer", minHeight: "44px" }}>
              {tournaments.map((t) => (<option key={t.id} value={t.id}>{t.name} ({t.game})</option>))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#b8b8b8", letterSpacing: "0.15em", marginBottom: "0.4rem", fontWeight: "600" }}>SEARCH</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Team name, tag, captain..." style={{ width: "100%", background: "#141414", border: "1px solid #2a2a2a", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.9rem", padding: "0.75rem", boxSizing: "border-box", minHeight: "44px" }} />
          </div>

          {activeTournament && (
            <div style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "0.85rem 1rem", marginBottom: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "0.75rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem" }}>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>SLOTS</div>
                <div style={{ color: "#D4AF37", fontWeight: "700" }}>{counts.APPROVED}/{activeTournament.maxTeams}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>PENDING</div>
                <div style={{ color: "#fff", fontWeight: "700" }}>{counts.PENDING}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>WAITLIST</div>
                <div style={{ color: "#f97316", fontWeight: "700" }}>{counts.WAITLISTED}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.55rem", color: "#8a8a8a", letterSpacing: "0.15em", marginBottom: "0.25rem" }}>REJECTED</div>
                <div style={{ color: "#ef4444", fontWeight: "700" }}>{counts.REJECTED}</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            {(["ALL", "PENDING", "APPROVED", "WAITLISTED", "REJECTED"] as StatusFilter[]).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "0.5rem 0.9rem", background: statusFilter === s ? "#D4AF37" : "#141414", color: statusFilter === s ? "#0a0a0a" : "#b8b8b8", border: "1px solid " + (statusFilter === s ? "#D4AF37" : "#2a2a2a"), fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", minHeight: "36px" }}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", border: "1px solid #2a2a2a", background: "#141414", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: "#b8b8b8" }}>
              No registrations match your filters.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map((reg) => (
                <div key={reg.id} style={{ background: "#141414", border: "1px solid #2a2a2a", padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "180px" }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "1.1rem", fontWeight: "700", color: "#fff" }}>
                        {reg.team?.name || "Unknown Team"}
                      </div>
                      {reg.team?.tag && (
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: "#D4AF37" }}>[{reg.team.tag}]</div>
                      )}
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", color: statusColor(reg.status), border: "1px solid " + statusColor(reg.status), padding: "0.25rem 0.6rem", fontWeight: "700", flexShrink: 0 }}>
                      {reg.status}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem", marginBottom: "0.85rem", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem", color: "#b8b8b8" }}>
                    <div>
                      <div style={{ color: "#666", fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>CAPTAIN</div>
                      <div style={{ color: "#fff" }}>{reg.user?.displayName || "—"}</div>
                    </div>
                    <div>
                      <div style={{ color: "#666", fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>PLAYERS</div>
                      <div style={{ color: "#fff" }}>{reg.team?.playersList.length ?? 0}</div>
                    </div>
                    <div>
                      <div style={{ color: "#666", fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "0.15rem" }}>REGISTERED</div>
                      <div>{formatDate(reg.createdAt)}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {reg.status !== "APPROVED" && (
                      <button onClick={() => updateStatus(reg.id, "APPROVED")} disabled={!!loading} style={{ flex: 1, minWidth: "90px", padding: "0.6rem", background: "#D4AF37", color: "#0a0a0a", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", minHeight: "40px" }}>
                        {loading === reg.id + "APPROVED" ? "..." : "APPROVE"}
                      </button>
                    )}
                    {reg.status !== "WAITLISTED" && (
                      <button onClick={() => updateStatus(reg.id, "WAITLISTED")} disabled={!!loading} style={{ flex: 1, minWidth: "90px", padding: "0.6rem", background: "transparent", color: "#f97316", border: "1px solid #f97316", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", minHeight: "40px" }}>
                        WAITLIST
                      </button>
                    )}
                    {reg.status !== "REJECTED" && (
                      <button onClick={() => updateStatus(reg.id, "REJECTED")} disabled={!!loading} style={{ flex: 1, minWidth: "90px", padding: "0.6rem", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.7rem", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", minHeight: "40px" }}>
                        REJECT
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