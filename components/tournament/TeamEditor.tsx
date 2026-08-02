"use client";

import { useState, useRef } from "react";
import {
  X, Upload, User, Save, ChevronDown, ChevronUp,
  Search, Users, Shield, Crosshair, Eye, Trash2,
  Plus, Check, AlertCircle, Image, Crown, Star,
  RefreshCw, Copy, Download
} from "lucide-react";
import { Tournament, Team, Player } from "@/types/tournament";
import { saveTournament } from "@/lib/storage/tournaments";

interface TeamEditorProps {
  tournament: Tournament;
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

const ROLES = ["IGL", "Fragger", "Support", "Entry", "Sniper", "Assaulter", "Scout"];

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  IGL: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  Fragger: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  Support: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  Entry: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  Sniper: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  Assaulter: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  Scout: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
};

const TEAM_COLORS = [
  "from-blue-500/30 to-blue-600/10",
  "from-purple-500/30 to-purple-600/10",
  "from-red-500/30 to-red-600/10",
  "from-green-500/30 to-green-600/10",
  "from-orange-500/30 to-orange-600/10",
  "from-cyan-500/30 to-cyan-600/10",
  "from-pink-500/30 to-pink-600/10",
  "from-yellow-500/30 to-yellow-600/10",
];

export default function TeamEditor({ tournament, onClose, onSave }: TeamEditorProps) {
  const [teams, setTeams] = useState<Team[]>(JSON.parse(JSON.stringify(tournament.teams)));
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState<"list" | "grid">("list");
  const [hasChanges, setHasChanges] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.players.some(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.ign && p.ign.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const markChanged = () => setHasChanges(true);

  const updateTeam = (teamId: string, field: string, value: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, [field]: value } : t));
    markChanged();
  };

  const updatePlayer = (teamId: string, playerId: string, field: string, value: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      return { ...t, players: t.players.map(p => p.id === playerId ? { ...p, [field]: value } : p) };
    }));
    markChanged();
  };

  const addPlayer = (teamId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 10),
        name: `Player ${t.players.length + 1}`,
        ign: "",
        role: "Support",
      };
      return { ...t, players: [...t.players, newPlayer] };
    }));
    markChanged();
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      if (t.players.length <= 1) return t;
      return { ...t, players: t.players.filter(p => p.id !== playerId) };
    }));
    markChanged();
  };

  const handleLogoUpload = (teamId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      alert("Image too large. Max 500KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateTeam(teamId, "logo", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlayerPhotoUpload = (teamId: string, playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 300000) {
      alert("Image too large. Max 300KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updatePlayer(teamId, playerId, "photo", ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (teamId: string) => {
    updateTeam(teamId, "logo", "");
  };

  const removePlayerPhoto = (teamId: string, playerId: string) => {
    updatePlayer(teamId, playerId, "photo", "");
  };

  const toggleSelectTeam = (teamId: string) => {
    const next = new Set(selectedTeams);
    if (next.has(teamId)) next.delete(teamId);
    else next.add(teamId);
    setSelectedTeams(next);
  };

  const selectAll = () => {
    if (selectedTeams.size === filteredTeams.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(filteredTeams.map(t => t.id)));
    }
  };

  const resetTeamNames = () => {
    setTeams(prev => prev.map((t, i) => ({
      ...t,
      name: `Team ${i + 1}`,
      players: t.players.map((p, j) => ({
        ...p,
        name: `Player ${j + 1}`,
        ign: `T${i + 1}_P${j + 1}`,
      }))
    })));
    markChanged();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = { ...tournament, teams };
      saveTournament(updated);
      onSave(updated);
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const totalPlayers = teams.reduce((a, t) => a + t.players.length, 0);
  const teamsWithLogos = teams.filter(t => (t as any).logo).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-4 sm:py-8">
      <div className="w-full max-w-5xl mx-3 sm:mx-4">
        <div className="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

          {/* ── HEADER ──────────────────────────────────────── */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-400" />
                Squad Manager
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-gray-500 text-sm">{teams.length} squads</span>
                <span className="text-gray-700">·</span>
                <span className="text-gray-500 text-sm">{totalPlayers} players</span>
                <span className="text-gray-700">·</span>
                <span className="text-gray-500 text-sm">{teamsWithLogos} logos</span>
                {hasChanges && (
                  <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  saved ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                  hasChanges ? "btn-primary" :
                  "bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed"
                }`}
              >
                {saved ? (
                  <><Check className="w-4 h-4" />Saved!</>
                ) : saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save All</>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── TOOLBAR ─────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-white/8 bg-white/2">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search squads or players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedTeam(expandedTeam ? null : filteredTeams[0]?.id || null)}
                className="btn-ghost text-xs px-3 py-2"
                title="Toggle all"
              >
                {expandedTeam ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                {expandedTeam ? "Collapse" : "Expand"}
              </button>

              <button
                onClick={resetTeamNames}
                className="btn-ghost text-xs px-3 py-2"
                title="Reset all names"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Reset Names
              </button>
            </div>

            {/* Result count */}
            {search && (
              <span className="text-gray-600 text-xs">
                {filteredTeams.length} of {teams.length} squads
              </span>
            )}
          </div>

          {/* ── TEAMS LIST ──────────────────────────────────── */}
          <div className="max-h-[65vh] overflow-y-auto scrollbar-thin">
            {filteredTeams.length === 0 ? (
              <div className="p-16 text-center">
                <Search className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No squads match &quot;{search}&quot;</p>
                <button onClick={() => setSearch("")} className="text-blue-400 text-sm mt-2 hover:text-blue-300">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {filteredTeams.map((team, teamIdx) => {
                  const isExpanded = expandedTeam === team.id;
                  const colorGradient = TEAM_COLORS[teamIdx % TEAM_COLORS.length];

                  return (
                    <div key={team.id} className={`transition-all ${isExpanded ? "bg-white/3" : ""}`}>

                      {/* ── TEAM ROW ────────────────────────── */}
                      <div
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 cursor-pointer hover:bg-white/4 transition-colors group"
                        onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                      >
                        {/* Team Number */}
                        <span className="text-gray-600 text-xs font-mono w-6 text-right flex-shrink-0">
                          {teamIdx + 1}
                        </span>

                        {/* Logo */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center overflow-hidden border border-white/15 shadow-sm`}>
                            {(team as any).logo ? (
                              <img src={(team as any).logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-base font-bold text-white/80">{team.name.charAt(0)}</span>
                            )}
                          </div>
                          <label
                            className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-400 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                            onClick={e => e.stopPropagation()}
                          >
                            <Image className="w-2.5 h-2.5 text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleLogoUpload(team.id, e)} />
                          </label>
                        </div>

                        {/* Team Name Input */}
                        <div className="flex-1 min-w-0" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={team.name}
                            onChange={e => updateTeam(team.id, "name", e.target.value)}
                            className="bg-transparent text-white font-semibold text-base border-b border-transparent hover:border-white/20 focus:border-blue-500 outline-none w-full transition-all"
                            placeholder="Squad name"
                          />
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-gray-600 text-xs">{team.players.length} players</span>
                            {/* Show roles */}
                            <div className="flex gap-1 overflow-hidden">
                              {team.players.slice(0, 4).map(p => {
                                const rc = ROLE_COLORS[p.role || "Support"] || ROLE_COLORS.Support;
                                return (
                                  <span key={p.id} className={`${rc.bg} ${rc.text} text-[9px] px-1.5 py-0.5 rounded-full border ${rc.border}`}>
                                    {(p.role || "SUP").substring(0, 3)}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Tag */}
                        <div className="hidden sm:block" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={(team as any).tag || ""}
                            onChange={e => updateTeam(team.id, "tag", e.target.value.toUpperCase().substring(0, 4))}
                            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-gray-300 w-16 text-center font-mono uppercase focus:border-blue-500 outline-none"
                            placeholder="TAG"
                            maxLength={4}
                          />
                        </div>

                        {/* Remove Logo */}
                        {(team as any).logo && (
                          <button
                            onClick={e => { e.stopPropagation(); removeLogo(team.id); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Expand Icon */}
                        <div className="text-gray-500 flex-shrink-0">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* ── PLAYER CARDS (Expanded) ─────────── */}
                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-5 space-y-2.5 animate-fade-in">
                          {/* Column Headers */}
                          <div className="grid grid-cols-12 gap-2 text-[10px] text-gray-600 uppercase tracking-wider px-3 pt-2 pb-1">
                            <div className="col-span-1"></div>
                            <div className="col-span-3">Name</div>
                            <div className="col-span-3">In-Game Name</div>
                            <div className="col-span-2">Role</div>
                            <div className="col-span-2">Photo</div>
                            <div className="col-span-1"></div>
                          </div>

                          {team.players.map((player, pIdx) => {
                            const rc = ROLE_COLORS[player.role || "Support"] || ROLE_COLORS.Support;

                            return (
                              <div
                                key={player.id}
                                className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all group/player"
                              >
                                {/* Player Photo */}
                                <div className="col-span-1 flex justify-center">
                                  <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center overflow-hidden border border-white/15">
                                      {(player as any).photo ? (
                                        <img src={(player as any).photo} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-4 h-4 text-gray-500" />
                                      )}
                                    </div>
                                    {pIdx === 0 && (
                                      <Crown className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1" />
                                    )}
                                  </div>
                                </div>

                                {/* Display Name */}
                                <div className="col-span-3">
                                  <input
                                    type="text"
                                    value={player.name}
                                    onChange={e => updatePlayer(team.id, player.id, "name", e.target.value)}
                                    className="input-field text-sm py-1.5 bg-white/3"
                                    placeholder="Display name"
                                  />
                                </div>

                                {/* IGN */}
                                <div className="col-span-3">
                                  <input
                                    type="text"
                                    value={(player as any).ign || ""}
                                    onChange={e => updatePlayer(team.id, player.id, "ign", e.target.value)}
                                    className="input-field text-sm py-1.5 bg-white/3 font-mono"
                                    placeholder="In-game name"
                                  />
                                </div>

                                {/* Role */}
                                <div className="col-span-2">
                                  <select
                                    value={player.role || "Support"}
                                    onChange={e => updatePlayer(team.id, player.id, "role", e.target.value)}
                                    className={`w-full rounded-lg text-xs py-2 px-2 border outline-none cursor-pointer transition-all ${rc.bg} ${rc.text} ${rc.border}`}
                                  >
                                    {ROLES.map(r => <option key={r} value={r} className="bg-[#1a1a2e] text-white">{r}</option>)}
                                  </select>
                                </div>

                                {/* Photo Upload */}
                                <div className="col-span-2 flex items-center gap-1.5">
                                  <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors text-xs text-gray-400 hover:text-gray-200">
                                    <Upload className="w-3 h-3" />
                                    <span className="hidden sm:inline">{(player as any).photo ? "Change" : "Upload"}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={e => handlePlayerPhotoUpload(team.id, player.id, e)} />
                                  </label>
                                  {(player as any).photo && (
                                    <button
                                      onClick={() => removePlayerPhoto(team.id, player.id)}
                                      className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                {/* Remove Player */}
                                <div className="col-span-1 flex justify-center">
                                  {team.players.length > 1 && (
                                    <button
                                      onClick={() => removePlayer(team.id, player.id)}
                                      className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover/player:opacity-100"
                                      title="Remove player"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Player Button */}
                          <button
                            onClick={() => addPlayer(team.id)}
                            className="w-full py-2.5 rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/30 text-gray-500 hover:text-blue-400 text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-blue-500/5"
                          >
                            <Plus className="w-4 h-4" />
                            Add Player
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── FOOTER ──────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-white/10 bg-white/3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">
                {teams.length} squads · {totalPlayers} players
              </span>
              {hasChanges && (
                <span className="flex items-center gap-1.5 text-yellow-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Don&apos;t forget to save
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="btn-secondary px-5 py-2">
                {hasChanges ? "Discard" : "Close"}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
                  saved ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                  hasChanges ? "btn-primary" :
                  "bg-white/5 text-gray-600 border border-white/10 cursor-not-allowed"
                }`}
              >
                {saved ? (
                  <><Check className="w-4 h-4" />Saved!</>
                ) : saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : (
                  <><Save className="w-4 h-4" />Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}