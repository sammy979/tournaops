"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Settings,
  ChevronRight,
  Save,
  Trash2,
  AlertTriangle,
  Globe,
  Lock,
  Users,
  Calendar,
  Trophy,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Bell,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TournamentVisibility = "public" | "private" | "unlisted";
type CheckInMode = "manual" | "auto" | "code";

interface TournamentSettings {
  name:              string;
  game:              string;
  format:            string;
  region:            string;
  prizePool:         string;
  maxTeams:          number;
  startDate:         string;
  endDate:           string;
  checkInWindow:     number;
  visibility:        TournamentVisibility;
  checkInMode:       CheckInMode;
  allowLateCheckin:  boolean;
  requireRoster:     boolean;
  autoAdvance:       boolean;
  broadcastEnabled:  boolean;
  discordEnabled:    boolean;
  publicBracket:     boolean;
  registrationOpen:  boolean;
  inviteCode:        string;
  description:       string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_SETTINGS: TournamentSettings = {
  name:              "Champions Circuit Season 4",
  game:              "Valorant",
  format:            "Double Elimination",
  region:            "North America",
  prizePool:         "$10,000",
  maxTeams:          16,
  startDate:         "2025-07-01",
  endDate:           "2025-07-28",
  checkInWindow:     15,
  visibility:        "public",
  checkInMode:       "manual",
  allowLateCheckin:  false,
  requireRoster:     true,
  autoAdvance:       true,
  broadcastEnabled:  true,
  discordEnabled:    true,
  publicBracket:     true,
  registrationOpen:  false,
  inviteCode:        "CC-S4-2025-X9K2",
  description:       "The premier seasonal championship circuit for top-tier Valorant teams across North America.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, label, description }: {
  value: boolean; onChange: (v: boolean) => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        {description && <p className="text-slate-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-yellow-500" : "bg-white/[0.10]"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }: {
  icon: React.ElementType; title: string; description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-8 h-8 rounded-lg bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-yellow-500" />
      </div>
      <div>
        <h2 className="text-white font-semibold">{title}</h2>
        {description && <p className="text-slate-500 text-sm mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentSettingsPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [settings, setSettings] = useState<TournamentSettings>(INITIAL_SETTINGS);
  const [saved,    setSaved]    = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const update = (key: keyof TournamentSettings, value: unknown) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

  const sections = [
    { id: "general",       label: "General",        icon: Settings  },
    { id: "registration",  label: "Registration",   icon: Users     },
    { id: "checkin",       label: "Check-In",       icon: Clock     },
    { id: "visibility",    label: "Visibility",     icon: Globe     },
    { id: "integrations",  label: "Integrations",   icon: Bell      },
    { id: "danger",        label: "Danger Zone",    icon: AlertTriangle },
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
              <span className="text-slate-300">Settings</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Tournament Settings</h1>
                <p className="text-slate-500 text-sm mt-0.5">Configure tournament rules, visibility, and integrations</p>
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  saved ? "bg-emerald-600 text-white" : "bg-yellow-500 hover:bg-yellow-500 text-white"
                }`}
              >
                {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Settings" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">

            {/* Sidebar nav */}
            <div className="w-48 flex-shrink-0 hidden lg:block">
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-2 sticky top-6">
                {sections.map((s) => (
                  <button key={s.id} onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeSection === s.id ? "bg-yellow-500 text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}>
                    <s.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings panels */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* General */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
                <SectionHeader icon={Settings} title="General" description="Basic tournament information" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name",      label: "Tournament Name",  type: "text" },
                    { key: "game",      label: "Game",             type: "text" },
                    { key: "format",    label: "Format",           type: "text" },
                    { key: "region",    label: "Region",           type: "text" },
                    { key: "prizePool", label: "Prize Pool",       type: "text" },
                    { key: "maxTeams",  label: "Max Teams",        type: "number" },
                    { key: "startDate", label: "Start Date",       type: "date" },
                    { key: "endDate",   label: "End Date",         type: "date" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-slate-400 text-xs font-medium block mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        value={settings[field.key as keyof TournamentSettings] as string}
                        onChange={(e) => update(field.key as keyof TournamentSettings, field.type === "number" ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-slate-400 text-xs font-medium block mb-1.5">Description</label>
                    <textarea
                      value={settings.description}
                      onChange={(e) => update("description", e.target.value)}
                      rows={3}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Registration */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
                <SectionHeader icon={Users} title="Registration" description="Control who can register and how" />
                <Toggle value={settings.registrationOpen} onChange={(v) => update("registrationOpen", v)} label="Registration Open" description="Allow new teams to register" />
                <Toggle value={settings.requireRoster}    onChange={(v) => update("requireRoster", v)}    label="Require Full Roster" description="Teams must submit all members before being confirmed" />
                <div className="mt-4 pt-3">
                  <label className="text-slate-400 text-xs font-medium block mb-2">Invite Code</label>
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2">
                    <code className="flex-1 text-sm text-slate-300 font-mono">
                      {codeVisible ? settings.inviteCode : "•".repeat(settings.inviteCode.length)}
                    </code>
                    <button onClick={() => setCodeVisible(!codeVisible)} className="text-slate-500 hover:text-slate-300 transition-colors">
                      {codeVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => navigator.clipboard.writeText(settings.inviteCode)} className="text-slate-500 hover:text-slate-300 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Check-In */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
                <SectionHeader icon={Clock} title="Check-In" description="Configure the check-in system" />
                <div className="mb-4">
                  <label className="text-slate-400 text-xs font-medium block mb-2">Check-In Window (minutes)</label>
                  <input type="number" value={settings.checkInWindow} onChange={(e) => update("checkInWindow", Number(e.target.value))}
                    className="w-32 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                </div>
                <div className="mb-4">
                  <label className="text-slate-400 text-xs font-medium block mb-2">Check-In Mode</label>
                  <div className="flex gap-2">
                    {(["manual", "auto", "code"] as CheckInMode[]).map((mode) => (
                      <button key={mode} onClick={() => update("checkInMode", mode)}
                        className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${settings.checkInMode === mode ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-slate-200"}`}>
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
                <Toggle value={settings.allowLateCheckin} onChange={(v) => update("allowLateCheckin", v)} label="Allow Late Check-In" description="Teams can check in after the window closes (with penalty)" />
                <Toggle value={settings.autoAdvance}      onChange={(v) => update("autoAdvance", v)}      label="Auto-Advance Teams" description="Automatically advance teams when all matches in a stage complete" />
              </div>

              {/* Visibility */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
                <SectionHeader icon={Globe} title="Visibility" description="Control who can see this tournament" />
                <div className="mb-4">
                  <div className="flex gap-2">
                    {(["public", "private", "unlisted"] as TournamentVisibility[]).map((v) => (
                      <button key={v} onClick={() => update("visibility", v)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm capitalize transition-colors ${settings.visibility === v ? "bg-yellow-500 text-white" : "bg-white/[0.04] text-slate-400 border border-white/[0.08] hover:text-slate-200"}`}>
                        {v === "public" ? <Globe className="w-3.5 h-3.5" /> : v === "private" ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <Toggle value={settings.publicBracket} onChange={(v) => update("publicBracket", v)} label="Public Bracket" description="Allow anyone to view the bracket without logging in" />
              </div>

              {/* Integrations */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-6">
                <SectionHeader icon={Bell} title="Integrations" description="Enable or disable connected services" />
                <Toggle value={settings.broadcastEnabled} onChange={(v) => update("broadcastEnabled", v)} label="Broadcast / OBS Integration" description="Enable stream control and overlay management" />
                <Toggle value={settings.discordEnabled}   onChange={(v) => update("discordEnabled", v)}   label="Discord Bot Integration"        description="Enable automatic Discord notifications" />
              </div>

              {/* Danger Zone */}
              <div className="bg-[#0f1117] border border-rose-500/20 rounded-xl p-6">
                <SectionHeader icon={AlertTriangle} title="Danger Zone" description="Irreversible actions — proceed with caution" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">Reset Tournament</p>
                      <p className="text-slate-500 text-xs">Clear all match results and standings. Cannot be undone.</p>
                    </div>
                    <button className="bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                      Reset
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-rose-500/[0.04] border border-rose-500/20 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">Delete Tournament</p>
                      <p className="text-slate-500 text-xs">Permanently delete this tournament and all associated data.</p>
                    </div>
                    <button className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}