"use client";

import { useState, useEffect } from "react";
import { Users, Check, X, Clock, Download, Search, Trophy } from "lucide-react";
import { getMyTournaments, getTournamentById, saveTournament } from "@/lib/storage/tournaments";
import { Tournament, Team, Player } from "@/types/tournament";

export default function RegistrationsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) setSelected(t[0].id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    try {
      const raw = localStorage.getItem(`registrations_${selected}`) || "[]";
      setRegistrations(JSON.parse(raw));
    } catch {
      setRegistrations([]);
    }
  }, [selected]);

  const saveRegistrations = (regs: any[]) => {
    setRegistrations(regs);
    localStorage.setItem(`registrations_${selected}`, JSON.stringify(regs));
  };

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    const updated = registrations.map(r => r.id === id ? { ...r, status } : r);
    saveRegistrations(updated);
  };

  const approveAndAdd = (reg: any) => {
    const tournament = getTournamentById(selected);
    if (!tournament) return;

    const newTeam: Team = {
      id: Math.random().toString(36).substring(2, 10),
      name: reg.teamName,
      tag: reg.teamTag || reg.teamName.slice(0, 4).toUpperCase(),
      players: reg.players.map((p: any, i: number) => ({
        id: Math.random().toString(36).substring(2, 10),
        name: p.name,
        ign: p.ign,
        role: p.role || "Fragger",
        uid: p.uid,
      })) as Player[],
      seed: tournament.teams.length + 1,
    };

    const updatedTournament = { ...tournament, teams: [...tournament.teams, newTeam] };
    saveTournament(updatedTournament);
    updateStatus(reg.id, "approved");
  };

  const exportCSV = () => {
    const rows = [
      ["Team Name", "Tag", "Email", "Discord", "Player 1", "Player 2", "Player 3", "Player 4", "Status"],
      ...registrations.map(r => [
        r.teamName, r.teamTag, r.contactEmail, r.contactDiscord,
        ...r.players.map((p: any) => `${p.name} (${p.ign})`),
        r.status,
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${selected}.csv`;
    a.click();
  };

  const filtered = registrations.filter(r => {
    const matchSearch = r.teamName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.status === filter;
    return matchSearch && matchFilter;
  });

  const pending = registrations.filter(r => r.status === "pending").length;
  const approved = registrations.filter(r => r.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Registrations</h1>
          <p className="text-gray-500 mt-1">Manage team registration requests</p>
        </div>
        <div className="flex items-center gap-2">
          {registrations.length > 0 && (
            <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
              <Download className="w-4 h-4" />Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Tournament Selector */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4 flex-wrap">
          <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field w-auto text-sm">
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {selected && (
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Clock className="w-3.5 h-3.5" />{pending} pending
              </span>
              <span className="flex items-center gap-1.5 text-green-400">
                <Check className="w-3.5 h-3.5" />{approved} approved
              </span>
              <span className="text-gray-600">{registrations.length} total</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {registrations.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
          </div>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {(["all", "pending", "approved", "rejected"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Registrations List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(reg => (
            <div key={reg.id} className={`glass-card rounded-xl p-5 border transition-all ${
              reg.status === "approved" ? "border-green-500/20 bg-green-500/3" :
              reg.status === "rejected" ? "border-red-500/20 bg-red-500/3 opacity-60" :
              "border-white/10 hover:border-white/20"
            }`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{reg.teamName.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold">{reg.teamName}</h3>
                      {reg.teamTag && <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">{reg.teamTag}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        reg.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        reg.status === "approved" ? "bg-green-500/20 text-green-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {reg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      {reg.contactEmail && <span>{reg.contactEmail}</span>}
                      {reg.contactDiscord && <span>Discord: {reg.contactDiscord}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {reg.players.map((p: any, i: number) => (
                        <span key={i} className="text-xs bg-white/5 border border-white/8 rounded-lg px-2 py-0.5 text-gray-300">
                          {p.name} <span className="text-gray-600">({p.ign})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {reg.status === "pending" && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveAndAdd(reg)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/20 text-sm font-medium transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />Approve & Add
                    </button>
                    <button
                      onClick={() => updateStatus(reg.id, "rejected")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">
            {registrations.length === 0 ? "No Registrations Yet" : "No Results"}
          </h3>
          <p className="text-gray-500 mb-4">
            {registrations.length === 0
              ? "Share your tournament registration link with teams"
              : "Try a different search or filter"
            }
          </p>
          {registrations.length === 0 && selected && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm mb-2">Registration link:</p>
              <code className="text-blue-400 text-sm bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                {typeof window !== "undefined" ? window.location.origin : "https://tournaops.com"}/tournaments/{tournaments.find(t => t.id === selected)?.slug}/register
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}