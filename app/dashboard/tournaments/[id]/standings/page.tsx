"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Trophy,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  Download,
  RefreshCw,
  Medal,
  BarChart2,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Trend = "up" | "down" | "same" | "new";

interface Standing {
  rank: number;
  previousRank: number | null;
  team: string;
  tag: string;
  wins: number;
  losses: number;
  matchesPlayed: number;
  points: number;
  mapWins: number;
  mapLosses: number;
  roundDiff: number;
  winRate: number;
  trend: Trend;
  status: "advancing" | "eliminated" | "active";
  group?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STANDINGS: Standing[] = [
  { rank: 1,  previousRank: 1,    team: "Team Alpha",   tag: "ALPH", wins: 6, losses: 0, matchesPlayed: 6,  points: 180, mapWins: 14, mapLosses: 3,  roundDiff: +87,  winRate: 100, trend: "same", status: "advancing" },
  { rank: 2,  previousRank: 3,    team: "Team Nexus",   tag: "NEX",  wins: 5, losses: 1, matchesPlayed: 6,  points: 150, mapWins: 12, mapLosses: 5,  roundDiff: +54,  winRate: 83,  trend: "up",   status: "advancing" },
  { rank: 3,  previousRank: 2,    team: "Team Void",    tag: "VOD",  wins: 4, losses: 1, matchesPlayed: 5,  points: 130, mapWins: 10, mapLosses: 4,  roundDiff: +38,  winRate: 80,  trend: "down", status: "advancing" },
  { rank: 4,  previousRank: 4,    team: "Team Storm",   tag: "STM",  wins: 4, losses: 2, matchesPlayed: 6,  points: 110, mapWins: 10, mapLosses: 6,  roundDiff: +21,  winRate: 67,  trend: "same", status: "advancing" },
  { rank: 5,  previousRank: 6,    team: "Team Phantom", tag: "PHN",  wins: 3, losses: 2, matchesPlayed: 5,  points: 95,  mapWins: 8,  mapLosses: 6,  roundDiff: +8,   winRate: 60,  trend: "up",   status: "active" },
  { rank: 6,  previousRank: 5,    team: "Team Blaze",   tag: "BLZ",  wins: 3, losses: 3, matchesPlayed: 6,  points: 80,  mapWins: 7,  mapLosses: 8,  roundDiff: -12,  winRate: 50,  trend: "down", status: "active" },
  { rank: 7,  previousRank: 7,    team: "Team Nova",    tag: "NOV",  wins: 2, losses: 3, matchesPlayed: 5,  points: 60,  mapWins: 5,  mapLosses: 8,  roundDiff: -28,  winRate: 40,  trend: "same", status: "active" },
  { rank: 8,  previousRank: null, team: "Team Surge",   tag: "SRG",  wins: 2, losses: 4, matchesPlayed: 6,  points: 50,  mapWins: 5,  mapLosses: 10, roundDiff: -44,  winRate: 33,  trend: "new",  status: "active" },
  { rank: 9,  previousRank: 8,    team: "Team Apex",    tag: "APX",  wins: 1, losses: 4, matchesPlayed: 5,  points: 35,  mapWins: 3,  mapLosses: 9,  roundDiff: -61,  winRate: 20,  trend: "down", status: "eliminated" },
  { rank: 10, previousRank: 10,   team: "Team Titan",   tag: "TTN",  wins: 1, losses: 5, matchesPlayed: 6,  points: 25,  mapWins: 2,  mapLosses: 11, roundDiff: -79,  winRate: 17,  trend: "same", status: "eliminated" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up")   return <TrendingUp   className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown  className="w-3.5 h-3.5 text-rose-400"    />;
  if (trend === "new")  return <span className="text-blue-400 text-xs font-bold">NEW</span>;
  return <Minus className="w-3.5 h-3.5 text-slate-600" />;
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
      <Trophy className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
      <Medal className="w-4 h-4 text-white" />
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 text-sm font-bold">
      {rank}
    </div>
  );
}

type SortKey = "rank" | "points" | "wins" | "winRate" | "roundDiff";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentStandingsPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [sortKey,    setSortKey]    = useState<SortKey>("rank");
  const [sortAsc,    setSortAsc]    = useState(true);
  const [viewFilter, setViewFilter] = useState<"all" | "advancing" | "active" | "eliminated">("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === "rank"); }
  };

  const sorted = [...MOCK_STANDINGS]
    .filter((s) => viewFilter === "all" || s.status === viewFilter)
    .sort((a, b) => {
      let av = a[sortKey] as number;
      let bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });

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

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(k)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${sortKey === k ? "text-yellow-500" : "text-slate-500 hover:text-slate-300"}`}
    >
      {label}
      <ArrowUpDown className="w-3 h-3" />
    </button>
  );

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
              <span className="text-slate-300">Standings</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Standings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Live rankings · Updated after each match</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-3 py-2 rounded-lg text-sm transition-colors">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
                <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Standings" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Advancing",   count: MOCK_STANDINGS.filter(s => s.status === "advancing").length,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Active",      count: MOCK_STANDINGS.filter(s => s.status === "active").length,     color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Eliminated",  count: MOCK_STANDINGS.filter(s => s.status === "eliminated").length, color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20" },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setViewFilter(viewFilter === s.label.toLowerCase() as any ? "all" : s.label.toLowerCase() as any)}
                className={`border rounded-xl p-4 text-center transition-all ${s.bg} hover:brightness-110`}
              >
                <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-4 px-4 py-3 border-b border-white/[0.06] items-center">
              <div className="w-8" />
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Team</span>
              <SortBtn k="wins"      label="W/L" />
              <SortBtn k="points"    label="PTS" />
              <div className="hidden md:block"><SortBtn k="winRate"   label="Win %" /></div>
              <div className="hidden lg:block"><SortBtn k="roundDiff" label="RD" /></div>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Maps</span>
              <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Status</span>
            </div>

            {/* Rows */}
            {sorted.map((s, i) => {
              const isTop4 = s.rank <= 4;
              return (
                <div
                  key={s.team}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] gap-4 px-4 py-3.5 border-b border-white/[0.04] last:border-0 items-center transition-colors hover:bg-white/[0.02] ${
                    s.status === "eliminated" ? "opacity-50" : ""
                  } ${isTop4 ? "bg-yellow-500/[0.02]" : ""}`}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={s.trend} />
                    <RankBadge rank={s.rank} />
                  </div>

                  {/* Team */}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{s.team}</p>
                    <p className="text-slate-600 text-xs">[{s.tag}]</p>
                  </div>

                  {/* W/L */}
                  <div className="text-center">
                    <span className="text-emerald-400 text-sm font-bold">{s.wins}</span>
                    <span className="text-slate-600 text-xs mx-1">-</span>
                    <span className="text-rose-400 text-sm font-bold">{s.losses}</span>
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <p className={`text-sm font-black ${sortKey === "points" ? "text-yellow-500" : "text-white"}`}>{s.points}</p>
                  </div>

                  {/* Win % */}
                  <div className="hidden md:block text-center">
                    <p className="text-slate-300 text-sm">{s.winRate}%</p>
                  </div>

                  {/* Round Diff */}
                  <div className="hidden lg:block text-center">
                    <p className={`text-sm font-medium ${s.roundDiff > 0 ? "text-emerald-400" : s.roundDiff < 0 ? "text-rose-400" : "text-slate-500"}`}>
                      {s.roundDiff > 0 ? "+" : ""}{s.roundDiff}
                    </p>
                  </div>

                  {/* Maps */}
                  <div className="text-center">
                    <p className="text-slate-400 text-sm">
                      <span className="text-emerald-400">{s.mapWins}</span>
                      <span className="text-slate-700 mx-0.5">-</span>
                      <span className="text-rose-400">{s.mapLosses}</span>
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      s.status === "advancing"  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      s.status === "eliminated" ? "bg-slate-500/15 text-slate-500 border-slate-500/30" :
                      "bg-blue-500/15 text-blue-400 border-blue-500/30"
                    }`}>
                      {s.status === "advancing" ? "↑ Advancing" : s.status === "eliminated" ? "Eliminated" : "Active"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-slate-700 text-xs mt-3 text-center">
            PTS = Points · RD = Round Differential · Click column headers to sort
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}