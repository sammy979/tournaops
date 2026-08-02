"use client";

import { useState, useEffect } from "react";
import { Users, Check, X, Clock } from "lucide-react";
import { getMyTournaments, saveTournament } from "@/lib/storage/tournaments";
import { Tournament, Team, Player } from "@/types/tournament";

export default function RegistrationsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [registrations, setRegistrations] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      if (t && t.length > 0) setSelected(t[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selected) return;
    try {
      const raw = localStorage.getItem(`registrations_${selected}`) || "[]";
      setRegistrations(JSON.parse(raw));
    } catch { setRegistrations([]); }
  }, [selected]);

  const updateStatus = (id: string, status: "approved" | "rejected") => {
    const updated = registrations.map(r => r.id === id ? { ...r, status } : r);
    setRegistrations(updated);
    localStorage.setItem(`registrations_${selected}`, JSON.stringify(updated));
  };

  const approveAndAdd = async (reg: any) => {
    const tournament = tournaments.find(t => t.id === selected);
    if (!tournament) return;

    const newTeam: Team = {
      id: Math.random().toString(36).substring(2, 10),
      name: reg.teamName,
      tag: reg.teamTag || reg.teamName.slice(0, 4).toUpperCase(),
      players: reg.players.map((p: any) => ({
        id: Math.random().toString(36).substring(2, 10),
        name: p.name, ign: p.ign, role: p.role || "Fragger",
      })) as Player[],
      seed: tournament.teams.length + 1,
    };

    await saveTournament({ ...tournament, teams: [...tournament.teams, newTeam] });
    updateStatus(reg.id, "approved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Registrations</h1>
        <p className="text-gray-500 mt-1">Manage team registration requests</p>
      </div>

      <div className="glass-card rounded-xl p-4 border border-white/10">
        <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field w-auto text-sm">
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {registrations.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Registrations</h3>
          <p className="text-gray-500">Share the registration link with teams.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {registrations.map(reg => (
            <div key={reg.id} className="glass-card rounded-xl p-5 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold">{reg.teamName}</h3>
                  <p className="text-gray-500 text-xs">{reg.players?.length || 0} players</p>
                </div>
                {reg.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => approveAndAdd(reg)} className="px-4 py-2 rounded-xl bg-green-500/15 text-green-400 border border-green-500/20 text-sm">
                      <Check className="w-3.5 h-3.5 inline mr-1" />Approve
                    </button>
                    <button onClick={() => updateStatus(reg.id, "rejected")} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
                      <X className="w-3.5 h-3.5 inline mr-1" />Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}