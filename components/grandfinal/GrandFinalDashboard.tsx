"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trophy, Crown, Play, Clock, Check, X, AlertTriangle,
  Lock, Unlock, Zap, Award, Map, Users, RefreshCw,
  ChevronRight, Star, Radio, Eye, Send
} from "lucide-react";

interface GrandFinalDashboardProps {
  stageId: string;
  onLock?: () => void;
  onPublish?: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: "Draft", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: Clock },
  SUBMITTED: { label: "Submitted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Send },
  UNDER_REVIEW: { label: "Under Review", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: Eye },
  VERIFIED: { label: "Verified", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: Check },
  PUBLISHED: { label: "Published", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Check },
  DISPUTED: { label: "Disputed", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: AlertTriangle },
};

export default function GrandFinalDashboard({ stageId, onLock, onPublish }: GrandFinalDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/stages/${stageId}/leaderboard`, { cache: "no-store" });
    if (res.ok) {
      const d = await res.json();
      setData(d);
    }
    setLoading(false);
  }, [stageId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const i = setInterval(load, 15000);
    return () => clearInterval(i);
  }, [load]);

  const verifyMatch = async (matchId: string, action: string, note?: string) => {
    setVerifying(matchId);
    const res = await fetch(`/api/matches/${matchId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (res.ok) load();
    else alert("Failed");
    setVerifying(null);
  };

  if (loading) return (
    <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!data) return null;

  const matches = data.matches || [];
  const rows = data.rows || [];
  const currentMatch = matches.find((m: any) => m.status === "live");
  const nextMatch = matches.find((m: any) => m.status === "pending");
  const lastCompleted = matches.filter((m: any) => m.status === "completed").pop();
  const displayCurrent = currentMatch || lastCompleted;

  const completedCount = matches.filter((m: any) => m.status === "completed").length;
  const totalMatches = matches.length;

  // Tie detection
  const ties: { rank1: number; rank2: number; team1: any; team2: any }[] = [];
  for (let i = 0; i < rows.length - 1; i++) {
    if (rows[i].totalPoints === rows[i + 1].totalPoints && rows[i].totalPoints > 0) {
      ties.push({
        rank1: rows[i].rank,
        rank2: rows[i + 1].rank,
        team1: rows[i],
        team2: rows[i + 1],
      });
    }
  }

  const unresolvedDisputes = matches.filter((m: any) => m.verificationStatus === "DISPUTED").length;
  const allVerified = matches.every((m: any) =>
    m.status !== "completed" || ["VERIFIED", "PUBLISHED"].includes(m.verificationStatus)
  );

  return (
    <div className="space-y-6">

      {/* HERO STATUS */}
      <div className="glass-card rounded-3xl p-6 border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl" />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/40">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Grand Final</div>
                <h2 className="text-2xl font-black text-white">{data.stage?.name}</h2>
              </div>
              {data.stage?.status === "LIVE" && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                  <Radio className="w-3 h-3" />LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{rows.length} finalists</span>
              <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4" />{completedCount}/{totalMatches} matches</span>
              {data.stage?.isLocked && <span className="flex items-center gap-1.5 text-yellow-400"><Lock className="w-4 h-4" />Locked</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!data.stage?.isLocked && completedCount === totalMatches && (
              <button onClick={onLock} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 font-bold text-sm">
                <Lock className="w-4 h-4" />Lock Grand Final
              </button>
            )}
            {data.stage?.isLocked && (
              <button onClick={onPublish} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-yellow-500/30">
                <Crown className="w-4 h-4" />Publish Champion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CURRENT / NEXT MATCH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CURRENT */}
        <div className={`glass-card rounded-2xl p-5 border ${
          currentMatch ? "border-blue-500/30 bg-blue-500/5" : "border-green-500/20 bg-green-500/5"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              {currentMatch ? (
                <><Radio className="w-3 h-3 text-blue-400 animate-pulse" />Current Match</>
              ) : (
                <><Check className="w-3 h-3 text-green-400" />Last Completed</>
              )}
            </div>
            {displayCurrent && (
              <span className="text-xs text-gray-500 font-mono">
                Match {displayCurrent.matchNumber} / {totalMatches}
              </span>
            )}
          </div>

          {displayCurrent ? (
            <>
              <div className="text-2xl font-black text-white mb-1">{displayCurrent.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <Map className="w-4 h-4" />
                {displayCurrent.map}
              </div>

              {displayCurrent.verificationStatus && (
                <VerificationBadge status={displayCurrent.verificationStatus} />
              )}
            </>
          ) : (
            <div className="text-gray-500 text-sm">No matches yet</div>
          )}
        </div>

        {/* NEXT */}
        <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-purple-500/5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
            <Clock className="w-3 h-3 text-purple-400" />Next Match
          </div>

          {nextMatch ? (
            <>
              <div className="text-2xl font-black text-white mb-1">{nextMatch.name}</div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Map className="w-4 h-4" />
                {nextMatch.map}
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm">All matches complete</div>
          )}
        </div>
      </div>

      {/* MATCH FLOW */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Match Flow</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {matches.map((m: any, idx: number) => {
            const isCurrent = m.status === "live";
            const isDone = m.status === "completed";
            const vStatus = m.verificationStatus || "DRAFT";
            const vInfo = STATUS_LABELS[vStatus];
            const VIcon = vInfo?.icon || Clock;

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent ? "border-blue-500/40 bg-blue-500/10 animate-pulse" :
                  isDone && vStatus === "PUBLISHED" ? "border-emerald-500/30 bg-emerald-500/5" :
                  isDone && vStatus === "VERIFIED" ? "border-green-500/30 bg-green-500/5" :
                  isDone && vStatus === "DISPUTED" ? "border-red-500/30 bg-red-500/5" :
                  isDone ? "border-blue-500/20 bg-blue-500/3" :
                  "border-white/10 bg-white/2"
                }`}
              >
                <div className="text-center mb-1.5">
                  <div className={`text-lg font-black ${
                    isCurrent ? "text-blue-400" :
                    isDone ? "text-white" : "text-gray-600"
                  }`}>
                    M{m.matchNumber || idx + 1}
                  </div>
                  <div className="text-[10px] text-gray-600 truncate">{m.map}</div>
                </div>
                {isDone && (
                  <div className={`flex items-center justify-center gap-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full border ${vInfo?.color || "text-gray-400"}`}>
                    <VIcon className="w-2.5 h-2.5" />
                    {vInfo?.label || "Done"}
                  </div>
                )}
                {isCurrent && (
                  <div className="flex items-center justify-center gap-1 text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />LIVE
                  </div>
                )}
                {!isCurrent && !isDone && (
                  <div className="text-center text-[9px] text-gray-600 font-semibold uppercase">Upcoming</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TIE WARNING */}
      {ties.length > 0 && (
        <div className="glass-card rounded-xl p-4 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 font-bold text-sm mb-2">
                {ties.length} Tie{ties.length > 1 ? "s" : ""} Detected
              </p>
              {ties.map((tie, i) => (
                <div key={i} className="text-yellow-300/80 text-xs mb-1">
                  #{tie.rank1} <strong>{tie.team1.teamName}</strong> = #{tie.rank2} <strong>{tie.team2.teamName}</strong>
                  <span className="text-yellow-500 ml-2">({tie.team1.totalPoints} pts each)</span>
                  <span className="text-gray-500 ml-2">→ tiebreaker: kills ({tie.team1.kills} vs {tie.team2.kills})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UNRESOLVED DISPUTES */}
      {unresolvedDisputes > 0 && (
        <div className="glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-bold text-sm">
                {unresolvedDisputes} Unresolved Dispute{unresolvedDisputes > 1 ? "s" : ""}
              </p>
              <p className="text-red-300/70 text-xs">Resolve before locking the Grand Final</p>
            </div>
          </div>
        </div>
      )}

      {/* PODIUM (Top 3) */}
      {rows.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map(idx => {
            const r = rows[idx];
            if (!r) return null;
            const rank = r.rank;
            const isChampion = rank === 1;

            return (
              <div key={r.teamId} className={`glass-card rounded-2xl p-5 border text-center ${
                rank === 1 ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 shadow-xl shadow-yellow-500/20 -translate-y-2" :
                rank === 2 ? "border-gray-400/30 bg-gray-400/5" :
                "border-amber-700/30 bg-amber-700/5"
              }`}>
                <div className="text-4xl mb-2">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                </div>
                <div className={`text-lg font-black ${
                  rank === 1 ? "text-yellow-400" :
                  rank === 2 ? "text-gray-300" :
                  "text-amber-600"
                }`}>
                  {r.teamName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {r.wwcds} WWCD · {r.kills}K
                </div>
                <div className={`text-3xl font-black font-mono mt-2 ${
                  rank === 1 ? "text-yellow-400" :
                  rank === 2 ? "text-gray-300" :
                  "text-amber-600"
                }`}>
                  {r.totalPoints}
                </div>
                <div className="text-[10px] text-gray-600 uppercase tracking-widest">points</div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL STANDINGS */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/2 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Final Standings
          </h3>
          <button onClick={load} className="btn-ghost text-xs px-3 py-1.5">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="text-left py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold w-12">Rank</th>
                <th className="text-left py-2.5 px-3 text-gray-500 text-[10px] uppercase font-bold">Team</th>
                <th className="text-center py-2.5 px-2 text-yellow-500 text-[10px] uppercase font-bold">WWCD</th>
                <th className="text-center py-2.5 px-2 text-orange-400 text-[10px] uppercase font-bold">Kills</th>
                <th className="text-center py-2.5 px-2 text-blue-400 text-[10px] uppercase font-bold">Place</th>
                <th className="text-center py-2.5 px-2 text-green-400 text-[10px] uppercase font-bold">Kill Pts</th>
                <th className="text-center py-2.5 px-2 text-red-400 text-[10px] uppercase font-bold">Pen</th>
                <th className="text-center py-2.5 px-3 text-white text-[10px] uppercase font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.teamId} className={`border-b border-white/5 hover:bg-white/3 ${
                  r.rank === 1 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" :
                  r.rank === 2 ? "bg-gray-400/5" :
                  r.rank === 3 ? "bg-amber-700/5" : ""
                }`}>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono font-black text-lg ${
                      r.rank === 1 ? "text-yellow-400" :
                      r.rank === 2 ? "text-gray-300" :
                      r.rank === 3 ? "text-amber-600" : "text-gray-500"
                    }`}>
                      {r.rank <= 3 ? ["🥇","🥈","🥉"][r.rank-1] : `#${r.rank}`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      {r.teamLogo ? (
                        <img src={r.teamLogo} alt="" className="w-7 h-7 rounded" />
                      ) : (
                        <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-white text-xs font-bold">
                          {r.teamName.charAt(0)}
                        </div>
                      )}
                      <span className="text-white font-semibold">{r.teamName}</span>
                      {r.rank === 1 && <Crown className="w-4 h-4 text-yellow-400" />}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-mono font-bold ${r.wwcds > 0 ? "text-yellow-400" : "text-gray-700"}`}>{r.wwcds}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-orange-400 font-mono font-bold">{r.kills}</td>
                  <td className="py-2.5 px-2 text-center text-blue-300 font-mono text-xs">{r.placementPoints}</td>
                  <td className="py-2.5 px-2 text-center text-green-400 font-mono text-xs">{r.killPoints}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`font-mono text-xs ${r.penaltyPoints > 0 ? "text-red-400 font-bold" : "text-gray-700"}`}>
                      {r.penaltyPoints > 0 ? `-${r.penaltyPoints}` : "—"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-mono font-black text-lg ${r.rank <= 3 ? "text-yellow-400" : "text-white"}`}>
                      {r.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VerificationBadge({ status }: { status: string }) {
  const info = STATUS_LABELS[status];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${info.color}`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </div>
  );
}