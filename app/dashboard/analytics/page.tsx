"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, Trophy, Users, Crosshair,
  Flame, Calendar, Award, Zap, Clock, Target
} from "lucide-react";
import { getMyTournaments, getLeaderboard, getTopPlayers, getTournamentStats } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function AnalyticsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<string>("all");

  useEffect(() => {
    setTournaments(getMyTournaments());
  }, []);

  const filtered = selected === "all" ? tournaments : tournaments.filter(t => t.id === selected);

  // Aggregate stats
  const totalTournaments = tournaments.length;
  const liveTournaments = tournaments.filter(t => t.status === "live").length;
  const completedTournaments = tournaments.filter(t => t.status === "completed").length;
  const totalTeams = tournaments.reduce((a, t) => a + t.teams.length, 0);
  const totalMatches = tournaments.reduce((a, t) => a + t.matches.length, 0);
  const completedMatches = tournaments.reduce((a, t) => a + t.matches.filter(m => m.status === "completed").length, 0);

  // All kills across all tournaments
  const allKills = tournaments.reduce((a, t) => {
    const lb = getLeaderboard(t);
    return a + lb.reduce((b, e) => b + (e.totalKills || 0), 0);
  }, 0);

  // All players
  const totalPlayers = tournaments.reduce((a, t) => a + t.teams.reduce((b, tm) => b + tm.players.length, 0), 0);

  // Per-tournament breakdown
  const tournamentBreakdown = tournaments.map(t => {
    const stats = getTournamentStats(t);
    const lb = getLeaderboard(t);
    const { topKillers } = getTopPlayers(t);
    return {
      ...t,
      stats,
      leader: lb[0]?.teamName || "TBD",
      leaderPts: lb[0]?.totalPoints || 0,
      topKiller: topKillers[0]?.playerName || "—",
      topKills: topKillers[0]?.kills || 0,
      totalKillsAll: lb.reduce((a, e) => a + (e.totalKills || 0), 0),
    };
  });

  // Recent activity (last 5 completed matches across all tournaments)
  const recentMatches = tournaments
    .flatMap(t => t.matches
      .filter(m => m.status === "completed")
      .map(m => ({ ...m, tournamentName: t.name }))
    )
    .sort((a, b) => (b.endTime || "").localeCompare(a.endTime || ""))
    .slice(0, 8);

  const overallStats = [
    { label: "Total Tournaments", value: totalTournaments, icon: Trophy, color: "blue", sub: `${liveTournaments} live · ${completedTournaments} done` },
    { label: "Total Squads", value: totalTeams, icon: Users, color: "purple", sub: `${totalPlayers} players total` },
    { label: "Matches Completed", value: completedMatches, icon: Target, color: "green", sub: `of ${totalMatches} total` },
    { label: "Total Kills", value: allKills.toLocaleString(), icon: Crosshair, color: "red", sub: "across all tournaments" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-500 mt-1">Performance overview across all your tournaments</p>
        </div>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="all">All Tournaments</option>
          {tournaments.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overallStats.map(s => {
          const Icon = s.icon;
          const colorMap: Record<string, string> = {
            blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
            green: "bg-green-500/10 text-green-400 border-green-500/20",
            red: "bg-red-500/10 text-red-400 border-red-500/20",
          };
          return (
            <div key={s.label} className={`stat-card border ${colorMap[s.color]}`}>
              <div className={`w-10 h-10 rounded-xl ${colorMap[s.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-gray-500 text-sm mt-0.5">{s.label}</div>
              <div className="text-gray-700 text-xs mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Tournament Completion Chart */}
      {tournaments.length > 0 && (
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Tournament Progress
          </h3>
          <div className="space-y-3">
            {tournamentBreakdown.slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center gap-4">
                <div className="w-36 truncate text-sm text-gray-300 flex-shrink-0">{t.name}</div>
                <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(t.stats.progress, 2)}%` }}
                  >
                    {t.stats.progress > 15 && (
                      <span className="text-white text-xs font-bold">{t.stats.progress}%</span>
                    )}
                  </div>
                  {t.stats.progress <= 15 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">{t.stats.progress}%</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  t.status === "live" ? "bg-green-500/20 text-green-400" :
                  t.status === "completed" ? "bg-gray-500/20 text-gray-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Tournament Breakdown */}
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Tournament Breakdown
          </h3>
          {tournamentBreakdown.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {tournamentBreakdown.map(t => (
                <div key={t.id} className="p-3 rounded-xl bg-white/4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium text-sm truncate flex-1">{t.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                      t.status === "live" ? "bg-green-500/20 text-green-400" :
                      t.status === "completed" ? "bg-gray-500/20 text-gray-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>{t.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Teams</p>
                      <p className="text-white font-semibold">{t.teams.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Leader</p>
                      <p className="text-yellow-400 font-semibold truncate">{t.leader}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Kills</p>
                      <p className="text-orange-400 font-semibold">{t.totalKillsAll}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tournaments yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Recent Match Activity
          </h3>
          {recentMatches.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {recentMatches.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/4 border border-white/6">
                  <div className="w-8 h-8 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{m.name}</p>
                    <p className="text-gray-600 text-xs truncate">{(m as any).tournamentName} · {m.map}</p>
                  </div>
                  {m.results && m.results[0] && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-yellow-400 text-xs font-bold">🥇 {m.results[0].teamName}</p>
                      <p className="text-gray-600 text-[10px]">{m.results[0].kills}K · {m.results[0].totalPoints}pts</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No completed matches yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Top performers across all tournaments */}
      {allKills > 0 && (
        <div className="glass-card rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            All-Time Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournamentBreakdown
              .filter(t => t.topKills > 0)
              .sort((a, b) => b.topKills - a.topKills)
              .slice(0, 3)
              .map((t, i) => (
                <div key={t.id} className="p-4 rounded-xl bg-white/4 border border-white/8 text-center">
                  <div className="text-3xl mb-2">{["🥇","🥈","🥉"][i]}</div>
                  <p className="text-white font-bold">{t.topKiller}</p>
                  <p className="text-gray-500 text-xs mb-2">{t.name}</p>
                  <p className="text-orange-400 text-2xl font-black font-mono">{t.topKills}K</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {tournaments.length === 0 && (
        <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
          <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Data Yet</h3>
          <p className="text-gray-500 mb-6">Create tournaments and enter match results to see analytics.</p>
        </div>
      )}
    </div>
  );
}