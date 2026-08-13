"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  BarChart2,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  Trophy,
  Map,
  Target,
  ArrowUpRight,
  Minus,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_INSIGHTS = {
  summary: {
    totalMatches:     31,
    avgMatchDuration: "38m",
    totalMapsPlayed:  74,
    upsets:           5,
    closestMatch:     "Team Nexus vs Team Void (13-11 on final map)",
    longestMatch:     "72 minutes",
    avgViewers:       1243,
    peakViewers:      3102,
  },
  teamPerformance: [
    { team: "Team Alpha",   winRate: 100, avgMapScore: 12.4, upsets: 0, avgDuration: "34m", momentum: "up"   },
    { team: "Team Nexus",   winRate: 83,  avgMapScore: 11.8, upsets: 1, avgDuration: "41m", momentum: "up"   },
    { team: "Team Void",    winRate: 80,  avgMapScore: 11.2, upsets: 2, avgDuration: "43m", momentum: "same" },
    { team: "Team Storm",   winRate: 67,  avgMapScore: 10.9, upsets: 0, avgDuration: "37m", momentum: "down" },
    { team: "Team Phantom", winRate: 60,  avgMapScore: 10.1, upsets: 1, avgDuration: "39m", momentum: "up"   },
  ],
  mapStats: [
    { map: "Ascent",   played: 14, team1WinRate: 57, avgDuration: "24m", avgRounds: 23.4 },
    { map: "Bind",     played: 12, team1WinRate: 50, avgDuration: "26m", avgRounds: 24.1 },
    { map: "Haven",    played: 11, team1WinRate: 64, avgDuration: "28m", avgRounds: 25.0 },
    { map: "Icebox",   played: 10, team1WinRate: 40, avgDuration: "31m", avgRounds: 26.2 },
    { map: "Pearl",    played: 9,  team1WinRate: 56, avgDuration: "27m", avgRounds: 24.8 },
    { map: "Split",    played: 8,  team1WinRate: 50, avgDuration: "23m", avgRounds: 22.1 },
    { map: "Fracture", played: 7,  team1WinRate: 43, avgDuration: "29m", avgRounds: 25.5 },
    { map: "Lotus",    played: 3,  team1WinRate: 67, avgDuration: "25m", avgRounds: 23.9 },
  ],
  roundTimeline: [
    { round: "Group Stage R1", avgScore: 8.2,  completionRate: 100 },
    { round: "Group Stage R2", avgScore: 9.1,  completionRate: 100 },
    { round: "Group Stage R3", avgScore: 9.8,  completionRate: 100 },
    { round: "QF Round 1",     avgScore: 10.4, completionRate: 75  },
    { round: "QF Round 2",     avgScore: 11.2, completionRate: 25  },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; trend?: "up" | "down" | "same"; color: string;
}) {
  return (
    <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        {trend && (
          trend === "up"   ? <TrendingUp   className="w-4 h-4 text-emerald-400" /> :
          trend === "down" ? <TrendingDown  className="w-4 h-4 text-rose-400"    /> :
          <Minus className="w-4 h-4 text-slate-600" />
        )}
      </div>
      <p className="text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// Mini horizontal bar
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-24 bg-white/[0.06] rounded-full h-1.5 flex-shrink-0">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentInsightsPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [activeTab, setActiveTab] = useState<"overview" | "teams" | "maps">("overview");
  const ins = MOCK_INSIGHTS;

  const navTabs = [
    { label: "Overview",      href: `/dashboard/tournaments/${id}/overview` },
    { label: "Teams",         href: `/dashboard/tournaments/${id}/teams` },
    { label: "Stages",        href: `/dashboard/tournaments/${id}/stages` },
    { label: "Matches",       href: `/dashboard/tournaments/${id}/matches` },
    { label: "Match Results", href: `/dashboard/tournaments/${id}/match-results` },
    { label: "Standings",     href: `/dashboard/tournaments/${id}/standings` },
    { label: "Broadcast",     href: `/dashboard/tournaments/${id}/broadcast` },
    { label: "Discord",       href: `/dashboard/tournaments/${id}/discord` },
    { label: "Insights",      href: `/dashboard/tournaments/${id}/insights` },
    { label: "Export",        href: `/dashboard/tournaments/${id}/export` },
    { label: "Settings",      href: `/dashboard/tournaments/${id}/settings` },
  ];

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">

        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Insights</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Tournament Insights</h1>
            <p className="text-slate-500 text-sm mt-0.5">Performance analytics and statistics</p>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Insights" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Inner tabs */}
          <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
            {(["overview", "teams", "maps"] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? "bg-yellow-500 text-white" : "text-slate-400 hover:text-slate-200"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Zap}   label="Total Matches"      value={ins.summary.totalMatches}     color="bg-amber-500/15 text-amber-400"   trend="up"   />
                <StatCard icon={Clock} label="Avg Match Duration"  value={ins.summary.avgMatchDuration} color="bg-blue-500/15 text-blue-400"     trend="same" />
                <StatCard icon={Map}   label="Total Maps Played"   value={ins.summary.totalMapsPlayed}  color="bg-yellow-500/15 text-yellow-500" trend="up"   />
                <StatCard icon={Target}label="Upsets"              value={ins.summary.upsets}           sub="Underdog victories" color="bg-rose-500/15 text-rose-400" trend="same" />
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Key Highlights</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Closest Match",   value: ins.summary.closestMatch,  icon: Zap,     color: "text-amber-400" },
                      { label: "Longest Match",   value: ins.summary.longestMatch,  icon: Clock,   color: "text-blue-400"  },
                      { label: "Peak Viewership", value: `${ins.summary.peakViewers.toLocaleString()} viewers`, icon: Users, color: "text-yellow-500" },
                      { label: "Avg Viewers",     value: `${ins.summary.avgViewers.toLocaleString()} per match`, icon: BarChart2, color: "text-emerald-400" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                        <item.icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color}`} />
                        <div>
                          <p className="text-slate-500 text-xs">{item.label}</p>
                          <p className="text-white text-sm font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Round progress */}
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">Round Completion</h3>
                  <div className="space-y-3">
                    {ins.roundTimeline.map((round) => (
                      <div key={round.round}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-400 text-xs">{round.round}</span>
                          <span className="text-slate-300 text-xs font-medium">{round.completionRate}%</span>
                        </div>
                        <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${round.completionRate === 100 ? "bg-emerald-500" : round.completionRate > 0 ? "bg-amber-500" : "bg-slate-700"}`}
                            style={{ width: `${round.completionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === "teams" && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
                {["#", "Team", "Win Rate", "Avg Score", "Upsets", "Avg Duration", "Form"].map(h => (
                  <span key={h} className="text-slate-500 text-xs font-medium uppercase tracking-wide">{h}</span>
                ))}
              </div>
              {ins.teamPerformance.map((team, i) => (
                <div key={team.team} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors">
                  <span className="text-slate-600 text-sm font-bold">{i + 1}</span>
                  <span className="text-white text-sm font-semibold">{team.team}</span>
                  <div className="flex items-center gap-2">
                    <MiniBar value={team.winRate} max={100} color="bg-yellow-500" />
                    <span className="text-slate-300 text-sm w-10">{team.winRate}%</span>
                  </div>
                  <span className="text-slate-300 text-sm text-center">{team.avgMapScore}</span>
                  <span className={`text-sm text-center font-medium ${team.upsets > 0 ? "text-amber-400" : "text-slate-600"}`}>{team.upsets}</span>
                  <span className="text-slate-400 text-sm">{team.avgDuration}</span>
                  <div>
                    {team.momentum === "up"   ? <TrendingUp   className="w-4 h-4 text-emerald-400" /> :
                     team.momentum === "down" ? <TrendingDown  className="w-4 h-4 text-rose-400"    /> :
                     <Minus className="w-4 h-4 text-slate-600" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Maps Tab */}
          {activeTab === "maps" && (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
                {["Map", "Times Played", "Side 1 Win%", "Avg Duration", "Avg Rounds"].map(h => (
                  <span key={h} className="text-slate-500 text-xs font-medium uppercase tracking-wide">{h}</span>
                ))}
              </div>
              {ins.mapStats.sort((a, b) => b.played - a.played).map((map) => (
                <div key={map.map} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 border-b border-white/[0.04] last:border-0 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-xs font-bold text-yellow-500">
                      {map.map[0]}
                    </div>
                    <span className="text-white text-sm font-semibold">{map.map}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MiniBar value={map.played} max={14} color="bg-yellow-500" />
                    <span className="text-slate-300 text-sm">{map.played}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-white/[0.06] rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${map.team1WinRate}%` }} />
                    </div>
                    <span className="text-slate-300 text-sm">{map.team1WinRate}%</span>
                  </div>
                  <span className="text-slate-400 text-sm">{map.avgDuration}</span>
                  <span className="text-slate-400 text-sm">{map.avgRounds}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}