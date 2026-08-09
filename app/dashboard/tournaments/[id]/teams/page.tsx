"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TournamentNav from "@/components/tournament/TournamentNav";
import TeamLogo from "@/components/tournament/TeamLogo";
import { useDialog } from "@/lib/use-confirm";
import {
  Users, Plus, Search, X, Edit, Trash2, Save,
  Loader2, ChevronLeft, Upload, Shield, Crown,
  Copy, Check, Download, Filter, AlertCircle
} from "lucide-react";

interface Player {
  id: string;
  name: string;
  ign?: string;
  role?: string;
  isCaptain?: boolean;
  isSubstitute?: boolean;
}

interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  country?: string;
  seed?: number;
  contact?: string;
  players: Player[];
  playersList?: Player[];
}

const ROLES = ["IGL", "Fragger", "Support", "Entry", "Scout"];

export default function TeamsPage() {
  const dialog = useDialog();
  const params = useParams();
  const id = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [addingTeam, setAddingTeam] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({ name: "", tag: "", contact: "", seed: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tournaments/${id}`)
      .then(r => r.json())
      .then(d => {
        setTournament(d.tournament);
        const t = d.tournament?.teams || [];
        setTeams(t.map((team: any) => ({
          ...team,
          players: team.playersList || team.players || [],
        })));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.tag || "").toLowerCase().includes(search.toLowerCase())
  );

  async function deleteTeam(teamId: string) {
    const ok = await dialog.confirm({
      title: "Delete team?",
      description: "This team and its players will be permanently removed. This cannot be undone.",
      confirmLabel: "Delete team",
      variant: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/tournaments/${id}/teams/${teamId}`, { method: "DELETE" });
    if (res.ok) {
      setTeams(prev => prev.filter(t => t.id !== teamId));
      if (editingTeam?.id === teamId) setEditingTeam(null);
    } else {
      await dialog.alert({ title: "Delete Failed", description: "Failed to delete team. Please try again.", variant: "danger" });
    }
  }

  async function saveTeam(team: Team) {
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: team.name,
          tag: team.tag,
          logo: team.logo,
          contact: team.contact,
          seed: team.seed,
          players: team.players,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(prev => prev.map(t => t.id === team.id ? { ...data.team, players: data.team.playersList || data.team.players || [] } : t));
        setSaved(team.id);
        setTimeout(() => setSaved(null), 2000);
        setEditingTeam(null);
      } else {
        await dialog.alert({ title: "Save Failed", description: "Failed to save team changes. Please try again.", variant: "danger" });
      }
    } finally {
      setSaving(false);
    }
  }

  async function addTeam() {
    if (!newTeam.name.trim()) {
      await dialog.alert({ title: "Name Required", description: "Please enter a team name before adding.", variant: "warning" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTeam.name.trim(),
          tag: newTeam.tag.trim() || null,
          contact: newTeam.contact.trim() || null,
          seed: newTeam.seed ? Number(newTeam.seed) : null,
          players: [
            { id: Math.random().toString(36).slice(2), name: "Player 1", ign: "", role: "IGL" },
            { id: Math.random().toString(36).slice(2), name: "Player 2", ign: "", role: "Fragger" },
            { id: Math.random().toString(36).slice(2), name: "Player 3", ign: "", role: "Support" },
            { id: Math.random().toString(36).slice(2), name: "Player 4", ign: "", role: "Entry" },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const t = data.team;
        setTeams(prev => [...prev, { ...t, players: t.playersList || t.players || [] }]);
        setNewTeam({ name: "", tag: "", contact: "", seed: "" });
        setAddingTeam(false);
      } else {
        const err = await res.json();
        await dialog.alert({ title: "Add Failed", description: err.error || "Failed to add team. Please try again.", variant: "danger" });
      }
    } finally {
      setSaving(false);
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>, teamId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      void dialog.alert({ title: "File Too Large", description: "Please use an image under 2MB.", variant: "warning" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      if (teamId && editingTeam?.id === teamId) {
        setEditingTeam(prev => prev ? { ...prev, logo: url } : null);
      }
    };
    reader.readAsDataURL(file);
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />Back to Tournament
      </Link>

      <TournamentNav tournamentId={id} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Users style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />
            Teams
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {tournament?.name} Â· {teams.length}/{tournament?.maxTeams} teams
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/dashboard/tournaments/${id}/bulk-import`}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", color: "#d1d5db", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
            <Upload style={{ width: "0.875rem", height: "0.875rem" }} />Bulk Import
          </Link>
          <button onClick={() => setAddingTeam(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#f59e0b", color: "#000", borderRadius: "0.625rem", padding: "0.5rem 0.875rem", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
            <Plus style={{ width: "0.875rem", height: "0.875rem" }} />Add Team
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: "1.25rem" }}>
        <Search style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", width: "1rem", height: "1rem", color: "#6b7280" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..."
          style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "0.75rem 0.75rem 0.75rem 2.75rem", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
        {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}><X style={{ width: "1rem", height: "1rem" }} /></button>}
      </div>

      {/* Add Team Form */}
      {addingTeam && (
        <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.25rem" }}>
          <h3 style={{ color: "#fff", fontWeight: 700, marginBottom: "1rem" }}>Add New Team</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            {[
              { label: "Team Name *", key: "name", placeholder: "e.g. Team Alpha" },
              { label: "Tag", key: "tag", placeholder: "e.g. ALPHA" },
              { label: "Contact", key: "contact", placeholder: "Discord or email" },
              { label: "Seed #", key: "seed", placeholder: "1", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={(newTeam as any)[f.key]}
                  onChange={e => setNewTeam(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.875rem", boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={addTeam} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: "#f59e0b", color: "#000", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
              {saving ? <Loader2 style={{ width: "0.875rem", height: "0.875rem", animation: "spin 0.8s linear infinite" }} /> : <Plus style={{ width: "0.875rem", height: "0.875rem" }} />}
              Add Team
            </button>
            <button onClick={() => setAddingTeam(false)}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.625rem", padding: "0.5rem 1rem", color: "#9ca3af", fontSize: "0.8rem", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Teams Grid */}
      {filtered.length === 0 ? (
        <div style={{ background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "4rem 2rem", textAlign: "center" }}>
          <Users style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
          <p style={{ color: "#9ca3af", fontWeight: 600 }}>{search ? "No teams match your search" : "No teams yet"}</p>
          {!search && <button onClick={() => setAddingTeam(true)} style={{ marginTop: "1rem", background: "#f59e0b", color: "#000", borderRadius: "0.625rem", padding: "0.5rem 1.25rem", border: "none", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>Add First Team</button>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {filtered.map(team => (
            <div key={team.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem", position: "relative" }}>
              {saved === team.id && (
                <div style={{ position: "absolute", top: "0.75rem", right: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem", color: "#4ade80", fontSize: "0.7rem", fontWeight: 700 }}>
                  <Check style={{ width: "0.75rem", height: "0.75rem" }} />Saved
                </div>
              )}

              {editingTeam?.id === team.id ? (
                /* Edit Mode */
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
                      <TeamLogo name={editingTeam.name || "?"} logo={editingTeam.logo} tag={editingTeam.tag} size={48} />
                      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload style={{ width: "0.875rem", height: "0.875rem", color: "#fff" }} />
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleLogoUpload(e, team.id)} />
                    </div>
                    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 80px", gap: "0.5rem" }}>
                      <input value={editingTeam.name} onChange={e => setEditingTeam(prev => prev ? { ...prev, name: e.target.value } : null)}
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.375rem 0.625rem", color: "#fff", fontSize: "0.875rem", fontWeight: 700 }} />
                      <input value={editingTeam.tag || ""} onChange={e => setEditingTeam(prev => prev ? { ...prev, tag: e.target.value } : null)} placeholder="TAG"
                        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.375rem 0.625rem", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 700 }} />
                    </div>
                  </div>

                  {/* Players */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "1rem" }}>
                    {editingTeam.players.map((p, i) => (
                      <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "0.375rem" }}>
                        <input value={p.name} onChange={e => setEditingTeam(prev => prev ? { ...prev, players: prev.players.map((pl, j) => j === i ? { ...pl, name: e.target.value } : pl) } : null)}
                          placeholder="Name" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem", color: "#fff", fontSize: "0.75rem" }} />
                        <input value={p.ign || ""} onChange={e => setEditingTeam(prev => prev ? { ...prev, players: prev.players.map((pl, j) => j === i ? { ...pl, ign: e.target.value } : pl) } : null)}
                          placeholder="IGN" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.3rem 0.5rem", color: "#d1d5db", fontSize: "0.75rem" }} />
                        <select value={p.role || ""} onChange={e => setEditingTeam(prev => prev ? { ...prev, players: prev.players.map((pl, j) => j === i ? { ...pl, role: e.target.value } : pl) } : null)}
                          style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.3rem 0.25rem", color: "#9ca3af", fontSize: "0.7rem" }}>
                          <option value="">Role</option>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    <button onClick={() => saveTeam(editingTeam)} disabled={saving}
                      style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", background: "#f59e0b", color: "#000", borderRadius: "0.5rem", padding: "0.5rem", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      {saving ? <Loader2 style={{ width: "0.75rem", height: "0.75rem", animation: "spin 0.8s linear infinite" }} /> : <Save style={{ width: "0.75rem", height: "0.75rem" }} />}
                      Save
                    </button>
                    <button onClick={() => setEditingTeam(null)}
                      style={{ padding: "0.5rem 0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#9ca3af", fontSize: "0.75rem", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                    <TeamLogo name={team.name} logo={team.logo} tag={team.tag} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {team.tag && <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#f59e0b" }}>[{team.tag}]</span>}
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.name}</span>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.125rem" }}>
                        {team.players.length} players{team.seed ? ` Â· Seed #${team.seed}` : ""}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button onClick={() => setEditingTeam({ ...team, players: team.players || [] })}
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.375rem", padding: "0.375rem", color: "#9ca3af", cursor: "pointer" }}>
                        <Edit style={{ width: "0.875rem", height: "0.875rem" }} />
                      </button>
                      <button onClick={() => deleteTeam(team.id)}
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "0.375rem", padding: "0.375rem", color: "#f87171", cursor: "pointer" }}>
                        <Trash2 style={{ width: "0.875rem", height: "0.875rem" }} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {team.players.slice(0, 4).map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.375rem 0.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "0.375rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                          {p.isCaptain && <Crown style={{ width: "0.65rem", height: "0.65rem", color: "#f59e0b" }} />}
                          <span style={{ fontSize: "0.75rem", color: "#d1d5db", fontWeight: 500 }}>{p.name}</span>
                          {p.ign && p.ign !== p.name && <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>({p.ign})</span>}
                        </div>
                        {p.role && (
                          <span style={{ fontSize: "0.6rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "9999px", background: p.role === "IGL" ? "rgba(168,85,247,0.15)" : p.role === "Fragger" ? "rgba(239,68,68,0.15)" : "rgba(107,114,128,0.1)", color: p.role === "IGL" ? "#c084fc" : p.role === "Fragger" ? "#f87171" : "#9ca3af" }}>
                            {p.role}
                          </span>
                        )}
                      </div>
                    ))}
                    {team.players.length > 4 && <div style={{ fontSize: "0.65rem", color: "#6b7280", textAlign: "center", padding: "0.25rem" }}>+{team.players.length - 4} more</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}