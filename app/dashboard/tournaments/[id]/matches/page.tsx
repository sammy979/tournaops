"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Zap,
  Search,
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  MoreVertical,
  Calendar,
  Hash,
  Users,
  Edit3,
  Eye,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = "live" | "scheduled" | "completed" | "cancelled" | "bye";

interface MatchTeam {
  name: string;
  tag: string;
  score?: number;
}

interface Match {
  id: string;
  number: number;
  stage: string;
  round: string;
  team1: MatchTeam;
  team2: MatchTeam;
  status: MatchStatus;
  scheduledAt: string;
  bestOf: number;
  caster?: string;
  winner?: string;
  duration?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_MATCHES: Match[] = [
  { id: "m1",  number: 1,  stage: "Quarterfinals", round: "Round 1", team1: { name: "Team Alpha",   tag: "ALPH", score: 2 }, team2: { name: "Team Titan",   tag: "TTN",  score: 0 }, status: "completed",  scheduledAt: "2025-07-14 14:00", bestOf: 3, winner: "Team Alpha",   duration: "42m" },
  { id: "m2",  number: 2,  stage: "Quarterfinals", round: "Round 1", team1: { name: "Team Nexus",   tag: "NEX",  score: 2 }, team2: { name: "Team Blaze",   tag: "BLZ",  score: 1 }, status: "completed",  scheduledAt: "2025-07-14 16:00", bestOf: 3, winner: "Team Nexus",   duration: "58m" },
  { id: "m3",  number: 3,  stage: "Quarterfinals", round: "Round 1", team1: { name: "Team Phantom", tag: "PHN",  score: 1 }, team2: { name: "Team Void",    tag: "VOD",  score: 2 }, status: "completed",  scheduledAt: "2025-07-15 14:00", bestOf: 3, winner: "Team Void",    duration: "67m" },
  { id: "m4",  number: 4,  stage: "Quarterfinals", round: "Round 1", team1: { name: "Team Storm",   tag: "STM"             }, team2: { name: "Team Nova",    tag: "NOV"             }, status: "live",       scheduledAt: "2025-07-15 16:00", bestOf: 3, caster: "Commentator X" },
  { id: "m5",  number: 5,  stage: "Quarterfinals", round: "Round 2", team1: { name: "Team Alpha",   tag: "ALPH"            }, team2: { name: "Team Nexus",   tag: "NEX"             }, status: "live",       scheduledAt: "2025-07-16 14:00", bestOf: 3, caster: "Commentator Y" },
  { id: "m6",  number: 6,  stage: "Quarterfinals", round: "Round 2", team1: { name: "TBD",          tag: "TBD"             }, team2: { name: "TBD",          tag: "TBD"             }, status: "scheduled",  scheduledAt: "2025-07-16 16:00", bestOf: 3 },
  { id: "m7",  number: 7,  stage: "Quarterfinals", round: "Round 2", team1: { name: "TBD",          tag: "TBD"             }, team2: { name: "TBD",          tag: "TBD"             }, status: "scheduled",  scheduledAt: "2025-07-17 14:00", bestOf: 3 },
  { id: "m8",  number: 8,  stage: "Quarterfinals", round: "Round 2", team1: { name: "TBD",          tag: "TBD"             }, team2: { name: "TBD",          tag: "TBD"             }, status: "scheduled",  scheduledAt: "2025-07-17 16:00", bestOf: 3 },
  { id: "m9",  number: 9,  stage: "Semifinals",    round: "Round 1", team1: { name: "TBD",          tag: "TBD"             }, team2: { name: "TBD",          tag: "TBD"             }, status: "scheduled",  scheduledAt: "2025-07-21 14:00", bestOf: 5 },
  { id: "m10", number: 10, stage: "Semifinals",    round: "Round 1", team1: { name: "TBD",          tag: "TBD"             }, team2: { name: "TBD",          tag: "TBD"             }, status: "scheduled",  scheduledAt: "2025-07-21 17:00", bestOf: 5 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<MatchStatus, { label: string; badge: string; row: string }> = {
  live:      { label: "LIVE",       badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       row: "bg-amber-500/[0.03] border-amber-500/10" },
  scheduled: { label: "Scheduled",  badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",          row: "" },
  completed: { label: "Completed",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", row: "" },
  cancelled: { label: "Cancelled",  badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",          row: "bg-rose-500/[0.02]" },
  bye:       { label: "Bye",        badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",       row: "" },
};

function StatusBadge({ status }: { status: MatchStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = status === "live" ? Zap : status === "completed" ? CheckCircle2 : status === "cancelled" ? AlertTriangle : Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────
function MatchCard({ match }: { match: Match }) {
  const cfg     = STATUS_CFG[match.status];
  const isLive  = match.status === "live";
  const isDone  = match.status === "completed";

  return (
    <div className={`bg-[#0f1117] border rounded-xl p-4 transition-all hover:border-white/[0.12] ${cfg.row || "border-white/[0.06]"} ${isLive ? "ring-1 ring-amber-500/20" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Match number */}
        <div className="flex-shrink-0 text-center">
          <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <span className="text-slate-500 text-xs font-bold">#{match.number}</span>
          </div>
          {isLive && (
            <div className="mt-1 flex justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-slate-600 text-xs">{match.stage}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-xs">{match.round}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-xs">BO{match.bestOf}</span>
          </div>

          {/* Versus display */}
          <div className="flex items-center gap-3">
            <div className={`flex-1 text-right ${isDone && match.winner === match.team1.name ? "text-white" : "text-slate-400"}`}>
              <p className={`text-sm font-semibold truncate ${isDone && match.winner === match.team1.name ? "text-white" : "text-slate-400"}`}>
                {match.team1.name}
              </p>
              <p className="text-slate-600 text-xs">[{match.team1.tag}]</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isDone ? (
                <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1">
                  <span className={`text-lg font-black ${match.winner === match.team1.name ? "text-white" : "text-slate-500"}`}>{match.team1.score}</span>
                  <span className="text-slate-700 text-sm">:</span>
                  <span className={`text-lg font-black ${match.winner === match.team2.name ? "text-white" : "text-slate-500"}`}>{match.team2.score}</span>
                </div>
              ) : isLive ? (
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400 text-xs font-bold">LIVE</span>
                </div>
              ) : (
                <div className="text-slate-600 text-xs font-medium">vs</div>
              )}
            </div>

            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold truncate ${isDone && match.winner === match.team2.name ? "text-white" : "text-slate-400"}`}>
                {match.team2.name}
              </p>
              <p className="text-slate-600 text-xs">[{match.team2.tag}]</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-shrink-0 text-right space-y-1">
          <StatusBadge status={match.status} />
          <p className="text-slate-600 text-xs flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {match.scheduledAt}
          </p>
          {match.caster && (
            <p className="text-yellow-500 text-xs">{match.caster}</p>
          )}
          {match.duration && (
            <p className="text-slate-600 text-xs">{match.duration}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1">
          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [search,      setSearch]      = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter,setStatusFilter]= useState("all");

  const stages  = ["all", ...Array.from(new Set(MOCK_MATCHES.map((m) => m.stage)))];
  const statuses= ["all", "live", "scheduled", "completed", "cancelled"];

  const filtered = MOCK_MATCHES.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch = m.team1.name.toLowerCase().includes(q) || m.team2.name.toLowerCase().includes(q) || String(m.number).includes(q);
    const matchStage  = stageFilter === "all"  || m.stage  === stageFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStage && matchStatus;
  });

  const liveCount      = MOCK_MATCHES.filter((m) => m.status === "live").length;
  const scheduledCount = MOCK_MATCHES.filter((m) => m.status === "scheduled").length;
  const completedCount = MOCK_MATCHES.filter((m) => m.status === "completed").length;

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
    <>
      <div className="min-h-screen bg-[#080a0e] text-white">

        {/* Header */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Matches</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Matches</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-amber-400 text-sm font-medium flex items-center gap-1"><Zap className="w-3.5 h-3.5" />{liveCount} Live</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-blue-400 text-sm">{scheduledCount} Scheduled</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-emerald-400 text-sm">{completedCount} Done</span>
                </div>
              </div>
              <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Calendar className="w-4 h-4" /> Schedule Match
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Matches" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by team or match number…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f1117] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {stages.map((s) => (
                <button key={s} onClick={() => setStageFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${stageFilter === s ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.08]"}`}>
                  {s === "all" ? "All Stages" : s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {statuses.map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.08]"}`}>
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Match list */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl py-16 text-center">
              <Zap className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No matches found for your filters.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}