"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Users,
  Search,
  Plus,
  Filter,
  ChevronRight,
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  Mail,
  Trash2,
  Eye,
  UserCheck,
  AlertTriangle,
  Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type CheckInStatus = "checked-in" | "pending" | "missed" | "disqualified";

interface TeamMember {
  name: string;
  role: string;
  ign: string;
}

interface Team {
  id: string;
  name: string;
  tag: string;
  captain: string;
  email: string;
  memberCount: number;
  members: TeamMember[];
  status: CheckInStatus;
  registeredAt: string;
  seed?: number;
  region: string;
  wins: number;
  losses: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TEAMS: Team[] = [
  { id: "1", name: "Team Alpha",   tag: "ALPH", captain: "ShadowX",   email: "alpha@example.com",   memberCount: 5, members: [{ name: "ShadowX", role: "IGL", ign: "ShadowX#NA1" }, { name: "NightOwl", role: "Entry", ign: "Night#NA2" }, { name: "Flux", role: "Support", ign: "Flux#NA3" }, { name: "Venom", role: "Duelist", ign: "Venom#NA4" }, { name: "Cipher", role: "Sentinel", ign: "Cipher#NA5" }], status: "checked-in",    registeredAt: "2025-06-15", seed: 1, region: "NA", wins: 6, losses: 0 },
  { id: "2", name: "Team Nexus",   tag: "NEX",  captain: "ProStrike",  email: "nexus@example.com",   memberCount: 5, members: [{ name: "ProStrike", role: "IGL", ign: "ProS#NA1" }, { name: "Blaze", role: "Duelist", ign: "Blaze#NA2" }, { name: "Echo", role: "Support", ign: "Echo#NA3" }, { name: "Frost", role: "Sentinel", ign: "Frost#NA4" }, { name: "Rush", role: "Entry", ign: "Rush#NA5" }], status: "checked-in",    registeredAt: "2025-06-15", seed: 2, region: "NA", wins: 5, losses: 1 },
  { id: "3", name: "Team Phantom", tag: "PHN",  captain: "GhostRider", email: "phantom@example.com", memberCount: 5, members: [{ name: "GhostRider", role: "IGL", ign: "Ghost#NA1" }, { name: "Shade", role: "Entry", ign: "Shade#NA2" }, { name: "Drift", role: "Duelist", ign: "Drift#NA3" }, { name: "Wraith", role: "Support", ign: "Wraith#NA4" }, { name: "Specter", role: "Sentinel", ign: "Specter#NA5" }], status: "checked-in",    registeredAt: "2025-06-16", seed: 3, region: "NA", wins: 4, losses: 1 },
  { id: "4", name: "Team Storm",   tag: "STM",  captain: "ThunderBolt", email: "storm@example.com",  memberCount: 5, members: [{ name: "ThunderBolt", role: "IGL", ign: "Thunder#NA1" }, { name: "Rain", role: "Duelist", ign: "Rain#NA2" }, { name: "Gale", role: "Entry", ign: "Gale#NA3" }, { name: "Cloud", role: "Support", ign: "Cloud#NA4" }, { name: "Hail", role: "Sentinel", ign: "Hail#NA5" }], status: "checked-in",    registeredAt: "2025-06-17", seed: 4, region: "NA", wins: 4, losses: 2 },
  { id: "5", name: "Team Void",    tag: "VOD",  captain: "DarkMatter",  email: "void@example.com",   memberCount: 5, members: [{ name: "DarkMatter", role: "IGL", ign: "Dark#NA1" }, { name: "Null", role: "Entry", ign: "Null#NA2" }, { name: "Zero", role: "Duelist", ign: "Zero#NA3" }, { name: "Abyss", role: "Support", ign: "Abyss#NA4" }, { name: "Void", role: "Sentinel", ign: "Void#NA5" }], status: "pending",       registeredAt: "2025-06-18", seed: 5, region: "NA", wins: 3, losses: 2 },
  { id: "6", name: "Team Nova",    tag: "NOV",  captain: "StarBlast",   email: "nova@example.com",   memberCount: 5, members: [{ name: "StarBlast", role: "IGL", ign: "Star#NA1" }, { name: "Quasar", role: "Entry", ign: "Quasar#NA2" }, { name: "Pulsar", role: "Duelist", ign: "Pulsar#NA3" }, { name: "Nebula", role: "Support", ign: "Nebula#NA4" }, { name: "Comet", role: "Sentinel", ign: "Comet#NA5" }], status: "missed",        registeredAt: "2025-06-18", seed: 6, region: "NA", wins: 3, losses: 3 },
  { id: "7", name: "Team Blaze",   tag: "BLZ",  captain: "Inferno",     email: "blaze@example.com",  memberCount: 5, members: [{ name: "Inferno", role: "IGL", ign: "Inf#NA1" }, { name: "Ember", role: "Duelist", ign: "Ember#NA2" }, { name: "Scorch", role: "Entry", ign: "Scorch#NA3" }, { name: "Flame", role: "Support", ign: "Flame#NA4" }, { name: "Ash", role: "Sentinel", ign: "Ash#NA5" }], status: "checked-in",    registeredAt: "2025-06-19", seed: 7, region: "NA", wins: 2, losses: 3 },
  { id: "8", name: "Team Titan",   tag: "TTN",  captain: "Colossus",    email: "titan@example.com",  memberCount: 5, members: [{ name: "Colossus", role: "IGL", ign: "Colos#NA1" }, { name: "Atlas", role: "Entry", ign: "Atlas#NA2" }, { name: "Goliath", role: "Duelist", ign: "Goliath#NA3" }, { name: "Kronos", role: "Support", ign: "Kronos#NA4" }, { name: "Titan", role: "Sentinel", ign: "Titan#NA5" }], status: "disqualified",  registeredAt: "2025-06-19", seed: 8, region: "NA", wins: 1, losses: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<CheckInStatus, { label: string; icon: React.ElementType; badge: string; row: string }> = {
  "checked-in":   { label: "Checked In",    icon: CheckCircle2,  badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", row: "" },
  pending:        { label: "Pending",        icon: Clock,         badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",       row: "" },
  missed:         { label: "Missed",         icon: AlertTriangle, badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",           row: "bg-rose-500/[0.03]" },
  disqualified:   { label: "Disqualified",   icon: XCircle,       badge: "bg-slate-500/15 text-slate-400 border-slate-500/30",       row: "bg-slate-500/[0.03]" },
};

function StatusBadge({ status }: { status: CheckInStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Team Row Component ───────────────────────────────────────────────────────
function TeamRow({ team, onExpand, expanded }: { team: Team; onExpand: (id: string) => void; expanded: boolean }) {
  const cfg = STATUS_CONFIG[team.status];
  return (
    <>
      <tr
        className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer ${cfg.row}`}
        onClick={() => onExpand(team.id)}
      >
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-500/20 border border-yellow-500/20 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0">
              {team.tag.slice(0, 2)}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{team.name}</p>
              <p className="text-slate-500 text-xs">[{team.tag}]</p>
            </div>
          </div>
        </td>
        <td className="py-3.5 px-4 text-slate-400 text-sm">{team.captain}</td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1 text-slate-400 text-sm">
            <Users className="w-3.5 h-3.5" />
            {team.memberCount}
          </div>
        </td>
        <td className="py-3.5 px-4 text-slate-500 text-sm">{team.seed ? `#${team.seed}` : "—"}</td>
        <td className="py-3.5 px-4">
          <span className="text-emerald-400 text-sm font-medium">{team.wins}W</span>
          <span className="text-slate-600 mx-1">—</span>
          <span className="text-rose-400 text-sm font-medium">{team.losses}L</span>
        </td>
        <td className="py-3.5 px-4"><StatusBadge status={team.status} /></td>
        <td className="py-3.5 px-4 text-slate-500 text-xs">{team.registeredAt}</td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 hover:text-slate-300">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 hover:text-slate-300">
              <Mail className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-500 hover:text-rose-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-yellow-500/[0.03] border-b border-yellow-500/10">
          <td colSpan={8} className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {team.members.map((m) => (
                <div key={m.ign} className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">{m.name}</p>
                    <p className="text-slate-500 text-xs">{m.role} · {m.ign}</p>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentTeamsPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | CheckInStatus>("all");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);

  const filtered = MOCK_TEAMS.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                        t.captain.toLowerCase().includes(search.toLowerCase()) ||
                        t.tag.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:       MOCK_TEAMS.length,
    checkedIn:   MOCK_TEAMS.filter((t) => t.status === "checked-in").length,
    pending:     MOCK_TEAMS.filter((t) => t.status === "pending").length,
    missed:      MOCK_TEAMS.filter((t) => t.status === "missed").length,
    disqualified:MOCK_TEAMS.filter((t) => t.status === "disqualified").length,
  };

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

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

        {/* ── Header ──────────────────────────────────────── */}
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">Teams</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Teams</h1>
                <p className="text-slate-500 text-sm mt-0.5">{stats.total} registered · {stats.checkedIn} checked in</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 px-3 py-2 rounded-lg text-sm transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Add Team
                </button>
              </div>
            </div>
          </div>

          {/* Sub-nav */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    tab.label === "Teams"
                      ? "border-yellow-500 text-violet-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Stat pills */}
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { label: "Total",        val: stats.total,        color: "text-slate-300", bg: "bg-white/[0.04]",          border: "border-white/[0.08]" },
              { label: "Checked In",   val: stats.checkedIn,    color: "text-emerald-400",bg: "bg-emerald-500/10",       border: "border-emerald-500/20" },
              { label: "Pending",      val: stats.pending,      color: "text-amber-400",  bg: "bg-amber-500/10",         border: "border-amber-500/20" },
              { label: "Missed",       val: stats.missed,       color: "text-rose-400",   bg: "bg-rose-500/10",          border: "border-rose-500/20" },
              { label: "Disqualified", val: stats.disqualified, color: "text-slate-400",  bg: "bg-slate-500/10",         border: "border-slate-500/20" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${s.bg} ${s.border}`}>
                <span className={`text-lg font-bold ${s.color}`}>{s.val}</span>
                <span className="text-slate-500 text-sm">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search teams, captains, tags…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f1117] border border-white/[0.08] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
              {(["all", "checked-in", "pending", "missed", "disqualified"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    filterStatus === s
                      ? "bg-yellow-500 text-white"
                      : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.08]"
                  }`}
                >
                  {s === "all" ? "All" : s.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {["Team", "Captain", "Members", "Seed", "Record", "Status", "Registered", "Actions"].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((team) => (
                      <TeamRow
                        key={team.id}
                        team={team}
                        onExpand={toggleExpand}
                        expanded={expandedId === team.id}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No teams match your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-slate-600 text-xs mt-3 text-center">
            Click any row to expand team members
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}