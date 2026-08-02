"use client";
import type { Standing } from "@/types/tournament";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  standings: Standing[];
}

export default function StandingsTable({ standings }: Props) {
  return (
    <div className="glass rounded-2xl overflow-hidden border border-purple-500/30">
      <div className="px-6 py-4 border-b border-purple-500/20">
        <h3 className="text-xl font-black flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Live Standings
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-purple-300">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-purple-300">Team</th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-purple-300">W</th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-purple-300">L</th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-purple-300">Points</th>
              <th className="px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-purple-300">Diff</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const diff = s.scoreFor - s.scoreAgainst;
              return (
                <tr key={s.team.id} className={`border-t border-purple-500/10 ${
                  idx === 0 ? "bg-yellow-500/10" : idx < 3 ? "bg-purple-500/5" : ""
                }`}>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black ${
                      idx === 0 ? "bg-yellow-500 text-black" :
                      idx === 1 ? "bg-gray-400 text-black" :
                      idx === 2 ? "bg-orange-500 text-white" :
                      "bg-purple-900/50 text-purple-300"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.team.logo && <img src={s.team.logo} alt="" className="w-6 h-6 rounded" />}
                      <span className="font-bold">{s.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-green-400">{s.wins}</td>
                  <td className="px-4 py-3 text-center font-bold text-red-400">{s.losses}</td>
                  <td className="px-4 py-3 text-center font-black text-lg neon-text-cyan">{s.points}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 font-bold ${
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