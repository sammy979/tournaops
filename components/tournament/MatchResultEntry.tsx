"use client";

import { useState } from "react";
import { X, Save, Zap, Trophy, Crosshair, Shield } from "lucide-react";
import { Tournament, Match, Team } from "@/types/tournament";
import { submitMatchResults, generateDemoResults } from "@/lib/storage/tournaments";

interface MatchResultEntryProps {
  tournament: Tournament;
  match: Match;
  teams: Team[];
  onClose: () => void;
  onSave: (updated: Tournament) => void;
}

interface PlayerEntry {
  playerId: string;
  playerName: string;
  kills: number;
  damage: number;
  survived: boolean;
}

interface TeamEntry {
  teamId: string;
  teamName: string;
  placement: number;
  players: PlayerEntry[];
}

export default function MatchResultEntry({ tournament, match, teams, onClose, onSave }: MatchResultEntryProps) {
  const initEntries = (): TeamEntry[] =>
    teams.map((team, idx) => ({
      teamId: team.id,
      teamName: team.name,
      placement: idx + 1,
      players: (team.players ?? []).map(p => ({
        playerId: p.id,
        playerName: p.name,
        kills: 0,
        damage: 0,
        survived: false,
      })),
    }));

  const [entries, setEntries] = useState<TeamEntry[]>(initEntries);
  const [saving, setSaving] = useState(false);
  const [activeTeam, setActiveTeam] = useState<string>(teams[0]?.id || "");
  const [view, setView] = useState<"placement" | "players">("placement");

  const updatePlacement = (teamId: string, placement: number) => {
    setEntries(prev => prev.map(e => e.teamId === teamId ? { ...e, placement } : e));
  };

  const updatePlayer = (teamId: string, playerId: string, field: string, value: number | boolean) => {
    setEntries(prev => prev.map(e => {
      if (e.teamId !== teamId) return e;
      return { ...e, players: e.players.map(p => p.playerId === playerId ? { ...p, [field]: value } : p) };
    }));
  };

  const handleDemoFill = () => {
    const demoResults = generateDemoResults(tournament, match.id);
    const demoEntries = demoResults.map(r => {
      const team = teams.find(t => t.id === r.teamId);
      return {
        teamId: r.teamId,
        teamName: team?.name || r.teamId,
        placement: r.placement,
        players: (r.playerResults ?? []).map(pr => ({
          playerId: pr.playerId,
          playerName: pr.playerName,
          kills: pr.kills,
          damage: pr.damage,
          survived: pr.survived ?? false,
        }))
      };
    });
    setEntries(demoEntries);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const results = entries.map(e => {
        const scoring = tournament.scoringRule;
        const placementPts = scoring.placementPoints[e.placement - 1] || 0;
        const totalKills = e.players.reduce((a, p) => a + p.kills, 0);
        const killPts = totalKills * scoring.killPoints;
        return {
          teamId: e.teamId,
          teamName: e.teamName,
          placement: e.placement,
          placementPoints: placementPts,
          killPoints: killPts,
          totalPoints: placementPts + killPts,
          kills: totalKills,
          damage: e.players.reduce((a, p) => a + p.damage, 0),
          playerResults: e.players.map(p => ({
            playerId: p.playerId,
            playerName: p.playerName,
            kills: p.kills,
            damage: p.damage,
            survived: p.survived,
            assists: 0,
          })),
          wwcd: e.placement === 1,
        };
      });
      const updated = await submitMatchResults(tournament.id, match.id, results);
      if (updated) onSave(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const sortedByPlacement = [...entries].sort((a, b) => a.placement - b.placement);
  const activeEntry = entries.find(e => e.teamId === activeTeam);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-5xl mx-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Enter Match Results</h2>
            <p className="text-gray-400 text-sm mt-1">{match.name}  {teams.length} squads  {match.map}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleDemoFill} className="btn-secondary flex items-center gap-2 px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Auto Fill Demo
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setView("placement")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "placement" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />Placements
          </button>
          <button
            onClick={() => setView("players")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${view === "players" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
          >
            <Crosshair className="w-4 h-4 inline mr-2" />Player Stats
          </button>
        </div>

        {view === "placement" && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase px-3 pb-2">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Squad</div>
              <div className="col-span-2 text-center">Placement</div>
              <div className="col-span-2 text-center">Kills</div>
              <div className="col-span-2 text-center">Damage</div>
              <div className="col-span-1 text-center">Pts</div>
            </div>
            {sortedByPlacement.map((entry, idx) => {
              const placePts = tournament.scoringRule.placementPoints[entry.placement - 1] || 0;
              const kills = entry.players.reduce((a, p) => a + p.kills, 0);
              const damage = entry.players.reduce((a, p) => a + p.damage, 0);
              const total = placePts + kills * tournament.scoringRule.killPoints;
              return (
                <div key={entry.teamId} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-lg border ${entry.placement === 1 ? "border-yellow-500/40 bg-yellow-500/5" : "border-white/5 bg-white/3"}`}>
                  <div className="col-span-1 text-gray-500 font-mono text-sm">#{idx + 1}</div>
                  <div className="col-span-4 text-white font-medium text-sm truncate">{entry.teamName}</div>
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="number" min={1} max={teams.length}
                      value={entry.placement}
                      onChange={e => updatePlacement(entry.teamId, parseInt(e.target.value) || 1)}
                      className="input-field text-center py-1 px-2 w-16 text-sm"
                    />
                  </div>
                  <div className="col-span-2 text-center text-white font-mono font-bold">{kills}</div>
                  <div className="col-span-2 text-center text-orange-400 font-mono text-sm">{damage.toLocaleString()}</div>
                  <div className="col-span-1 text-center text-blue-400 font-bold font-mono text-sm">{total}</div>
                </div>
              );
            })}
          </div>
        )}

        {view === "players" && (
          <div className="flex h-[60vh]">
            <div className="w-56 border-r border-white/10 overflow-y-auto">
              {entries.map(entry => (
                <button
                  key={entry.teamId}
                  onClick={() => setActiveTeam(entry.teamId)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-white/5 transition-colors ${activeTeam === entry.teamId ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                >
                  <div className="font-medium truncate">{entry.teamName}</div>
                  <div className="text-xs opacity-60">{entry.players.reduce((a, p) => a + p.kills, 0)}K  #{entry.placement}</div>
                </button>
              ))}
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              {activeEntry && (
                <div className="space-y-3">
                  <h3 className="text-white font-semibold mb-4">{activeEntry.teamName}</h3>
                  <div className="grid grid-cols-12 gap-3 text-xs text-gray-500 uppercase px-2">
                    <div className="col-span-4">Player</div>
                    <div className="col-span-2 text-center">Kills</div>
                    <div className="col-span-3 text-center">Damage</div>
                    <div className="col-span-3 text-center">Survived</div>
                  </div>
                  {activeEntry.players.map(player => (
                    <div key={player.playerId} className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="col-span-4 text-white text-sm font-medium">{player.playerName}</div>
                      <div className="col-span-2">
                        <input type="number" min={0} max={99} value={player.kills}
                          onChange={e => updatePlayer(activeEntry.teamId, player.playerId, "kills", parseInt(e.target.value) || 0)}
                          className="input-field text-center py-1 px-2 w-full text-sm" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min={0} max={9999} value={player.damage}
                          onChange={e => updatePlayer(activeEntry.teamId, player.playerId, "damage", parseInt(e.target.value) || 0)}
                          className="input-field text-center py-1 px-2 w-full text-sm" />
                      </div>
                      <div className="col-span-3 flex justify-center">
                        <button
                          onClick={() => updatePlayer(activeEntry.teamId, player.playerId, "survived", !player.survived)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${player.survived ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-white/5 text-gray-500 border border-white/10"}`}
                        >
                          <Shield className="w-3 h-3" />
                          {player.survived ? "Alive" : "Dead"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Total kills: <span className="text-white font-bold">{entries.reduce((a, e) => a + e.players.reduce((b, p) => b + p.kills, 0), 0)}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary px-6 py-2">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-2 flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Results"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}