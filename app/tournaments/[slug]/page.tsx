"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Globe,
  MapPin,
  Clock,
  ChevronRight,
  Zap,
  Shield,
  Star,
  ExternalLink,
  Play,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MOCK_TOURNAMENT = {
  slug:         "champions-circuit-s4",
  name:         "Champions Circuit Season 4",
  game:         "Valorant",
  status:       "live",
  startDate:    "July 1, 2025",
  endDate:      "July 28, 2025",
  region:       "North America",
  format:       "Double Elimination",
  prizePool:    "$10,000",
  maxTeams:     16,
  registeredTeams: 14,
  organizer:    "TournaOps Official",
  description:  "The premier seasonal championship circuit for top-tier Valorant teams across North America. Featuring a full double-elimination bracket with live broadcast support, professional casters, and a $10,000 prize pool.",
  bannerGradient: "from-yellow-900 via-yellow-500 to-slate-900",
  game_icon:    "ðŸŽ®",
  prizes: [
    { place: "1st", amount: "$5,000", icon: "ðŸ¥‡" },
    { place: "2nd", amount: "$2,500", icon: "ðŸ¥ˆ" },
    { place: "3rd", amount: "$1,500", icon: "ðŸ¥‰" },
    { place: "4th", amount: "$1,000", icon: "4th" },
  ],
  schedule: [
    { stage: "Group Stage",   date: "July 1â€“10",   status: "completed" },
    { stage: "Quarterfinals", date: "July 14â€“17",  status: "live"      },
    { stage: "Semifinals",    date: "July 21â€“23",  status: "upcoming"  },
    { stage: "Grand Finals",  date: "July 28",     status: "upcoming"  },
  ],
  topTeams: [
    { rank: 1, name: "Team Alpha",   tag: "ALPH", wins: 6, losses: 0 },
    { rank: 2, name: "Team Nexus",   tag: "NEX",  wins: 5, losses: 1 },
    { rank: 3, name: "Team Void",    tag: "VOD",  wins: 4, losses: 1 },
    { rank: 4, name: "Team Storm",   tag: "STM",  wins: 4, losses: 2 },
  ],
  liveMatches: [
    { id: "m4", team1: "Team Storm",   team2: "Team Nova",  stage: "Quarterfinals", time: "Live Now" },
    { id: "m5", team1: "Team Alpha",   team2: "Team Nexus", stage: "Quarterfinals", time: "Live Now" },
  ],
  rules: [
    "All matches are Best-of-3 (Bo3) except Grand Finals which is Bo7",
    "Teams must check in 15 minutes before their scheduled match",
    "Default map veto order applies unless agreed otherwise",
    "Screenshots of final scores required for result submission",
    "Use of unauthorized software results in immediate disqualification",
    "All disputes must be reported within 10 minutes of match completion",
  ],
  registrationOpen: false,
};

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string; dot: string }> = {
    live:      { label: "Live Now",  classes: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", dot: "bg-emerald-400 animate-pulse" },
    upcoming:  { label: "Upcoming",  classes: "bg-blue-500/20 text-blue-300 border-blue-500/40",         dot: "bg-blue-400" },
    completed: { label: "Completed", classes: "bg-white/10 text-white/60 border-white/20",               dot: "bg-white/40" },
    open:      { label: "Open",      classes: "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",   dot: "bg-yellow-500" },
  };
  const cfg = map[status] ?? map.upcoming;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PublicTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params?.slug as string;
  const t      = MOCK_TOURNAMENT;

  const [activeTab, setActiveTab] = useState<"overview" | "bracket" | "standings" | "rules">("overview");

  return (
    <div className="min-h-screen bg-[#060810] text-white">

      {/* â”€â”€ Top Nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-white font-black text-lg tracking-tight">
            Tourna<span className="text-yellow-500">Ops</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/tournaments")} className="text-slate-400 hover:text-white text-sm transition-colors">
              All Tournaments
            </button>
            <button onClick={() => router.push("/login")} className="bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={`relative bg-gradient-to-br ${t.bannerGradient} overflow-hidden`}>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060810]" />

        <div className="relative max-w-6xl mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <button onClick={() => router.push("/tournaments")} className="hover:text-white/80 transition-colors">Tournaments</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">{t.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <StatusBadge status={t.status} />
                <span className="text-white/50 text-sm">{t.game}</span>
                <span className="text-white/30">Â·</span>
                <span className="text-white/50 text-sm">{t.region}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">{t.name}</h1>
              <p className="text-white/60 text-base max-w-xl leading-relaxed mb-6">{t.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-white/30" />{t.startDate} â€” {t.endDate}</span>
                <span className="flex items-center gap-1.5"><Globe    className="w-4 h-4 text-white/30" />{t.region}</span>
                <span className="flex items-center gap-1.5"><MapPin   className="w-4 h-4 text-white/30" />{t.format}</span>
                <span className="flex items-center gap-1.5"><Users    className="w-4 h-4 text-white/30" />{t.registeredTeams}/{t.maxTeams} Teams</span>
              </div>

              <div className="flex gap-3 mt-6 flex-wrap">
                {t.registrationOpen ? (
                  <Link href={`/tournaments/${slug}/register`}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                    Register Now <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] text-white/50 px-5 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed">
                    <Lock className="w-4 h-4" /> Registration Closed
                  </div>
                )}
                <Link href={`/bracket/${slug}`}
                  className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                  <BarChart2 className="w-4 h-4" /> View Bracket
                </Link>
              </div>
            </div>

            {/* Prize pool card */}
            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.10] rounded-2xl p-6 w-full lg:w-72 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-bold">Prize Pool</h3>
                <span className="ml-auto text-2xl font-black text-amber-400">{t.prizePool}</span>
              </div>
              <div className="space-y-2">
                {t.prizes.map((p) => (
                  <div key={p.place} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{typeof p.icon === "string" && p.icon.length <= 3 ? p.icon : ""}</span>
                      <span className="text-white/70 text-sm font-medium">{p.place} Place</span>
                    </div>
                    <span className="text-white font-bold">{p.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <p className="text-white/40 text-xs text-center">Organized by {t.organizer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sticky top-14 z-40 bg-[#060810]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {(["overview", "bracket", "standings", "rules"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-yellow-500 text-yellow-500"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* â”€â”€ Content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Live matches + Schedule */}
            <div className="lg:col-span-2 space-y-6">
              {/* Live Matches */}
              {t.liveMatches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h2 className="text-white font-bold">Live Now</h2>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {t.liveMatches.map((match) => (
                      <div key={match.id} className="bg-[#0f1117] border border-amber-500/20 rounded-xl p-4 ring-1 ring-amber-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">{match.stage}</span>
                          <span className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />{match.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold">{match.team1}</span>
                          <span className="text-white/30 text-sm font-black">VS</span>
                          <span className="text-white font-bold">{match.team2}</span>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <button className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors">
                            <Play className="w-3.5 h-3.5" /> Watch Live
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div>
                <h2 className="text-white font-bold mb-3">Tournament Schedule</h2>
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                  {t.schedule.map((item, i) => (
                    <div key={item.stage} className={`flex items-center gap-4 px-5 py-4 ${i < t.schedule.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                        item.status === "live"      ? "bg-amber-500/20 text-amber-400"    :
                        "bg-white/[0.04] text-white/20"
                      }`}>
                        {item.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
                         item.status === "live"      ? <Zap className="w-4 h-4" />          :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${item.status === "upcoming" ? "text-white/40" : "text-white"}`}>{item.stage}</p>
                        <p className="text-white/40 text-xs">{item.date}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Standings preview */}
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-bold">Top Teams</h2>
                  <button onClick={() => setActiveTab("standings")} className="text-yellow-500 hover:text-yellow-500 text-xs flex items-center gap-1 transition-colors">
                    Full standings <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
                  {t.topTeams.map((team, i) => (
                    <div key={team.name} className={`flex items-center gap-3 px-4 py-3.5 ${i < t.topTeams.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                        team.rank === 1 ? "bg-amber-500/20 text-amber-400" :
                        team.rank === 2 ? "bg-slate-400/20 text-slate-300" :
                        team.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                        "bg-white/[0.04] text-white/30"
                      }`}>
                        {team.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{team.name}</p>
                        <p className="text-white/30 text-xs">[{team.tag}]</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 text-sm font-bold">{team.wins}W</span>
                        <span className="text-white/20 mx-1">Â·</span>
                        <span className="text-rose-400 text-sm font-bold">{team.losses}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <h3 className="text-white font-bold mb-3">About</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Game",      value: t.game       },
                    { label: "Format",    value: t.format     },
                    { label: "Region",    value: t.region     },
                    { label: "Teams",     value: `${t.registeredTeams}/${t.maxTeams}` },
                    { label: "Organizer", value: t.organizer  },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-white/40">{row.label}</span>
                      <span className="text-white/80 font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bracket Tab */}
        {activeTab === "bracket" && (
          <div className="text-center py-16">
            <BarChart2 className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-white text-xl font-bold mb-2">Interactive Bracket</h2>
            <p className="text-white/40 mb-6">View the full tournament bracket with live results</p>
            <Link href={`/bracket/${slug}`}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Open Full Bracket <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Standings Tab */}
        {activeTab === "standings" && (
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
              {["#", "Team", "W", "L", "Points"].map(h => (
                <span key={h} className="text-white/30 text-xs font-medium uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {[
              { rank: 1,  name: "Team Alpha",   tag: "ALPH", wins: 6, losses: 0, points: 180 },
              { rank: 2,  name: "Team Nexus",   tag: "NEX",  wins: 5, losses: 1, points: 150 },
              { rank: 3,  name: "Team Void",    tag: "VOD",  wins: 4, losses: 1, points: 130 },
              { rank: 4,  name: "Team Storm",   tag: "STM",  wins: 4, losses: 2, points: 110 },
              { rank: 5,  name: "Team Phantom", tag: "PHN",  wins: 3, losses: 2, points: 95  },
              { rank: 6,  name: "Team Blaze",   tag: "BLZ",  wins: 3, losses: 3, points: 80  },
              { rank: 7,  name: "Team Nova",    tag: "NOV",  wins: 2, losses: 3, points: 60  },
              { rank: 8,  name: "Team Titan",   tag: "TTN",  wins: 1, losses: 5, points: 25  },
            ].map((team, i) => (
              <div key={team.name} className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-4 items-center ${i < 7 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                  team.rank === 1 ? "bg-amber-500/20 text-amber-400" :
                  team.rank === 2 ? "bg-slate-400/20 text-slate-300" :
                  team.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                  "bg-white/[0.04] text-white/30"
                }`}>{team.rank}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{team.name}</p>
                  <p className="text-white/30 text-xs">[{team.tag}]</p>
                </div>
                <span className="text-emerald-400 font-bold text-sm">{team.wins}</span>
                <span className="text-rose-400 font-bold text-sm">{team.losses}</span>
                <span className="text-yellow-500 font-black text-sm">{team.points}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === "rules" && (
          <div className="max-w-2xl">
            <h2 className="text-white font-bold text-xl mb-4">Tournament Rules</h2>
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
              <div className="space-y-3">
                {t.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] mt-16 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-black">Tourna<span className="text-yellow-500">Ops</span></span>
          <p className="text-white/30 text-sm">Â© 2025 TournaOps. All rights reserved.</p>
          <div className="flex gap-4 text-white/30 text-sm">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}