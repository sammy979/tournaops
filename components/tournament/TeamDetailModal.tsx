"use client";
import { X, Trophy, Target, Users, TrendingUp, Award, Zap, Crown, Skull, MapPin } from "lucide-react";
import { useMemo } from "react";

type Player = {
  name?: string;
  ign?: string;
  role?: string;
  photo?: string;
};

type MatchResult = {
  matchId: string;
  matchNumber: number;
  map: string;
  placement: number;
  kills: number;
  points: number;
  wwcd: boolean;
  startTime?: string;
};

type TeamDetails = {
  id: string;
  name: string;
  tag?: string;
  logo?: string;
  players?: Player[] | any;
  matchHistory: MatchResult[];
  totalPoints: number;
  totalKills: number;
  wwcdCount: number;
  matchesPlayed: number;
  avgKills: number;
  avgPlacement: number;
  bestPlacement: number;
  highestKills: number;
  highestKillsMatch?: MatchResult;
  currentRank: number;
};

interface TeamDetailModalProps {
  team: TeamDetails | null;
  primaryColor?: string;
  onClose: () => void;
}

export default function TeamDetailModal({ team, primaryColor = "#FFD700", onClose }: TeamDetailModalProps) {
  if (!team) return null;

  const players: Player[] = useMemo(() => {
    if (Array.isArray(team.players)) return team.players;
    if (typeof team.players === "string") {
      try { return JSON.parse(team.players); } catch { return []; }
    }
    return [];
  }, [team.players]);

  const rankColor = team.currentRank === 1 ? "#FFD700" : team.currentRank === 2 ? "#C0C0C0" : team.currentRank === 3 ? "#CD7F32" : "#ffffff";
  const rankLabel = team.currentRank === 1 ? "CHAMPION" : team.currentRank === 2 ? "RUNNER-UP" : team.currentRank === 3 ? "THIRD PLACE" : "RANK #" + team.currentRank;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-neutral-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800 shadow-2xl my-8"
        onClick={e => e.stopPropagation()}
        style={{ borderTop: "4px solid " + primaryColor }}
      >
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-b from-neutral-900 to-neutral-900/95 backdrop-blur border-b border-neutral-800 p-6 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {team.logo ? (
                <img src={team.logo} alt="" className="w-20 h-20 rounded-xl object-cover border-2" style={{ borderColor: primaryColor }} />
              ) : (
                <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl font-black" style={{ background: primaryColor + "30", color: primaryColor }}>
                  {(team.tag || team.name).slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {team.tag && <span className="px-2 py-0.5 rounded font-bold text-xs" style={{ background: primaryColor + "30", color: primaryColor }}>[{team.tag}]</span>}
                  <span className="text-xs font-black tracking-widest" style={{ color: rankColor }}>{rankLabel}</span>
                </div>
                <h2 className="text-3xl font-black text-white truncate">{team.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 flex-shrink-0">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* STATS GRID */}
          <div>
            <h3 className="text-sm font-black text-neutral-400 mb-3 tracking-widest">STATISTICS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Points" value={team.totalPoints} icon={Trophy} color="#FFD700" primary />
              <StatCard label="WWCD" value={team.wwcdCount} icon={Crown} color="#f59e0b" />
              <StatCard label="Total Kills" value={team.totalKills} icon={Skull} color="#ef4444" />
              <StatCard label="Matches" value={team.matchesPlayed} icon={Zap} color="#8b5cf6" />
              <StatCard label="Avg Kills/Match" value={team.avgKills.toFixed(1)} icon={Target} color="#f97316" />
              <StatCard label="Avg Placement" value={"#" + team.avgPlacement.toFixed(1)} icon={TrendingUp} color="#06b6d4" />
              <StatCard label="Best Placement" value={team.bestPlacement === 999 ? "-" : "#" + team.bestPlacement} icon={Award} color="#10b981" />
              <StatCard label="Highest Kills" value={team.highestKills} icon={Target} color="#ec4899" />
            </div>
          </div>

          {/* PLAYERS */}
          {players.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-neutral-400 mb-3 tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> ROSTER ({players.length} PLAYERS)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {players.map((p, i) => (
                  <div key={i} className="bg-neutral-800 rounded-lg p-3 border border-neutral-700">
                    {p.photo ? (
                      <img src={p.photo} alt="" className="w-full aspect-square rounded-lg object-cover mb-2" />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-neutral-700 flex items-center justify-center mb-2">
                        <span className="text-4xl font-black text-neutral-500">{(p.ign || p.name || "?").slice(0, 1).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="text-white font-bold text-sm truncate">{p.ign || p.name || "Player " + (i + 1)}</div>
                    {p.role && <div className="text-xs text-neutral-400 truncate">{p.role}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MATCH HISTORY */}
          {team.matchHistory.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-neutral-400 mb-3 tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4" /> MATCH HISTORY ({team.matchHistory.length} MATCHES)
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {team.matchHistory.map((m, i) => {
                  const isWWCD = m.placement === 1 || m.wwcd;
                  const isTop3 = m.placement && m.placement <= 3;
                  return (
                    <div 
                      key={i} 
                      className={"flex items-center gap-3 p-3 rounded-lg border transition-all " +
                        (isWWCD ? "bg-yellow-500/10 border-yellow-500/40" : isTop3 ? "bg-orange-500/5 border-orange-500/30" : "bg-neutral-800 border-neutral-700")
                      }
                    >
                      <div className="w-12 text-center">
                        <div className="text-xs text-neutral-500 font-bold">MATCH</div>
                        <div className="text-lg font-black text-white">{m.matchNumber}</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {m.map && <span className="text-xs text-neutral-500 truncate">{m.map}</span>}
                          {isWWCD && <span className="text-[10px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black">WWCD 🏆</span>}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-neutral-400">Placement: <span className={"font-black " + (isWWCD ? "text-yellow-400" : isTop3 ? "text-orange-400" : "text-white")}>#{m.placement || "-"}</span></span>
                          <span className="text-neutral-400">Kills: <span className="text-red-400 font-black">{m.kills}</span></span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-neutral-500">POINTS</div>
                        <div className="text-xl font-black" style={{ color: primaryColor }}>{m.points}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MOMENTS */}
          {team.highestKillsMatch && (
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-red-400 font-bold tracking-widest">🔥 BEST MATCH</div>
                  <div className="text-white font-bold">
                    Match {team.highestKillsMatch.matchNumber} on {team.highestKillsMatch.map || "Erangel"} — 
                    <span className="text-red-400 font-black"> {team.highestKillsMatch.kills} kills</span>
                    {team.highestKillsMatch.placement && <span className="text-neutral-400"> · #{team.highestKillsMatch.placement} placement</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, primary = false }: any) {
  return (
    <div 
      className={"rounded-xl p-3 border transition-all " + (primary ? "border-yellow-500/50" : "border-neutral-700")}
      style={{ background: primary ? color + "15" : "rgba(255,255,255,0.02)" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <div className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase">{label}</div>
      </div>
      <div className="text-2xl font-black" style={{ color: primary ? color : "white" }}>{value}</div>
    </div>
  );
}