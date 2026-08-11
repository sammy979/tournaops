"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  ChevronRight,
  Zap,
  BarChart2,
  Users,
  Map,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Shield,
  Globe,
  ArrowLeft,
  Medal,
} from "lucide-react";

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_PLAYER = {
  id:          "p1",
  name:        "ShadowX",
  ign:         "ShadowX#NA1",
  realName:    "Marcus T.",
  role:        "IGL / Entry",
  team:        "Team Alpha",
  teamTag:     "ALPH",
  game:        "Valorant",
  region:      "North America",
  rank:        "Radiant",
  avatar:      "S",
  joined:      "January 2024",
  bio:         "Competitive Valorant IGL with 4 years of tournament experience. Known for aggressive entry fragging and strategic shot-calling.",
  stats: {
    tournamentsPlayed: 12,
    wins:              8,
    losses:            4,
    winRate:           67,
    totalMatches:      47,
    matchWins:         31,
    avgKD:             1.42,
    avgACS:            248,
    mapsPlayed:        89,
    topFinishes:       3,
  },
  recentTournaments: [
    { name: "Champions Circuit S4", placement: 1,  date: "Jul 2025", prize: "$5,000", result: "Win"  },
    { name: "Spring Invitational",  placement: 2,  date: "Apr 2025", prize: "$2,000", result: "Loss" },
    { name: "Winter Series",        placement: 3,  date: "Jan 2025", prize: "$1,000", result: "Loss" },
    { name: "Fall Championship",    placement: 1,  date: "Oct 2024", prize: "$3,000", result: "Win"  },
    { name: "Summer Open",          placement: 4,  date: "Jul 2024", prize: "$500",   result: "Loss" },
  ],
  mapStats: [
    { map: "Ascent",   played: 18, winRate: 72, avgACS: 264 },
    { map: "Haven",    played: 14, winRate: 64, avgACS: 251 },
    { map: "Bind",     played: 12, winRate: 75, avgACS: 238 },
    { map: "Icebox",   played: 11, winRate: 55, avgACS: 231 },
    { map: "Pearl",    played: 9,  winRate: 67, avgACS: 248 },
  ],
  teammates: [
    { name: "NightOwl", role: "Entry",    ign: "Night#NA2"   },
    { name: "Flux",     role: "Support",  ign: "Flux#NA3"    },
    { name: "Venom",    role: "Duelist",  ign: "Venom#NA4"   },
    { name: "Cipher",   role: "Sentinel", ign: "Cipher#NA5"  },
  ],
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PlacementBadge({ place }: { place: number }) {
  if (place === 1) return <span className="text-amber-400 font-black text-sm flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> 1st</span>;
  if (place === 2) return <span className="text-slate-300 font-black text-sm flex items-center gap-1"><Medal className="w-3.5 h-3.5" /> 2nd</span>;
  if (place === 3) return <span className="text-orange-400 font-black text-sm flex items-center gap-1"><Medal className="w-3.5 h-3.5" /> 3rd</span>;
  return <span className="text-white/40 font-bold text-sm">{place}th</span>;
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const p = MOCK_PLAYER;

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg">
            Tourna<span className="text-violet-400">Ops</span>
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={() => router.push("/rankings")} className="hover:text-white/70 transition-colors">Rankings</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">{p.name}</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-950/50 via-[#060810] to-indigo-950/30 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-violet-500/30">
                {p.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#060810]">
                <span className="text-white text-xs font-black">âœ“</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl font-black text-white">{p.name}</h1>
                <span className="bg-violet-500/15 border border-violet-500/20 text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full">{p.rank}</span>
              </div>
              <p className="text-white/50 text-sm mb-1">{p.ign}</p>
              <div className="flex items-center gap-3 text-sm text-white/40 flex-wrap mb-4">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" />{p.role}</span>
                <span>Â·</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{p.team} [{p.teamTag}]</span>
                <span>Â·</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{p.region}</span>
              </div>
              <p className="text-white/50 text-sm max-w-xl leading-relaxed">{p.bio}</p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 flex-shrink-0">
              {[
                { label: "Win Rate",   value: `${p.stats.winRate}%`, color: "text-emerald-400" },
                { label: "Avg K/D",    value: p.stats.avgKD,          color: "text-violet-400"  },
                { label: "Avg ACS",    value: p.stats.avgACS,         color: "text-amber-400"   },
                { label: "Top Finishes",value: p.stats.topFinishes,   color: "text-rose-400"    },
              ].map(s => (
                <div key={s.label} className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-3 text-center">
                  <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Tournament history + Map stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tournament history */}
            <div>
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Tournament History
              </h2>
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                {p.recentTournaments.map((t, i) => (
                  <div key={t.name} className={`flex items-center gap-4 px-5 py-4 ${i < p.recentTournaments.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                    <PlacementBadge place={t.placement} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                      <p className="text-white/30 text-xs">{t.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 text-sm font-bold">{t.prize}</p>
                      <p className={`text-xs ${t.result === "Win" ? "text-emerald-400" : "text-rose-400"}`}>{t.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map stats */}
            <div>
              <h2 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Map className="w-5 h-5 text-blue-400" /> Map Performance
              </h2>
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="grid grid-cols-4 px-5 py-3 border-b border-white/[0.06] text-white/30 text-xs font-medium uppercase tracking-wide">
                  <span>Map</span><span className="text-center">Played</span><span className="text-center">Win %</span><span className="text-center">Avg ACS</span>
                </div>
                {p.mapStats.map((map, i) => (
                  <div key={map.map} className={`grid grid-cols-4 px-5 py-3.5 items-center ${i < p.mapStats.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">{map.map[0]}</div>
                      <span className="text-white text-sm font-medium">{map.map}</span>
                    </div>
                    <span className="text-center text-white/60 text-sm">{map.played}</span>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${map.winRate >= 65 ? "text-emerald-400" : map.winRate >= 50 ? "text-white" : "text-rose-400"}`}>{map.winRate}%</span>
                      <div className="w-16 bg-white/[0.06] rounded-full h-1">
                        <div className={`h-1 rounded-full ${map.winRate >= 65 ? "bg-emerald-500" : map.winRate >= 50 ? "bg-blue-500" : "bg-rose-500"}`} style={{ width: `${map.winRate}%` }} />
                      </div>
                    </div>
                    <span className="text-center text-violet-400 text-sm font-bold">{map.avgACS}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Stats + teammates */}
          <div className="space-y-5">
            {/* Overall stats */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" /> Career Stats
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Tournaments",   value: p.stats.tournamentsPlayed                  },
                  { label: "Wins",          value: p.stats.wins,   color: "text-emerald-400"  },
                  { label: "Losses",        value: p.stats.losses, color: "text-rose-400"     },
                  { label: "Total Matches", value: p.stats.totalMatches                       },
                  { label: "Match Wins",    value: p.stats.matchWins                          },
                  { label: "Maps Played",   value: p.stats.mapsPlayed                         },
                ].map(s => (
                  <div key={s.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/40 text-sm">{s.label}</span>
                    <span className={`font-bold text-sm ${(s as any).color || "text-white"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" /> Current Team
              </h2>
              <div className="flex items-center gap-3 mb-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-violet-600/30 flex items-center justify-center text-violet-300 font-black text-sm">{p.teamTag}</div>
                <div>
                  <p className="text-white font-bold text-sm">{p.team}</p>
                  <p className="text-violet-300/60 text-xs">[{p.teamTag}] Â· {p.region}</p>
                </div>
              </div>
              <div className="space-y-2">
                {p.teammates.map(tm => (
                  <div key={tm.name} className="flex items-center gap-3 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40">{tm.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">{tm.name}</p>
                      <p className="text-white/30 text-xs font-mono">{tm.ign}</p>
                    </div>
                    <span className="text-violet-400/60 text-xs">{tm.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" /> Achievements
              </h2>
              <div className="space-y-2">
                {[
                  { label: "Tournament Champion Ã—3",    icon: "ðŸ†" },
                  { label: "100% Check-In Rate",         icon: "âœ…" },
                  { label: "Top Fragger (5 events)",     icon: "âš¡" },
                  { label: "Veteran (1+ year active)",   icon: "ðŸŽ–ï¸" },
                ].map(a => (
                  <div key={a.label} className="flex items-center gap-2.5 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-lg">{a.icon}</span>
                    <span className="text-white/60 text-sm">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-violet-400">Ops</span></span>
          <p className="text-white/20 text-sm">Â© 2025 TournaOps</p>
        </div>
      </footer>
    </div>
  );
}