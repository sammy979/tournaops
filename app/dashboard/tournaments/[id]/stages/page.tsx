"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Layers,
  Plus,
  ChevronRight,
  ChevronDown,
  Zap,
  CheckCircle2,
  Circle,
  Settings,
  MoreVertical,
  Users,
  Trophy,
  GitBranch,
  Hash,
  Clock,
  Play,
  Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type StageStatus = "completed" | "live" | "upcoming" | "locked";
type BracketFormat = "single-elim" | "double-elim" | "round-robin" | "swiss";

interface Stage {
  id: string;
  name: string;
  status: StageStatus;
  format: BracketFormat;
  order: number;
  totalMatches: number;
  completedMatches: number;
  teamCount: number;
  advancingTeams: number;
  startDate: string;
  endDate: string;
  description: string;
  groups?: { name: string; teams: number; matches: number }[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STAGES: Stage[] = [
  {
    id: "s1",
    name: "Group Stage",
    status: "completed",
    format: "round-robin",
    order: 1,
    totalMatches: 12,
    completedMatches: 12,
    teamCount: 16,
    advancingTeams: 8,
    startDate: "2025-07-01",
    endDate: "2025-07-10",
    description: "All 16 teams divided into 4 groups of 4. Top 2 from each group advance.",
    groups: [
      { name: "Group A", teams: 4, matches: 3 },
      { name: "Group B", teams: 4, matches: 3 },
      { name: "Group C", teams: 4, matches: 3 },
      { name: "Group D", teams: 4, matches: 3 },
    ],
  },
  {
    id: "s2",
    name: "Quarterfinals",
    status: "live",
    format: "single-elim",
    order: 2,
    totalMatches: 8,
    completedMatches: 3,
    teamCount: 8,
    advancingTeams: 4,
    startDate: "2025-07-14",
    endDate: "2025-07-17",
    description: "Best-of-3 series. Top 4 teams advance to the semifinals.",
  },
  {
    id: "s3",
    name: "Semifinals",
    status: "upcoming",
    format: "single-elim",
    order: 3,
    totalMatches: 4,
    completedMatches: 0,
    teamCount: 4,
    advancingTeams: 2,
    startDate: "2025-07-21",
    endDate: "2025-07-23",
    description: "Best-of-5 series. Top 2 teams advance to the Grand Finals.",
  },
  {
    id: "s4",
    name: "Grand Finals",
    status: "locked",
    format: "double-elim",
    order: 4,
    totalMatches: 3,
    completedMatches: 0,
    teamCount: 2,
    advancingTeams: 1,
    startDate: "2025-07-28",
    endDate: "2025-07-28",
    description: "Best-of-7 championship series for the title of Season 4 Champions.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<StageStatus, { label: string; icon: React.ElementType; badge: string; glow: string }> = {
  completed: { label: "Completed", icon: CheckCircle2, badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", glow: "border-l-emerald-500" },
  live:      { label: "Live",      icon: Zap,          badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       glow: "border-l-amber-500"   },
  upcoming:  { label: "Upcoming",  icon: Clock,        badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",          glow: "border-l-blue-500"    },
  locked:    { label: "Locked",    icon: Lock,         badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",       glow: "border-l-slate-600"   },
};

const FORMAT_LABELS: Record<BracketFormat, string> = {
  "single-elim":  "Single Elimination",
  "double-elim":  "Double Elimination",
  "round-robin":  "Round Robin",
  swiss:          "Swiss",
};

function StatusBadge({ status }: { status: StageStatus }) {
  const cfg = STATUS_CFG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Stage Card ───────────────────────────────────────────────────────────────
function StageCard({ stage }: { stage: Stage }) {
  const [expanded, setExpanded] = useState(stage.status === "live");
  const cfg = STATUS_CFG[stage.status];
  const pct = stage.totalMatches > 0 ? Math.round((stage.completedMatches / stage.totalMatches) * 100) : 0;

  return (
    <div className={`bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden border-l-2 ${cfg.glow} transition-all`}>
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Order badge */}
        <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-400 text-sm font-bold flex-shrink-0">
          {stage.order}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="text-white font-semibold">{stage.name}</h3>
            <StatusBadge status={stage.status} />
            <span className="text-slate-600 text-xs border border-white/[0.06] px-2 py-0.5 rounded-md">
              {FORMAT_LABELS[stage.format]}
            </span>
          </div>
          <p className="text-slate-500 text-sm truncate">{stage.description}</p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
          <div>
            <p className="text-white font-bold text-lg">{stage.teamCount}</p>
            <p className="text-slate-600 text-xs">Teams</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{stage.completedMatches}/{stage.totalMatches}</p>
            <p className="text-slate-600 text-xs">Matches</p>
          </div>
          <div>
            <p className="text-white font-bold text-lg">{stage.advancingTeams}</p>
            <p className="text-slate-600 text-xs">Advance</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 hover:text-slate-300">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 hover:text-slate-300">
            <MoreVertical className="w-4 h-4" />
          </button>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-0">
        <div className="w-full bg-white/[0.04] rounded-full h-1">
          <div
            className="bg-gradient-to-r from-yellow-500 to-yellow-500 h-1 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-5 pt-4 border-t border-white/[0.04] mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Details */}
            <div>
              <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Stage Details</h4>
              <div className="space-y-2">
                {[
                  { icon: Hash,      label: "Format",    value: FORMAT_LABELS[stage.format] },
                  { icon: Users,     label: "Teams",     value: `${stage.teamCount} participating` },
                  { icon: Trophy,    label: "Advancing", value: `Top ${stage.advancingTeams} teams` },
                  { icon: Clock,     label: "Duration",  value: `${stage.startDate} → ${stage.endDate}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    <span className="text-slate-500 text-sm w-20 flex-shrink-0">{row.label}</span>
                    <span className="text-slate-300 text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Groups / Progress */}
            <div>
              {stage.groups ? (
                <>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Groups</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {stage.groups.map((g) => (
                      <div key={g.name} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
                        <p className="text-white text-sm font-medium">{g.name}</p>
                        <p className="text-slate-500 text-xs">{g.teams} teams · {g.matches} matches</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-3">Completion</h4>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Matches done</span>
                      <span className="text-white font-bold text-sm">{pct}%</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-slate-600 text-xs mt-2">
                      {stage.completedMatches} of {stage.totalMatches} completed
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-white/[0.04]">
            {stage.status === "live" && (
              <button className="flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <Zap className="w-3.5 h-3.5" /> View Live Matches
              </button>
            )}
            {stage.status === "upcoming" && (
              <button className="flex items-center gap-2 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <Play className="w-3.5 h-3.5" /> Start Stage
              </button>
            )}
            <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
              <GitBranch className="w-3.5 h-3.5" /> View Bracket
            </button>
            <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
              <Settings className="w-3.5 h-3.5" /> Configure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentStagesPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

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
              <span className="text-slate-300">Stages</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Stages</h1>
                <p className="text-slate-500 text-sm mt-0.5">{MOCK_STAGES.length} stages configured</p>
              </div>
              <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Stage
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Stages" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Pipeline visualisation */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {MOCK_STAGES.map((stage, i) => {
              const cfg = STATUS_CFG[stage.status];
              const Icon = cfg.icon;
              return (
                <div key={stage.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cfg.badge}`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{stage.name}</span>
                  </div>
                  {i < MOCK_STAGES.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-slate-700" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage cards */}
          <div className="space-y-4">
            {MOCK_STAGES.map((stage) => (
              <StageCard key={stage.id} stage={stage} />
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}