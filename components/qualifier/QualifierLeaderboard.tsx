"use client";

import { useState, useEffect } from "react";
import {
  Trophy, Users, Filter, RefreshCw, Download,
  X, Check, AlertCircle, Crown, TrendingUp
} from "lucide-react";

interface QualifierLeaderboardProps {
  stageId: string;
  onClose?: () => void;
  onOverride?: (teamId: string, teamName: string) => void;
  embedded?: boolean;
}

export default function QualifierLeaderboard({ stageId, onClose, onOverride, embedded }: QualifierLeaderboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const load = async () => {
    const url = `/api/stages/${stageId}/leaderboard?group=${groupFilter}&status=${statusFilter}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [stageId, groupFilter, statusFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [stageId, groupFilter, statusFilter, autoRefresh]);

  const statusColors: Record<string, string> = {
    QUALIFIED: "bg-green-500/15 text-green-400 border-green-500/30",
    ELIMINATED: "bg-red-500/15 text-red-400 border-red-500/30",
    UNDER_REVIEW: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    PENDING: "bg-gray-500/15 text-gray-400 border-gray-500/20",
  };

  const statusIcons: Record<string, string> = {
    QUALIFIED: "",
    ELIMINATED: "",
    UNDER_REVIEW: "",
    PENDING: "",
  };

  const content = (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="all">All Groups</option>
          {data?.groups?.map((g: any) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto text-sm">
          <option value="all">All Status</option>
          <option value="qualified"> Qualified</option>
          <option value="eliminated"> Eliminated</option>
          <option value="under_review"> Under Review</option>
          <option value="pending"> Pending</option>
        </select>
        <button onClick={load} className="btn-ghost text-xs px-3 py-2">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
          <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="accent-blue-500" />
          Auto-refresh
        </label>
        {data && (
          <span className="ml-auto text-xs text-gray-500">
            {data.rows.length} teams  {data.matches?.length || 0} matches
          </span>
        )}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase font-bold w-12">Rank</th>
                <th className="text-left py-3 px-3 text-gray-500 text-[10px] uppercase font-bold">Squad</th>
                <th className="text-left py-3 px-2 text-gray-500 text-[10px] uppercase font-bold w-20">Group</th>
                <th className="text-center py-3 px-2 text-gray-500 text-[10px] uppercase font-bold w-10">M</th>
                <th className="text-center py-3 px-2 text-yellow-500 text-[10px] uppercase font-bold w-10">WWCD</th>
                <th className="text-center py-3 px-2 text-blue-400 text-[10px] uppercase font-bold w-14">Place</th>
                <th className="text-center py-3 px-2 text-orange-400 text-[10px] uppercase font-bold w-10">Kills</th>
                <th className="text-center py-3 px-2 text-green-400 text-[10px] uppercase font-bold w-14">Kill Pts</th>
                <th className="text-center py-3 px-2 text-cyan-400 text-[10px] uppercase font-bold w-12">+Comp</th>
                <th className="text-center py-3 px-2 text-red-400 text-[10px] uppercase font-bold w-12">-Pen</th>
                <th className="text-center py-3 px-2 text-white text-[10px] uppercase font-bold w-14">Total</th>
                <th className="text-center py-3 px-2 text-gray-500 text-[10px] uppercase font-bold w-24">Status</th>
                {onOverride && <th className="text-center py-3 px-2 text-gray-500 text-[10px] uppercase font-bold w-16">Action</th>}
              </tr>
            </thead>
            <tbody>
              {data?.rows?.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-gray-600">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No results yet
                  </td>
                </tr>
              ) : (
                data?.rows?.map((r: any) => (
                  <tr key={r.teamId} className={`border-b border-white/5 hover:bg-white/3 ${
                    r.rank === 1 ? "bg-yellow-500/5" :
                    r.rank === 2 ? "bg-gray-400/3" :
                    r.rank === 3 ? "bg-amber-700/3" : ""
                  }`}>
                    <td className="py-2 px-3">
                      <span className={`font-mono font-black text-sm ${
                        r.rank === 1 ? "text-yellow-400" :
                        r.rank === 2 ? "text-gray-300" :
                        r.rank === 3 ? "text-amber-600" : "text-gray-500"
                      }`}>
                        {r.rank <= 3 ? ["","",""][r.rank-1] : `#${r.rank}`}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        {r.teamLogo ? (
                          <img src={r.teamLogo} alt="" className="w-6 h-6 rounded" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500/30 to-yellow-500/30 flex items-center justify-center text-white text-xs font-bold">
                            {r.teamName.charAt(0)}
                          </div>
                        )}
                        <span className="text-white font-medium text-sm">{r.teamName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-gray-500 text-xs">{r.groupName}</td>
                    <td className="py-2 px-2 text-center text-gray-400 text-xs font-mono">{r.matches}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-bold font-mono ${r.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{r.wwcds}</span>
                    </td>
                    <td className="py-2 px-2 text-center text-blue-300 font-mono text-xs">{r.placementPoints}</td>
                    <td className="py-2 px-2 text-center text-orange-400 font-mono font-bold">{r.kills}</td>
                    <td className="py-2 px-2 text-center text-green-400 font-mono text-xs">{r.killPoints}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-mono text-xs ${r.compensationPoints > 0 ? "text-cyan-400 font-bold" : "text-gray-700"}`}>
                        {r.compensationPoints > 0 ? `+${r.compensationPoints}` : ""}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-mono text-xs ${r.penaltyPoints > 0 ? "text-red-400 font-bold" : "text-gray-700"}`}>
                        {r.penaltyPoints > 0 ? `-${r.penaltyPoints}` : ""}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-mono font-black text-lg ${r.rank <= 3 ? "text-yellow-400" : "text-white"}`}>
                        {r.totalPoints}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusColors[r.qualificationStatus] || statusColors.PENDING}`}>
                        {statusIcons[r.qualificationStatus]} {r.qualificationStatus.replace("_", " ")}
                      </span>
                    </td>
                    {onOverride && (
                      <td className="py-2 px-2 text-center">
                        <button
                          onClick={() => onOverride(r.teamId, r.teamName)}
                          className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-blue-500/20 text-blue-400 border border-white/10"
                        >
                          Override
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm overflow-y-auto py-4">
      <div className="w-full max-w-7xl mx-4">
        <div className="glass-card rounded-2xl border border-white/10 p-5 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {data?.stage?.name}  Live Leaderboard
            </h2>
            <p className="text-gray-500 text-sm">Real-time standings with all groups</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {content}
      </div>
    </div>
  );
}