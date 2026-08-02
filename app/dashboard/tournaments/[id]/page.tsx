"use client";
import dynamic from "next/dynamic";
const TeamEditor = dynamic(() => import("@/components/tournament/TeamEditor"), { ssr: false });
import { useState } from "react";
import { Trophy, Skull, Crosshair, Zap, Save, Sparkles, ChevronLeft } from "lucide-react";
import type { Tournament, Match, TeamMatchResult, PlayerMatchStats } from "@/types/tournament";
import { submitMatchResults, generateDemoResults } from "@/lib/storage/tournaments";

interface Props {
  tournament: Tournament;
  match: Match;
  onSubmit: (updated: Tournament) => void;
  onClose: () => void;
}

export default function MatchResultEntry({ tournament, match, onSubmit, onClose }: Props) {
  const [results, setResults] = useState<TeamMatchResult[]>(() => {
    if (match.results && match.results.length > 0) return match.results;
    return tournament.teams.map((team, i) => ({
      teamId: team.id,
      teamName: team.name,
      placement: i + 1,
      kills: 0, deaths: 0, assists: 0, damage: 0,
      placementPoints: 0, killPoints: 0, bonusPoints: 0, penaltyPoints: 0, totalPoints: 0,
      players: team.players.map(p => ({
        playerId: p.id, name: p.name, ign: p.ign,
        kills: 0, deaths: 0, assists: 0, damage: 0,
        headshots: 0, knockdowns: 0, survived: false,
      })),
    }));
  });

  const [activeTeamIdx, setActiveTeamIdx] = useState(0);

  const updateTeamField = (idx: number, field: string, value: any) => {
    const updated = [...results];
    (updated[idx] as any)[field] = Number(value) || 0;
    recalculate(updated, idx);
    setResults(updated);
  };

  const updatePlayerField = (teamIdx: number, playerIdx: number, field: string, value: any) => {
    const updated = [...results];
    (updated[teamIdx].players[playerIdx] as any)[field] = field === "survived" ? value : (Number(value) || 0);
    // Sum player kills to team kills
    updated[teamIdx].kills = updated[teamIdx].players.reduce((a, p) => a + p.kills, 0);
    updated[teamIdx].deaths = updated[teamIdx].players.reduce((a, p) => a + p.deaths, 0);
    updated[teamIdx].damage = updated[teamIdx].players.reduce((a, p) => a + p.damage, 0);
    updated[teamIdx].assists = updated[teamIdx].players.reduce((a, p) => a + p.assists, 0);
    recalculate(updated, teamIdx);
    setResults(updated);
  };

  const recalculate = (data: TeamMatchResult[], idx: number) => {
    const r = data[idx];
    const rule = tournament.scoringRule;
    r.placementPoints = rule.placements[r.placement] || 0;
    r.killPoints = r.kills * rule.killPoints;
    r.bonusPoints = r.placement === 1 ? rule.winnerBonus : 0;
    r.totalPoints = r.placementPoints + r.killPoints + r.bonusPoints - r.penaltyPoints;
  };

  const handleAutoGenerate = () => {
    const generated = generateDemoResults(tournament, match.id);
    setResults(generated);
  };

  const handleSubmit = () => {
    const updated = submitMatchResults(tournament.id, match.id, results);
    if (updated) onSubmit(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-10 h-10 rounded-lg glass border border-white/10 flex items-center justify-center hover:bg-white/5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-display font-black text-2xl">Match {match.matchNumber} Results</h2>
              <p className="text-sm text-white/60">{tournament.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAutoGenerate} className="btn-ghost text-xs py-2 px-3 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Demo Data
            </button>
            <button onClick={handleSubmit} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Results
            </button>
          </div>
        </div>

        {/* Team tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
          {results.map((r, i) => (
            <button
              key={r.teamId}
              onClick={() => setActiveTeamIdx(i)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                activeTeamIdx === i
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              #{r.placement} {r.teamName}
            </button>
          ))}
        </div>

        {/* Active team result entry */}
        {results[activeTeamIdx] && (
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="font-display font-bold text-lg">{results[activeTeamIdx].teamName}</h3>

            {/* Team stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Placement", field: "placement", icon: Trophy, color: "text-yellow-400" },
                { label: "Team Kills", field: "kills", icon: Skull, color: "text-red-400", readonly: true },
                { label: "Team Deaths", field: "deaths", icon: Crosshair, color: "text-orange-400", readonly: true },
                { label: "Team Damage", field: "damage", icon: Zap, color: "text-cyan-400", readonly: true },
                { label: "Penalty", field: "penaltyPoints", icon: Zap, color: "text-red-500" },
              ].map(stat => (
                <div key={stat.field} className="glass rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">{stat.label}</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={(results[activeTeamIdx] as any)[stat.field]}
                    onChange={e => updateTeamField(activeTeamIdx, stat.field, e.target.value)}
                    className="input text-xl font-display font-black py-2 text-center"
                    readOnly={(stat as any).readonly}
                  />
                </div>
              ))}
            </div>

            {/* Points breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="glass rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1">Placement</div>
                <div className="font-display font-black text-lg text-yellow-400">{results[activeTeamIdx].placementPoints}</div>
              </div>
              <div className="glass rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1">Kill Pts</div>
                <div className="font-display font-black text-lg text-red-400">{results[activeTeamIdx].killPoints}</div>
              </div>
              <div className="glass rounded-lg p-3 border border-white/5">
                <div className="text-xs text-white/50 mb-1">Bonus</div>
                <div className="font-display font-black text-lg text-green-400">{results[activeTeamIdx].bonusPoints}</div>
              </div>
              <div className="glass rounded-lg p-3 border border-indigo-500/30 bg-indigo-500/10">
                <div className="text-xs text-white/50 mb-1">TOTAL</div>
                <div className="font-display font-black text-xl text-cyan-400">{results[activeTeamIdx].totalPoints}</div>
              </div>
            </div>

            {/* Player stats */}
            <div>
              <h4 className="font-display font-bold text-sm mb-3 uppercase tracking-wider text-white/70">Player Statistics</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase text-white/50 border-b border-white/10">
                    <tr>
                      <th className="p-2 text-left">Player</th>
                      <th className="p-2 text-center">Kills</th>
                      <th className="p-2 text-center">Deaths</th>
                      <th className="p-2 text-center">Assists</th>
                      <th className="p-2 text-center">Damage</th>
                      <th className="p-2 text-center">HS</th>
                      <th className="p-2 text-center">KNCKS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results[activeTeamIdx].players.map((player, pIdx) => (
                      <tr key={player.playerId} className="border-b border-white/5">
                        <td className="p-2">
                          <div className="font-semibold">{player.ign}</div>
                          <div className="text-[10px] text-white/40">{player.name}</div>
                        </td>
                        {(["kills", "deaths", "assists", "damage", "headshots", "knockdowns"] as const).map(field => (
                          <td key={field} className="p-2">
                            <input
                              type="number"
                              min={0}
                              value={player[field]}
                              onChange={e => updatePlayerField(activeTeamIdx, pIdx, field, e.target.value)}
                              className="w-16 text-center bg-white/5 rounded px-2 py-1.5 text-sm font-bold border border-white/10 focus:border-indigo-500 focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTeamEditor && (
        <TeamEditor
          teams={tournament.teams}
          onSave={(updated: any[]) => {
            tournament.teams = updated;
            try {
              const all = JSON.parse(localStorage.getItem("tournaops_tournaments") || "[]");
              const idx = all.findIndex((t: any) => t.id === tournament.id);
              if (idx >= 0) all[idx] = tournament;
              localStorage.setItem("tournaops_tournaments", JSON.stringify(all));
              setTournament({ ...tournament });
            } catch {}
            setShowTeamEditor(false);
          }}
          onClose={() => setShowTeamEditor(false)}
        />
      )}
    </div>
  );
}