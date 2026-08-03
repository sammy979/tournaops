"use client";

import { useState } from "react";
import { X, Crosshair, Flame, Shield, Trophy, Target, ChevronDown, ChevronUp, Crown, Zap, Award } from "lucide-react";
import { Tournament } from "@/types/tournament";
import { getTopPlayers, getLeaderboard } from "@/lib/storage/tournaments";

interface PlayerStatsProps {
  tournament: Tournament;
  onClose: () => void;
}

type SortBy = "kills" | "damage" | "kpm";
type View = "killers" | "damage" | "teams";

export default function PlayerStats({ tournament, onClose }: PlayerStatsProps) {
  const [view, setView] = useState<View>("killers");
  const { topKillers, topDamage, topKD } = getTopPlayers(tournament);
  const leaderboard = getLeaderboard(tournament);

  const MVP = topKillers[0];
  const DAMAGE_KING = topDamage[0];

  const views: { id: View; label: string; icon: any }[] = [
    { id: "killers", label: "Top Killers", icon: Crosshair },
    { id: "damage", label: "Top Damage", icon: Flame },
    { id: "teams", label: "Team Stats", icon: Trophy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-8">
      <div className="glass-card w-full max-w-4xl mx-4 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Player & Team Stats
            </h2>
            <p className="text-gray-500 text-sm mt-1">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white border border-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MVP Cards */}
        {(MVP || DAMAGE_KING) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 border-b border-white/8">
            {MVP && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Top Fragger</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/30 to-red-500/20 flex items-center justify-center border border-orange-500/30 text-2xl font-bold text-white">
                    {MVP.playerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{MVP.playerName}</p>
                    <p className="text-gray-500 text-xs">{MVP.teamName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 text-3xl font-bold font-mono">{MVP.kills}</p>
                    <p className="text-gray-600 text-xs">KILLS</p>
                  </div>
                </div>
              </div>
            )}

            {DAMAGE_KING && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Damage King</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/20 flex items-center justify-center border border-purple-500/30 text-2xl font-bold text-white">
                    {DAMAGE_KING.playerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg">{DAMAGE_KING.playerName}</p>
                    <p className="text-gray-500 text-xs">{DAMAGE_KING.teamName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 text-3xl font-bold font-mono">{(DAMAGE_KING.damage / 1000).toFixed(1)}K</p>
                    <p className="text-gray-600 text-xs">DAMAGE</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-white/8">
          {views.map(v => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  view === v.id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />{v.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[55vh] overflow-y-auto">
          {view === "killers" && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 uppercase tracking-wider px-3 pb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-3">Team</div>
                <div className="col-span-2 text-center">Kills</div>
                <div className="col-span-2 text-center">Damage</div>
              </div>
              {topKillers.map((p, i) => (
                <div key={i} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl transition-colors ${
                  i < 3 ? "bg-orange-500/5 border border-orange-500/15" : "bg-white/3 border border-white/5"
                }`}>
                  <div className="col-span-1">
                    <span className={`font-mono font-bold text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-600"}`}>
                      {i < 3 ? ["","",""][i] : `${i+1}`}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <span className="text-white font-semibold text-sm">{p.playerName}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-gray-500 text-sm">{p.teamName}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-orange-400 font-bold font-mono">{p.kills}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-purple-400 font-mono text-sm">{p.damage?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {topKillers.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Crosshair className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No player data yet. Enter match results first.</p>
                </div>
              )}
            </div>
          )}

          {view === "damage" && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 uppercase tracking-wider px-3 pb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-3">Team</div>
                <div className="col-span-2 text-center">Damage</div>
                <div className="col-span-2 text-center">Kills</div>
              </div>
              {topDamage.map((p, i) => (
                <div key={i} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl transition-colors ${
                  i < 3 ? "bg-purple-500/5 border border-purple-500/15" : "bg-white/3 border border-white/5"
                }`}>
                  <div className="col-span-1">
                    <span className={`font-mono font-bold text-sm ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-600"}`}>
                      {i < 3 ? ["","",""][i] : `${i+1}`}
                    </span>
                  </div>
                  <div className="col-span-4 text-white font-semibold text-sm">{p.playerName}</div>
                  <div className="col-span-3 text-gray-500 text-sm">{p.teamName}</div>
                  <div className="col-span-2 text-center text-purple-400 font-bold font-mono">{p.damage?.toLocaleString()}</div>
                  <div className="col-span-2 text-center text-orange-400 font-mono text-sm">{p.kills}</div>
                </div>
              ))}
              {topDamage.length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Flame className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No damage data yet.</p>
                </div>
              )}
            </div>
          )}

          {view === "teams" && (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-600 uppercase tracking-wider px-3 pb-2">
                <div className="col-span-1">#</div>
                <div className="col-span-3">Team</div>
                <div className="col-span-1 text-center">M</div>
                <div className="col-span-2 text-center">Kills</div>
                <div className="col-span-2 text-center">Dmg</div>
                <div className="col-span-1 text-center">WWCD</div>
                <div className="col-span-2 text-center">Total</div>
              </div>
              {leaderboard.filter(e => e.matchesPlayed > 0).map((e) => (
                <div key={e.teamId} className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl ${
                  e.rank <= 3 ? "bg-yellow-500/5 border border-yellow-500/15" : "bg-white/3 border border-white/5"
                }`}>
                  <div className="col-span-1">
                    <span className={`font-mono font-bold text-sm ${e.rank === 1 ? "text-yellow-400" : e.rank === 2 ? "text-gray-300" : e.rank === 3 ? "text-amber-600" : "text-gray-600"}`}>
                      {e.rank <= 3 ? ["","",""][e.rank-1] : e.rank}
                    </span>
                  </div>
                  <div className="col-span-3 text-white font-semibold text-sm truncate">{e.teamName}</div>
                  <div className="col-span-1 text-center text-gray-500 text-sm">{e.matchesPlayed}</div>
                  <div className="col-span-2 text-center text-orange-400 font-bold font-mono">{e.totalKills}</div>
                  <div className="col-span-2 text-center text-purple-400 font-mono text-sm">{e.totalDamage?.toLocaleString()}</div>
                  <div className="col-span-1 text-center text-green-400 font-bold">{e.wwcds}</div>
                  <div className="col-span-2 text-center">
                    <span className={`font-mono font-bold ${e.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{e.totalPoints}</span>
                  </div>
                </div>
              ))}
              {leaderboard.filter(e => e.matchesPlayed > 0).length === 0 && (
                <div className="text-center py-12 text-gray-600">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No team data yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/8 text-center">
          <button onClick={onClose} className="btn-secondary px-6 py-2">Close</button>
        </div>
      </div>
    </div>
  );
}