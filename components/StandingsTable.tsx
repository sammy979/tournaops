"use client";
import type { Standing } from "@/types/tournament";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StandingsTableProps {
  standings: Standing[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-semibold">No standings yet</p>
        <p className="text-sm mt-1">Complete some matches to see results</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">W</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">L</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Points</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Trend</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s) => {
            const diff = (s.previousRank ?? s.rank) - s.rank;
            return (
              <tr key={s.teamId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4">
                  <span className={"text-2xl font-bold " + (s.rank === 1 ? "text-yellow-400" : s.rank === 2 ? "text-gray-300" : s.rank === 3 ? "text-orange-400" : "text-gray-400")}>
                    #{s.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-white font-semibold">{s.teamName}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-2xl text-green-400">{s.wins}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="font-bold text-2xl text-red-400">{s.losses}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
                    <span className="font-bold text-2xl text-cyan-400">{s.points}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={"inline-flex items-center gap-1 font-bold text-lg " + (diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-yellow-300")}>
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
  );
}
