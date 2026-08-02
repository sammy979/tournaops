"use client";

import { useState } from "react";
import { X, Upload, User, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Tournament, Team, Player } from "@/types/tournament";
import { saveTournament } from "@/lib/storage/tournaments";

interface TeamEditorProps {
  tournament: Tournament;
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

const ROLES = ["IGL", "Fragger", "Support", "Entry", "Sniper", "Assaulter", "Scout"];

export default function TeamEditor({ tournament, onClose, onSave }: TeamEditorProps) {
  const [teams, setTeams] = useState<Team[]>(JSON.parse(JSON.stringify(tournament.teams)));
  const [expandedTeam, setExpandedTeam] = useState<string | null>(teams[0]?.id || null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const updateTeam = (teamId: string, field: string, value: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, [field]: value } : t));
  };

  const updatePlayer = (teamId: string, playerId: string, field: string, value: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      return {
        ...t,
        players: t.players.map(p => p.id === playerId ? { ...p, [field]: value } : p)
      };
    }));
  };

  const handleLogoUpload = (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateTeam(teamId, "logo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePlayerPhotoUpload = (teamId: string, playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updatePlayer(teamId, playerId, "photo", ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = { ...tournament, teams };
      saveTournament(updated);
      onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-4xl mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Squads</h2>
            <p className="text-gray-400 text-sm mt-1">{teams.length} squads</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 px-6 py-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save All"}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <input
            type="text"
            placeholder="Search squads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field w-full"
          />
        </div>

        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {filteredTeams.map((team) => (
            <div key={team.id} className="border border-white/10 rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                    {(team as any).logo ? (
                      <img src={(team as any).logo} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-white">{team.name.charAt(0)}</span>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-400 transition-colors">
                    <Upload className="w-3 h-3 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(team.id, e)} onClick={e => e.stopPropagation()} />
                  </label>
                </div>

                <div className="flex-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={team.name}
                    onChange={e => updateTeam(team.id, "name", e.target.value)}
                    className="bg-transparent text-white font-semibold text-lg border-b border-transparent hover:border-white/30 focus:border-blue-500 outline-none w-full transition-colors"
                    placeholder="Team name"
                  />
                  <p className="text-gray-500 text-xs">{team.players.length} players</p>
                </div>

                <div className="text-gray-400">
                  {expandedTeam === team.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {expandedTeam === team.id && (
                <div className="p-4 space-y-3 bg-black/20">
                  {team.players.map((player, idx) => (
                    <div key={player.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
                          {(player as any).photo ? (
                            <img src={(player as any).photo} alt={player.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-400 transition-colors">
                          <Upload className="w-2.5 h-2.5 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={e => handlePlayerPhotoUpload(team.id, player.id, e)} />
                        </label>
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={player.name}
                          onChange={e => updatePlayer(team.id, player.id, "name", e.target.value)}
                          className="input-field text-sm py-1.5"
                          placeholder="Display name"
                        />
                        <input
                          type="text"
                          value={(player as any).ign || ""}
                          onChange={e => updatePlayer(team.id, player.id, "ign", e.target.value)}
                          className="input-field text-sm py-1.5"
                          placeholder="IGN"
                        />
                        <select
                          value={player.role || "Fragger"}
                          onChange={e => updatePlayer(team.id, player.id, "role", e.target.value)}
                          className="input-field text-sm py-1.5"
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>

                      <span className="text-gray-600 text-xs w-4 text-center">#{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-between items-center">
          <p className="text-gray-500 text-sm">Changes saved to this tournament only</p>
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-2">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
