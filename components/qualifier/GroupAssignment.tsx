"use client";

import { useState, useEffect } from "react";
import {
  Users, Shuffle, Award, Search, X, Move, Lock,
  Check, RefreshCw, AlertTriangle, Zap, Trophy
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  seed?: number;
}

interface Group {
  id: string;
  name: string;
  teamIds: string[];
}

interface GroupAssignmentProps {
  stageId: string;
  teams: Team[];
  groups: Group[];
  isLocked: boolean;
  onUpdate: () => void;
  onClose: () => void;
}

export default function GroupAssignment({ stageId, teams, groups: initialGroups, isLocked, onUpdate, onClose }: GroupAssignmentProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const teamMap = Object.fromEntries(teams.map(t => [t.id, t]));

  // Unassigned teams
  const assignedIds = new Set(groups.flatMap(g => g.teamIds));
  const unassignedTeams = teams.filter(t => !assignedIds.has(t.id));

  const filteredUnassigned = unassignedTeams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  //  DRAG & DROP 
  const handleDragStart = (teamId: string) => {
    if (isLocked) return;
    setDraggedTeam(teamId);
  };

  const handleDragOver = (e: React.DragEvent, groupId: string | "unassigned") => {
    if (isLocked) return;
    e.preventDefault();
    setDropTarget(groupId);
  };

  const handleDragLeave = () => setDropTarget(null);

  const handleDrop = (e: React.DragEvent, targetGroupId: string | "unassigned") => {
    e.preventDefault();
    if (!draggedTeam || isLocked) return;

    setGroups(prev => {
      const next = prev.map(g => ({ ...g, teamIds: g.teamIds.filter(id => id !== draggedTeam) }));
      if (targetGroupId !== "unassigned") {
        const target = next.find(g => g.id === targetGroupId);
        if (target && !target.teamIds.includes(draggedTeam)) {
          target.teamIds.push(draggedTeam);
        }
      }
      return next;
    });

    setDraggedTeam(null);
    setDropTarget(null);
  };

  //  AUTO ASSIGN 
  const autoAssign = async (mode: "random" | "seeded" | "regional" | "snake" | "from_previous") => {
    if (isLocked) return;
    setRandomizing(true);
    try {
      const res = await fetch(`/api/stages/${stageId}/assign-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data.stage.groups);
      }
    } finally {
      setRandomizing(false);
    }
  };

  //  SAVE MANUAL 
  const saveManual = async () => {
    setSaving(true);
    const assignments = Object.fromEntries(groups.map(g => [g.id, g.teamIds]));
    try {
      const res = await fetch(`/api/stages/${stageId}/assign-teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "manual", assignments }),
      });
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        alert("Failed to save");
      }
    } finally {
      setSaving(false);
    }
  };

  const totalAssigned = groups.reduce((sum, g) => sum + g.teamIds.length, 0);
  const balanced = groups.every(g => g.teamIds.length === groups[0]?.teamIds.length);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="glass-card w-full max-w-6xl mx-4 rounded-2xl border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Group Assignment
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {totalAssigned}/{teams.length} teams  {groups.length} groups
              {balanced && <span className="text-green-400 ml-2"> Balanced </span>}
              {isLocked && <span className="text-yellow-400 ml-2"> Locked </span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isLocked && (
              <button onClick={saveManual} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                {saving ? "Saving..." : <><Check className="w-4 h-4" />Save Assignment</>}
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auto Assign Buttons */}
        {!isLocked && (
          <div className="p-4 border-b border-white/10 bg-white/2 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quick Assign:</span>
            <button onClick={() => autoAssign("random")} disabled={randomizing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20">
              <Shuffle className="w-3 h-3" />Random Draw
            </button>
            <button onClick={() => autoAssign("seeded")} disabled={randomizing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20">
              <Trophy className="w-3 h-3" />Seeded (Snake Draft)
            </button>
            <button onClick={() => autoAssign("regional")} disabled={randomizing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/20">
              <Award className="w-3 h-3" />Regional Balance
            </button>

            <button onClick={() => autoAssign("snake")} disabled={randomizing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium hover:bg-orange-500/20">
              <Zap className="w-3 h-3" />Snake Seeding
            </button>
            <button onClick={() => autoAssign("from_previous")} disabled={randomizing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium hover:bg-yellow-500/20">
              <Trophy className="w-3 h-3" />Import from Previous Stage
            </button>
            {randomizing && (
              <span className="text-xs text-yellow-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Working...</span>
            )}
          </div>
        )}

        {/* Content: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-5 max-h-[70vh] overflow-y-auto">

          {/* LEFT: Unassigned Teams */}
          <div className="lg:col-span-1">
            <div className={`glass-card rounded-xl border p-4 ${dropTarget === "unassigned" ? "border-blue-500 bg-blue-500/10" : "border-white/10"}`}
              onDragOver={e => handleDragOver(e, "unassigned")}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, "unassigned")}
            >
              <h3 className="text-white font-bold text-sm mb-3 flex items-center justify-between">
                <span>Unassigned ({unassignedTeams.length})</span>
              </h3>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-9 text-xs py-1.5"
                />
              </div>

              <div className="space-y-1 max-h-96 overflow-y-auto">
                {filteredUnassigned.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 text-xs">
                    {search ? "No matches" : "All teams assigned!"}
                  </div>
                ) : (
                  filteredUnassigned.map(team => (
                    <div
                      key={team.id}
                      draggable={!isLocked}
                      onDragStart={() => handleDragStart(team.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg bg-white/4 border border-white/8 transition-all ${
                        !isLocked ? "cursor-move hover:bg-white/10 hover:border-blue-500/30" : "opacity-60"
                      } ${draggedTeam === team.id ? "opacity-40" : ""}`}
                    >
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-xs">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-white text-xs font-medium truncate flex-1">{team.name}</span>
                      {team.seed && <span className="text-gray-600 text-[10px] font-mono">#{team.seed}</span>}
                      {!isLocked && <Move className="w-3 h-3 text-gray-600 flex-shrink-0" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Groups Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {groups.map((group, gIdx) => {
                const isDropping = dropTarget === group.id;
                const isFull = group.teamIds.length >= 16;
                const groupTeams = group.teamIds.map(id => teamMap[id]).filter(Boolean);

                return (
                  <div
                    key={group.id}
                    className={`glass-card rounded-xl border p-4 transition-all ${
                      isDropping ? "border-blue-500 bg-blue-500/10 scale-[1.02]" : "border-white/10"
                    }`}
                    onDragOver={e => handleDragOver(e, group.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, group.id)}
                  >
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                          gIdx === 0 ? "bg-blue-500/20 text-blue-400" :
                          gIdx === 1 ? "bg-purple-500/20 text-purple-400" :
                          gIdx === 2 ? "bg-green-500/20 text-green-400" :
                          "bg-orange-500/20 text-orange-400"
                        }`}>
                          {String.fromCharCode(65 + gIdx)}
                        </div>
                        {group.name}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isFull ? "bg-yellow-500/20 text-yellow-400" : "bg-white/5 text-gray-500"}`}>
                        {group.teamIds.length}/16
                      </span>
                    </h3>

                    <div className="space-y-1 min-h-32 max-h-64 overflow-y-auto">
                      {groupTeams.length === 0 ? (
                        <div className="text-center py-8 text-gray-700 text-xs border-2 border-dashed border-white/8 rounded-lg">
                          Drop teams here
                        </div>
                      ) : (
                        groupTeams.map((team, tIdx) => (
                          <div
                            key={team.id}
                            draggable={!isLocked}
                            onDragStart={() => handleDragStart(team.id)}
                            className={`flex items-center gap-2 p-1.5 rounded-lg bg-white/3 border border-white/6 transition-all ${
                              !isLocked ? "cursor-move hover:bg-white/8 hover:border-blue-500/30" : ""
                            } ${draggedTeam === team.id ? "opacity-40" : ""}`}
                          >
                            <span className="text-gray-600 font-mono text-[10px] w-4 text-center">{tIdx + 1}</span>
                            {team.logo ? (
                              <img src={team.logo} alt="" className="w-5 h-5 rounded object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white font-bold text-[10px]">
                                {team.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-white text-xs font-medium truncate flex-1">{team.name}</span>
                            {team.tag && <span className="text-gray-600 text-[9px] font-mono">{team.tag}</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {!balanced && groups.some(g => g.teamIds.length > 0) && (
              <div className="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2 text-yellow-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                Groups are not balanced. Some groups have more teams than others.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}