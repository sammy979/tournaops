"use client";
import type { Standing } from "@/types/tournament";
import { Trophy, TrendingUp, TrendingDown, Award, Medal } from "lucide-react";

interface Props {
  standings: Standing[];
}

export default function StandingsTable({ standings }: Props) {
  return (
    <div className="glass-heavy rounded-3xl overflow-hidden border-2 border-purple-500/30 relative">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl rotate-slow"></div>
      
      <div className="relative px-6 py-5 border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/50">
            <Trophy className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-black gradient-text">LIVE STANDINGS</h3>
            <p className="text-xs text-purple-300 uppercase tracking-widest font-semibold mt-1">Real-time rankings</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead className="bg-black/40">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-cyan-400">Rank</th>
              <th className="px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-cyan-400">Team</th>
              <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-green-400">W</th>
              <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-red-400">L</th>
              <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-purple-400">Points</th>
              <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-cyan-400">Diff</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const diff = s.scoreFor - s.scoreAgainst;
              const isTop3 = idx < 3;
              
              return (
                <tr key={s.team.id} className={`border-t border-purple-500/10 transition-all hover:bg-purple-500/5 ${
                  idx === 0 ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/5" : 
                  idx === 1 ? "bg-gradient-to-r from-gray-400/10 to-transparent" :
                  idx === 2 ? "bg-gradient-to-r from-orange-500/10 to-transparent" : ""
                }`}>
                  <td className="px-4 py-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-display font-black text-lg ${
                      idx === 0 ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/50" :
                      idx === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg" :
                      idx === 2 ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50" :
                      "bg-purple-900/50 text-purple-300 border border-purple-500/30"
                    }`}>
                      {isTop3 ? (
                        idx === 0 ? <Trophy className="w-5 h-5" fill="currentColor" /> :
                        idx === 1 ? <Medal className="w-5 h-5" fill="currentColor" /> :
                        <Award className="w-5 h-5" fill="currentColor" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {s.team.logo ? (
                        <img src={s.team.logo} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-purple-500/30" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm">
                          {s.team.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-display font-bold text-lg">{s.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-display font-black text-2xl text-green-400">{s.wins}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-display font-black text-2xl text-red-400">{s.losses}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40">
                      <span className="font-display font-black text-2xl neon-text-cyan">{s.points}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 font-black text-lg ${
                      diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-purple-300"
                    }`}>
                      {diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {diff > 0 ? "+" : ""}{diff}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}