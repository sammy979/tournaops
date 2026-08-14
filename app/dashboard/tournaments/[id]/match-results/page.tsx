"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Upload,
  ChevronDown,
  Trophy,
  Zap,
  BarChart2,
  Edit3,
  X,
  Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ResultStatus = "verified" | "pending" | "disputed" | "submitted";

interface MapResult {
  map: string;
  team1Score: number;
  team2Score: number;
  winner: string;
  duration: string;
}

interface MatchResult {
  id: string;
  matchNumber: number;
  stage: string;
  round: string;
  team1: string;
  team2: string;
  winner: string;
  score: string;
  status: ResultStatus;
  submittedAt: string;
  submittedBy: string;
  maps: MapResult[];
  notes?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_RESULTS: MatchResult[] = [
  {
    id: "r1", matchNumber: 1, stage: "Quarterfinals", round: "Round 1",
    team1: "Team Alpha", team2: "Team Titan", winner: "Team Alpha", score: "2-0",
    status: "verified", submittedAt: "2025-07-14 15:48", submittedBy: "ShadowX",
    maps: [
      { map: "Ascent",  team1Score: 13, team2Score: 5,  winner: "Team Alpha", duration: "21m" },
      { map: "Bind",    team1Score: 13, team2Score: 9,  winner: "Team Alpha", duration: "26m" },
    ],
  },
  {
    id: "r2", matchNumber: 2, stage: "Quarterfinals", round: "Round 1",
    team1: "Team Nexus", team2: "Team Blaze", winner: "Team Nexus", score: "2-1",
    status: "verified", submittedAt: "2025-07-14 17:58", submittedBy: "ProStrike",
    maps: [
      { map: "Haven",   team1Score: 13, team2Score: 8,  winner: "Team Nexus", duration: "24m" },
      { map: "Split",   team1Score: 9,  team2Score: 13, winner: "Team Blaze",  duration: "20m" },
      { map: "Icebox",  team1Score: 13, team2Score: 11, winner: "Team Nexus", duration: "32m" },
    ],
  },
  {
    id: "r3", matchNumber: 3, stage: "Quarterfinals", round: "Round 1",
    team1: "Team Phantom", team2: "Team Void", winner: "Team Void", score: "1-2",
    status: "disputed", submittedAt: "2025-07-15 15:51", submittedBy: "GhostRider",
    maps: [
      { map: "Pearl",   team1Score: 13, team2Score: 10, winner: "Team Phantom", duration: "28m" },
      { map: "Lotus",   team1Score: 8,  team2Score: 13, winner: "Team Void",    duration: "22m" },
      { map: "Fracture",team1Score: 10, team2Score: 13, winner: "Team Void",    duration: "31m" },
    ],
    notes: "Team Phantom disputes map 3 result — screenshot evidence provided",
  },
  {
    id: "r4", matchNumber: 4, stage: "Quarterfinals", round: "Round 1",
    team1: "Team Storm", team2: "Team Nova", winner: "", score: "—",
    status: "pending", submittedAt: "—", submittedBy: "—",
    maps: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<ResultStatus, { label: string; badge: string; icon: React.ElementType }> = {
  verified:  { label: "Verified",  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle2  },
  pending:   { label: "Pending",   badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       icon: Clock         },
  disputed:  { label: "Disputed",  badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",          icon: AlertTriangle },
  submitted: { label: "Submitted", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",          icon: Upload        },
};

function StatusBadge({ status }: { status: ResultStatus }) {
  const cfg  = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: MatchResult }) {
  const [expanded, setExpanded] = useState(result.status === "disputed");
  const isDisputed = result.status === "disputed";

  return (
    <div className={`bg-[#0f1117] border rounded-xl overflow-hidden transition-all ${isDisputed ? "border-rose-500/30 ring-1 ring-rose-500/10" : "border-white/[0.06] hover:border-white/[0.12]"}`}>
      {/* Main row */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Match # */}
        <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-slate-600 text-xs leading-none">#</span>
          <span className="text-slate-300 text-sm font-bold leading-none">{result.matchNumber}</span>
        </div>

        {/* Teams */}
        <div className="flex-1 min-w-0">
          <p className="text-slate-500 text-xs mb-1">{result.stage} · {result.round}</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold ${result.winner === result.team1 ? "text-white" : "text-slate-500"}`}>
              {result.team1}
            </span>
            <div className={`px-2.5 py-0.5 rounded-md text-xs font-black ${result.status === "pending" ? "bg-white/[0.04] text-slate-600" : "bg-white/[0.06] text-white"}`}>
              {result.score}
            </div>
            <span className={`text-sm font-semibold ${result.winner === result.team2 ? "text-white" : "text-slate-500"}`}>
              {result.team2}
            </span>
          </div>
          {result.winner && (
            <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500" /> {result.winner} wins
            </p>
          )}
        </div>

        {/* Status + Meta */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={result.status} />
          {result.submittedAt !== "—" && (
            <p className="text-slate-600 text-xs">{result.submittedAt}</p>
          )}
          {result.submittedBy !== "—" && (
            <p className="text-slate-600 text-xs">by {result.submittedBy}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {result.status === "pending" && (
            <button className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
              <Plus className="w-3 h-3" /> Submit
            </button>
          )}
          {result.status === "disputed" && (
            <button className="flex items-center gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors">
              <AlertTriangle className="w-3 h-3" /> Resolve
            </button>
          )}
          {result.status === "verified" && (
            <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dispute notice */}
      {isDisputed && (
        <div className="mx-5 mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-rose-400 text-xs flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {result.notes}
          </p>
        </div>
      )}

      {/* Expanded: Map breakdown */}
      {expanded && result.maps.length > 0 && (
        <div className="px-5 pb-5 border-t border-white/[0.04] mt-2 pt-4">
          <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Map Results</h4>
          <div className="space-y-2">
            {result.maps.map((map, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5">
                <span className="text-slate-600 text-xs font-medium w-4">{i + 1}</span>
                <span className="text-slate-300 text-sm font-medium flex-1">{map.map}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${map.winner === result.team1 ? "text-white" : "text-slate-500"}`}>{map.team1Score}</span>
                  <span className="text-slate-600 text-xs">—</span>
                  <span className={`text-sm font-bold ${map.winner === result.team2 ? "text-white" : "text-slate-500"}`}>{map.team2Score}</span>
                </div>
                <span className="text-slate-600 text-xs w-8 text-right">{map.duration}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${map.winner === result.team1 ? "bg-yellow-500/15 text-yellow-500" : "bg-yellow-500/15 text-yellow-500"}`}>
                  {map.winner === result.team1 ? result.team1.split(" ")[1] : result.team2.split(" ")[1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && result.maps.length === 0 && (
        <div className="px-5 pb-5 border-t border-white/[0.04] mt-2 pt-4 text-center">
          <p className="text-slate-600 text-sm">No map results submitted yet.</p>
        </div>
      )}
    </div>
  );
}

// ─── Submit Result Modal (minimal) ────────────────────────────────────────────
// (Placeholder — full modal can be built separately)

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MatchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = MOCK_RESULTS.filter((r) => {
    const q = search.toLowerCase();
    const matchQ = r.team1.toLowerCase().includes(q) || r.team2.toLowerCase().includes(q) || String(r.matchNumber).includes(q);
    const matchS = statusFilter === "all" || r.status === statusFilter;
    return matchQ && matchS;
  });

  const stats = {
    total:    MOCK_RESULTS.length,
    verified: MOCK_RESULTS.filter(r => r.status === "verified").length,
    pending:  MOCK_RESULTS.filter(r => r.status === "pending").length,
    disputed: MOCK_RESULTS.filter(r => r.status === "disputed").length,
  };

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
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Match Results</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Match Results</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-emerald-400 text-sm">{stats.verified} Verified</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 text-sm">{stats.pending} Pending</span>
                  {stats.disputed > 0 && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400 text-sm font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />{stats.disputed} Disputed
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" /> Submit Result
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Match Results" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search by team or match #…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f1117] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50" />
            </div>
            <div className="flex items-center gap-2">
              {["all", "verified", "pending", "disputed", "submitted"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.08]"}`}>
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((r) => <ResultCard key={r.id} result={r} />)}
            </div>
          ) : (
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl py-16 text-center">
              <ClipboardList className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No results found for your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}