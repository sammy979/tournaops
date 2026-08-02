"use client";
import { Trophy, Skull, Crosshair, Zap, TrendingUp, TrendingDown, Medal, Award, Crown, Target } from "lucide-react";
import type { Tournament, LeaderboardEntry } from "@/types/tournament";
import { getLeaderboard, getTopPlayers } from "@/lib/storage/tournaments";

interface Props {
  tournament: Tournament;
}

export default function FullLeaderboard({ tournament }: Props) {
  const leaderboard = getLeaderboard(tournament);
  const { topKillers, topDamage, topKD } = getTopPlayers(tournament);

  return (
    <div className="space-y-6">
      {/* MVP Cards Row */}
      {topKillers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Top Killer */}
          <div className="glass rounded-2xl p-5 border border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Skull className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-red-400 font-bold uppercase tracking-wider">Top Killer</div>
                <div className="text-[10px] text-white/50">Most eliminations</div>
              </div>
            </div>
            {topKillers[0] && (
              <div>
                <div className="font-display font-black text-xl mb-1">{topKillers[0].ign}</div>
                <div className="text-xs text-white/60 mb-2">{topKillers[0].teamName}</div>
                <div className="font-display font-black text-3xl text-red-400">{topKillers[0].kills}</div>
                <div className="text-xs text-white/50">Total Kills</div>
              </div>
            )}
          </div>

          {/* Top Damage */}
          <div className="glass rounded-2xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Top Damage</div>
                <div className="text-[10px] text-white/50">Most damage dealt</div>
              </div>
            </div>
            {topDamage[0] && (
              <div>
                <div className="font-display font-black text-xl mb-1">{topDamage[0].ign}</div>
                <div className="text-xs text-white/60 mb-2">{topDamage[0].teamName}</div>
                <div className="font-display font-black text-3xl text-cyan-400">{topDamage[0].damage.toLocaleString()}</div>
                <div className="text-xs text-white/50">Total Damage</div>
              </div>
            )}
          </div>

          {/* Best K/D */}
          <div className="glass rounded-2xl p-5 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Best K/D</div>
                <div className="text-[10px] text-white/50">Kill/Death ratio</div>
              </div>
            </div>
            {topKD[0] && (
              <div>
                <div className="font-display font-black text-xl mb-1">{topKD[0].ign}</div>
                <div className="text-xs text-white/60 mb-2">{topKD[0].teamName}</div>
                <div className="font-display font-black text-3xl text-yellow-400">{topKD[0].kd}</div>
                <div className="text-xs text-white/50">K/D Ratio</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="glass-heavy rounded-2xl overflow-hidden border border-white/10">
        <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl">Overall Standings</h3>
                <div className="text-xs text-white/50">{leaderboard.length} teams | {tournament.matches.filter(m => m.status === "completed").length} matches played</div>
              </div>
            </div>
            <div className="live-badge">Live</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/40 text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                <th className="p-3 text-left w-16">#</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-center">MP</th>
                <th className="p-3 text-center">Wins</th>
                <th className="p-3 text-center">Kills</th>
                <th className="p-3 text-center">Dmg</th>
                <th className="p-3 text-center">K/D</th>
                <th className="p-3 text-center">Avg Place</th>
                <th className="p-3 text-center">Place Pts</th>
                <th className="p-3 text-center">Kill Pts</th>
                <th className="p-3 text-center">Bonus</th>
                <th className="p-3 text-center font-bold text-cyan-300">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.team.id} className={`border-t border-white/5 hover:bg-white/5 transition ${
                  i === 0 ? "bg-yellow-500/5" : i === 1 ? "bg-gray-400/5" : i === 2 ? "bg-orange-500/5" : ""
                }`}>
                  <td className="p-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-black text-sm ${
                      i === 0 ? "bg-yellow-500 text-black" :
                      i === 1 ? "bg-gray-400 text-black" :
                      i === 2 ? "bg-orange-500 text-white" :
                      "bg-white/10 text-white/70"
                    }`}>
                      {i === 0 ? <Crown className="w-4 h-4" /> : i + 1}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black">
                        {entry.team.tag || entry.team.name.substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold">{entry.team.name}</div>
                        <div className="text-[10px] text-white/40">Seed #{entry.team.seed}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center text-white/70">{entry.matchesPlayed}</td>
                  <td className="p-3 text-center text-green-400 font-bold">{entry.wins}</td>
                  <td className="p-3 text-center text-red-400 font-bold">{entry.totalKills}</td>
                  <td className="p-3 text-center text-cyan-400">{entry.totalDamage.toLocaleString()}</td>
                  <td className="p-3 text-center text-yellow-400 font-bold">{entry.kd}</td>
                  <td className="p-3 text-center text-white/70">{entry.avgPlacement > 0 ? entry.avgPlacement.toFixed(1) : "-"}</td>
                  <td className="p-3 text-center text-yellow-300">{entry.placementPoints}</td>
                  <td className="p-3 text-center text-red-300">{entry.killPoints}</td>
                  <td className="p-3 text-center text-green-300">{entry.bonusPoints}</td>
                  <td className="p-3 text-center">
                    <span className="font-display font-black text-lg text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30">
                      {entry.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Players Tables */}
      {topKillers.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Top Killers */}
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Skull className="w-4 h-4 text-red-400" />
              <h4 className="font-display font-bold text-sm">Top Killers</h4>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-black/30 text-[10px] uppercase text-white/50">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Player</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-center">Kills</th>
                </tr>
              </thead>
              <tbody>
                {topKillers.slice(0, 5).map((p: any, i: number) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="p-2 font-bold text-white/50">{i + 1}</td>
                    <td className="p-2 font-bold">{p.ign}</td>
                    <td className="p-2 text-white/60 text-xs">{p.teamName}</td>
                    <td className="p-2 text-center text-red-400 font-display font-black">{p.kills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Damage */}
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="font-display font-bold text-sm">Top Damage</h4>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-black/30 text-[10px] uppercase text-white/50">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Player</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2 text-center">Damage</th>
                </tr>
              </thead>
              <tbody>
                {topDamage.slice(0, 5).map((p: any, i: number) => (
                  <tr key={p.id} className="border-t border-white/5">
                    <td className="p-2 font-bold text-white/50">{i + 1}</td>
                    <td className="p-2 font-bold">{p.ign}</td>
                    <td className="p-2 text-white/60 text-xs">{p.teamName}</td>
                    <td className="p-2 text-center text-cyan-400 font-display font-black">{p.damage.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}