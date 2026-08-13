"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ChevronRight,
  CheckCircle2,
  Search,
  Filter,
  BarChart2,
  Clock,
  Map,
  ArrowLeft,
} from "lucide-react";

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_RESULTS = [
  { id: "r1",  match: 1,  stage: "Group Stage",   round: "R1", team1: "Team Alpha",   score1: 2, team2: "Team Titan",   score2: 0, winner: "Team Alpha",   duration: "42m", maps: ["Ascent 13-5", "Bind 13-9"],                           date: "Jul 1" },
  { id: "r2",  match: 2,  stage: "Group Stage",   round: "R1", team1: "Team Nexus",   score1: 2, team2: "Team Blaze",   score2: 1, winner: "Team Nexus",   duration: "58m", maps: ["Haven 13-8", "Split 9-13", "Icebox 13-11"],           date: "Jul 1" },
  { id: "r3",  match: 3,  stage: "Group Stage",   round: "R2", team1: "Team Storm",   score1: 2, team2: "Team Nova",    score2: 0, winner: "Team Storm",   duration: "39m", maps: ["Pearl 13-7", "Lotus 13-10"],                          date: "Jul 2" },
  { id: "r4",  match: 4,  stage: "Group Stage",   round: "R2", team1: "Team Phantom", score1: 2, team2: "Team Surge",   score2: 1, winner: "Team Phantom", duration: "61m", maps: ["Ascent 13-10", "Bind 8-13", "Fracture 13-11"],        date: "Jul 2" },
  { id: "r5",  match: 5,  stage: "Group Stage",   round: "R3", team1: "Team Alpha",   score1: 2, team2: "Team Void",    score2: 1, winner: "Team Alpha",   duration: "55m", maps: ["Haven 13-9", "Split 11-13", "Icebox 13-8"],           date: "Jul 3" },
  { id: "r6",  match: 6,  stage: "Quarterfinals", round: "R1", team1: "Team Alpha",   score1: 2, team2: "Team Titan",   score2: 0, winner: "Team Alpha",   duration: "40m", maps: ["Ascent 13-5", "Bind 13-9"],                           date: "Jul 14" },
  { id: "r7",  match: 7,  stage: "Quarterfinals", round: "R1", team1: "Team Nexus",   score1: 2, team2: "Team Blaze",   score2: 1, winner: "Team Nexus",   duration: "62m", maps: ["Haven 13-8", "Split 9-13", "Icebox 13-11"],           date: "Jul 14" },
  { id: "r8",  match: 8,  stage: "Quarterfinals", round: "R1", team1: "Team Phantom", score1: 1, team2: "Team Void",    score2: 2, winner: "Team Void",    duration: "67m", maps: ["Pearl 13-10", "Lotus 8-13", "Fracture 10-13"],        date: "Jul 15" },
];

const STAGES = ["All Stages", "Group Stage", "Quarterfinals", "Semifinals", "Grand Finals"];

// â”€â”€â”€ Result Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultRow({ result, expanded, onToggle }: {
  result: typeof MOCK_RESULTS[0]; expanded: boolean; onToggle: () => void;
}) {
  return (
    <>
      <tr
        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <td className="py-3 px-5">
          <div>
            <p className="text-white/40 text-xs">{result.stage}</p>
            <p className="text-white/30 text-xs">{result.round} Â· #{result.match}</p>
          </div>
        </td>
        <td className="py-3 px-5">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${result.winner === result.team1 ? "text-white" : "text-white/30"}`}>{result.team1}</span>
            <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 py-1">
              <span className={`text-sm font-black ${result.winner === result.team1 ? "text-white" : "text-white/30"}`}>{result.score1}</span>
              <span className="text-white/20 text-xs mx-0.5">:</span>
              <span className={`text-sm font-black ${result.winner === result.team2 ? "text-white" : "text-white/30"}`}>{result.score2}</span>
            </div>
            <span className={`text-sm font-bold ${result.winner === result.team2 ? "text-white" : "text-white/30"}`}>{result.team2}</span>
          </div>
        </td>
        <td className="py-3 px-5">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">{result.winner}</span>
          </div>
        </td>
        <td className="py-3 px-5">
          <div className="flex items-center gap-1.5 text-white/40 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {result.duration}
          </div>
        </td>
        <td className="py-3 px-5 text-white/30 text-sm">{result.date}</td>
      </tr>
      {expanded && (
        <tr className="bg-yellow-500/[0.03] border-b border-yellow-500/10">
          <td colSpan={5} className="px-5 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Map className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-white/30 text-xs font-medium uppercase tracking-wide">Maps:</span>
              {result.maps.map((map) => (
                <span key={map} className="bg-white/[0.04] border border-white/[0.06] text-white/60 text-xs px-2.5 py-1 rounded-lg font-mono">
                  {map}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function TournamentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params?.slug as string;

  const [search,       setSearch]       = useState("");
  const [stageFilter,  setStageFilter]  = useState("All Stages");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  const filtered = MOCK_RESULTS.filter(r => {
    const q = search.toLowerCase();
    const matchQ = r.team1.toLowerCase().includes(q) || r.team2.toLowerCase().includes(q) || r.winner.toLowerCase().includes(q);
    const matchS = stageFilter === "All Stages" || r.stage === stageFilter;
    return matchQ && matchS;
  });

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">
            Tourna<span className="text-yellow-500">Ops</span>
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={() => router.push("/tournaments")} className="hover:text-white/60 transition-colors">Tournaments</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => router.push(`/tournaments/${slug}`)} className="hover:text-white/60 transition-colors">Champions Circuit S4</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Results</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back + title */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push(`/tournaments/${slug}`)}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-white/20">Â·</span>
          <h1 className="text-2xl font-black text-white">Match Results</h1>
          <span className="ml-auto text-white/30 text-sm">{MOCK_RESULTS.length} completed matches</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Matches Played", value: MOCK_RESULTS.length,                                        color: "text-white"        },
            { label: "Upsets",         value: 2,                                                           color: "text-amber-400"    },
            { label: "Avg Duration",   value: "52m",                                                       color: "text-blue-400"     },
            { label: "Maps Played",    value: MOCK_RESULTS.reduce((a, r) => a + r.maps.length, 0),         color: "text-yellow-500"   },
          ].map(s => (
            <div key={s.label} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams or winnersâ€¦"
              className="w-full bg-[#0f1117] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-500/40" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STAGES.map(s => (
              <button key={s} onClick={() => setStageFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${stageFilter === s ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/70"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f1117] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Stage", "Match", "Winner", "Duration", "Date"].map(h => (
                  <th key={h} className="text-left py-3 px-5 text-white/30 text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(r => (
                <ResultRow key={r.id} result={r} expanded={expandedId === r.id} onToggle={() => setExpandedId(prev => prev === r.id ? null : r.id)} />
              )) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <BarChart2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No results found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-white/20 text-xs mt-3 text-center">Click any row to expand map details</p>
      </div>
    </div>
  );
}