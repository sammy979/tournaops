"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, RefreshCw, Bot, TrendingUp, TrendingDown, Minus, X } from "lucide-react";

interface AIPointsTableProps {
  tournamentId: string;
  onClose?: () => void;
  embedded?: boolean;
}

export default function AIPointsTable({ tournamentId, onClose, embedded }: AIPointsTableProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/tournaments/" + tournamentId + "/ai-analysis", { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch {}
      setLoading(false);
    })();
  }, [tournamentId]);

  if (loading) return (
    <div className="text-center py-12">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-500 text-sm">Analyzing...</p>
    </div>
  );

  if (!data || !data.standings || data.standings.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
      <p>No match data to analyze yet. Enter match results first.</p>
    </div>
  );

  const { standings, teamInsights, ties, predictions, statistics, aiSummary } = data;
  const insightMap: Record<string, any> = {};
  (teamInsights || []).forEach((i: any) => { insightMap[i.teamId] = i; });

  return (
    <div className="space-y-4">
      {/* AI Summary */}
      {aiSummary && (
        <div className="glass-card rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
          <div className="flex items-start gap-2">
            <Bot className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Analysis</span>
              <p className="text-gray-300 text-sm mt-1">{aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="glass-card rounded-lg p-3 border border-white/8 text-center">
          <div className="text-xl font-black text-blue-400">{statistics?.completedMatches || 0}/{statistics?.totalMatches || 0}</div>
          <div className="text-[10px] text-gray-500">Matches</div>
        </div>
        <div className="glass-card rounded-lg p-3 border border-white/8 text-center">
          <div className="text-xl font-black text-orange-400">{statistics?.totalKills || 0}</div>
          <div className="text-[10px] text-gray-500">Total Kills</div>
        </div>
        <div className="glass-card rounded-lg p-3 border border-white/8 text-center">
          <div className="text-xl font-black text-green-400">{statistics?.avgKillsPerMatch || 0}</div>
          <div className="text-[10px] text-gray-500">Avg K/Match</div>
        </div>
        <div className="glass-card rounded-lg p-3 border border-white/8 text-center">
          <div className="text-xl font-black text-yellow-400">{ties?.length || 0}</div>
          <div className="text-[10px] text-gray-500">Ties</div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase w-12">Rank</th>
                <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase">Squad</th>
                <th className="text-center py-3 px-2 text-purple-400 text-[10px] uppercase w-10">Trend</th>
                <th className="text-center py-3 px-2 text-yellow-500 text-[10px] uppercase w-10">W</th>
                <th className="text-center py-3 px-2 text-orange-400 text-[10px] uppercase w-12">Kills</th>
                <th className="text-center py-3 px-3 text-white text-[10px] uppercase font-bold w-14">Total</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((t: any) => {
                const insight = insightMap[t.id];
                return (
                  <tr key={t.id} className={`border-b border-white/5 hover:bg-white/3 ${t.rank === 1 ? "bg-yellow-500/5" : ""}`}>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono font-black ${
                        t.rank === 1 ? "text-yellow-400" :
                        t.rank === 2 ? "text-gray-300" :
                        t.rank === 3 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {t.rank <= 3 ? ["1st","2nd","3rd"][t.rank-1] : "#" + t.rank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-semibold">{t.name}</div>
                      {insight && (
                        <div className="text-gray-500 text-[10px] mt-0.5">{insight.insight}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {insight?.trendDirection === "up" ? <TrendingUp className="w-4 h-4 text-green-400 mx-auto" /> :
                       insight?.trendDirection === "down" ? <TrendingDown className="w-4 h-4 text-red-400 mx-auto" /> :
                       <Minus className="w-4 h-4 text-gray-600 mx-auto" />}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`font-bold ${t.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{t.wwcds}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center text-orange-400 font-mono font-bold">{t.kills}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-mono font-black text-lg ${t.rank <= 3 ? "text-yellow-400" : "text-white"}`}>{t.points}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictions */}
      {predictions && predictions.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
          <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Win Probability</div>
          <div className="flex gap-2 flex-wrap">
            {predictions.map((p: any) => (
              <div key={p.teamName} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/8">
                <span className="text-white text-xs">{p.teamName}</span>
                <span className={`text-xs font-bold font-mono ${p.probability >= 50 ? "text-green-400" : "text-gray-500"}`}>{p.probability}%</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-[9px] mt-2">Based on current standings. Not a guarantee.</p>
        </div>
      )}
    </div>
  );
}