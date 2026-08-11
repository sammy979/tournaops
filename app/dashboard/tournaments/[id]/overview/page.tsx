"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Trophy,
  Users,
  Calendar,
  Zap,
  Clock,
  MapPin,
  Globe,
  Edit3,
  ChevronRight,
  BarChart2,
  Shield,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowUpRight,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TOURNAMENT = {
  id: "t1",
  name: "Champions Circuit Season 4",
  game: "Valorant",
  status: "live",
  startDate: "2025-07-01",
  endDate: "2025-07-28",
  region: "North America",
  format: "Double Elimination",
  prizePool: "$10,000",
  maxTeams: 16,
  registeredTeams: 14,
  checkedInTeams: 12,
  totalMatches: 31,
  completedMatches: 18,
  pendingMatches: 8,
  liveMatches: 5,
  description:
    "The premier seasonal championship circuit for top-tier Valorant teams across North America. Featuring a full double-elimination bracket with live broadcast support.",
  organizer: "TournaOps Official",
  bannerColor: "from-violet-600 to-indigo-700",
  stages: [
    { name: "Group Stage", status: "completed", matchCount: 12 },
    { name: "Quarterfinals", status: "live", matchCount: 8 },
    { name: "Semifinals", status: "upcoming", matchCount: 4 },
    { name: "Grand Finals", status: "upcoming", matchCount: 1 },
  ],
  recentActivity: [
    { type: "match", message: "Team Alpha defeated Team Nexus 2-1", time: "5m ago", icon: "win" },
    { type: "checkin", message: "Team Phantom checked in", time: "12m ago", icon: "checkin" },
    { type: "match", message: "Team Void vs Team Storm — Live now", time: "18m ago", icon: "live" },
    { type: "result", message: "Match #19 result submitted", time: "31m ago", icon: "result" },
    { type: "alert", message: "Team Nova missed check-in deadline", time: "1h ago", icon: "alert" },
  ],
  topTeams: [
    { rank: 1, name: "Team Alpha", wins: 6, losses: 0, points: 180 },
    { rank: 2, name: "Team Nexus", wins: 5, losses: 1, points: 150 },
    { rank: 3, name: "Team Phantom", wins: 4, losses: 1, points: 130 },
    { rank: 4, name: "Team Storm", wins: 4, losses: 2, points: 110 },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string; dot: string }> = {
    live:      { label: "Live",      classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400 animate-pulse" },
    upcoming:  { label: "Upcoming",  classes: "bg-blue-500/15 text-blue-400 border-blue-500/30",         dot: "bg-blue-400" },
    completed: { label: "Completed", classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",      dot: "bg-slate-400" },
    draft:     { label: "Draft",     classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",      dot: "bg-amber-400" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5 flex items-start gap-4 hover:border-white/[0.12] transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-xs font-medium mb-0.5">{label}</p>
        <p className="text-white text-xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StageRow({ stage, index }: { stage: (typeof MOCK_TOURNAMENT.stages)[0]; index: number }) {
  const iconMap = {
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    live:      <Zap className="w-4 h-4 text-amber-400" />,
    upcoming:  <Circle className="w-4 h-4 text-slate-500" />,
  };
  const icon = iconMap[stage.status as keyof typeof iconMap] ?? iconMap.upcoming;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className="w-6 h-6 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-500 text-xs font-bold">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{stage.name}</p>
        <p className="text-slate-500 text-xs">{stage.matchCount} matches</p>
      </div>
      {icon}
      <StatusBadge status={stage.status} />
    </div>
  );
}

function ActivityItem({ item }: { item: (typeof MOCK_TOURNAMENT.recentActivity)[0] }) {
  const iconMap: Record<string, React.ReactNode> = {
    win:    <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    live:   <Zap className="w-4 h-4 text-amber-400" />,
    result: <BarChart2 className="w-4 h-4 text-blue-400" />,
    checkin:<Shield className="w-4 h-4 text-violet-400" />,
    alert:  <AlertCircle className="w-4 h-4 text-rose-400" />,
  };
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
        {iconMap[item.icon] ?? <Circle className="w-4 h-4 text-slate-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm leading-snug">{item.message}</p>
        <p className="text-slate-600 text-xs mt-0.5">{item.time}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentOverviewPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;
  const t       = MOCK_TOURNAMENT;

  const completionPct = Math.round((t.completedMatches / t.totalMatches) * 100);
  const registrationPct = Math.round((t.registeredTeams / t.maxTeams) * 100);

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

        {/* ── Hero Banner ─────────────────────────────────── */}
        <div className={`relative bg-gradient-to-r ${t.bannerColor} overflow-hidden`}>
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
          <div className="relative max-w-7xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-white transition-colors">
                Tournaments
              </button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-medium">{t.name}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <StatusBadge status={t.status} />
                  <span className="text-white/60 text-sm">{t.game}</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-1">{t.name}</h1>
                <p className="text-white/70 text-sm max-w-xl">{t.description}</p>
              </div>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors self-start md:self-auto">
                <Edit3 className="w-4 h-4" />
                Edit Tournament
              </button>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{t.startDate} — {t.endDate}</span>
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{t.region}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{t.format}</span>
              <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5" />{t.prizePool} Prize Pool</span>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ──────────────────────────────── */}
        <div className="border-b border-white/[0.06] bg-[#080a0e] sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => {
                const isActive = tab.label === "Overview";
                return (
                  <button
                    key={tab.label}
                    onClick={() => router.push(tab.href)}
                    className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? "border-violet-500 text-violet-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Page Body ────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users}   label="Teams Registered" value={`${t.registeredTeams}/${t.maxTeams}`} sub={`${t.checkedInTeams} checked in`}    color="bg-violet-500/15 text-violet-400" />
            <StatCard icon={Zap}     label="Live Matches"      value={t.liveMatches}                         sub="In progress"                           color="bg-amber-500/15 text-amber-400"  />
            <StatCard icon={CheckCircle2} label="Completed"   value={t.completedMatches}                    sub={`of ${t.totalMatches} total`}          color="bg-emerald-500/15 text-emerald-400" />
            <StatCard icon={Trophy}  label="Prize Pool"        value={t.prizePool}                           sub="Total distributed"                     color="bg-rose-500/15 text-rose-400"    />
          </div>

          {/* Progress bars row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-slate-300 text-sm font-medium">Tournament Progress</p>
                <span className="text-white font-bold text-sm">{completionPct}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs">{t.completedMatches} of {t.totalMatches} matches completed</p>
            </div>
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <p className="text-slate-300 text-sm font-medium">Registration Fill</p>
                <span className="text-white font-bold text-sm">{registrationPct}%</span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${registrationPct}%` }}
                />
              </div>
              <p className="text-slate-500 text-xs">{t.registeredTeams} of {t.maxTeams} slots filled</p>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Stages */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Stages</h2>
                <button
                  onClick={() => router.push(`/dashboard/tournaments/${id}/stages`)}
                  className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors"
                >
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {t.stages.map((stage, i) => (
                <StageRow key={stage.name} stage={stage} index={i} />
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Recent Activity</h2>
                <span className="text-slate-600 text-xs">Live feed</span>
              </div>
              {t.recentActivity.map((item, i) => (
                <ActivityItem key={i} item={item} />
              ))}
            </div>

            {/* Top Teams */}
            <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold">Top Teams</h2>
                <button
                  onClick={() => router.push(`/dashboard/tournaments/${id}/standings`)}
                  className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1 transition-colors"
                >
                  Standings <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-0">
                {t.topTeams.map((team) => (
                  <div key={team.rank} className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      team.rank === 1 ? "bg-amber-500/20 text-amber-400" :
                      team.rank === 2 ? "bg-slate-400/20 text-slate-400" :
                      team.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                      "bg-white/[0.04] text-slate-500"
                    }`}>
                      {team.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{team.name}</p>
                      <p className="text-slate-500 text-xs">{team.wins}W — {team.losses}L</p>
                    </div>
                    <div className="text-right">
                      <p className="text-violet-400 text-sm font-bold">{team.points}</p>
                      <p className="text-slate-600 text-xs">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Manage Teams",   href: "teams",         icon: Users,    color: "hover:border-violet-500/40 hover:bg-violet-500/5" },
              { label: "View Matches",   href: "matches",       icon: Zap,      color: "hover:border-amber-500/40 hover:bg-amber-500/5" },
              { label: "Standings",      href: "standings",     icon: BarChart2,color: "hover:border-emerald-500/40 hover:bg-emerald-500/5" },
              { label: "Broadcast",      href: "broadcast",     icon: Globe,    color: "hover:border-blue-500/40 hover:bg-blue-500/5" },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(`/dashboard/tournaments/${id}/${action.href}`)}
                className={`flex items-center gap-3 p-4 bg-[#0f1117] border border-white/[0.06] rounded-xl text-sm font-medium text-slate-300 transition-all ${action.color}`}
              >
                <action.icon className="w-4 h-4 flex-shrink-0" />
                {action.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </DashboardShell>
  );
}