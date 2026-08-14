"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Copy,
  Settings,
  Bell,
  Users,
  Hash,
  Zap,
  AlertTriangle,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type BotStatus = "connected" | "disconnected" | "error";

interface DiscordChannel {
  id: string;
  name: string;
  type: "text" | "announcement" | "voice";
  purpose: string;
  autoPost: boolean;
}

interface AutoMessage {
  id: string;
  trigger: string;
  channel: string;
  message: string;
  enabled: boolean;
  lastSent?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_BOT = {
  status:      "connected" as BotStatus,
  guildName:   "Champions Circuit S4",
  guildId:     "1234567890",
  botName:     "TournaOps Bot",
  memberCount: 1247,
  inviteUrl:   "https://discord.com/oauth2/authorize?client_id=xxx",
};

const MOCK_CHANNELS: DiscordChannel[] = [
  { id: "c1", name: "announcements",       type: "announcement", purpose: "Match announcements & results",    autoPost: true  },
  { id: "c2", name: "match-results",       type: "text",         purpose: "Automated result posts",           autoPost: true  },
  { id: "c3", name: "standings",           type: "text",         purpose: "Live standings updates",           autoPost: true  },
  { id: "c4", name: "check-in",            type: "text",         purpose: "Team check-in notifications",      autoPost: true  },
  { id: "c5", name: "general",             type: "text",         purpose: "General chat (read-only posts)",   autoPost: false },
  { id: "c6", name: "bracket-updates",     type: "text",         purpose: "Bracket progression updates",     autoPost: false },
];

const MOCK_AUTOMATIONS: AutoMessage[] = [
  { id: "a1", trigger: "Match Start",         channel: "#announcements",   message: "🎮 Match #{number} is now LIVE! {team1} vs {team2} — Bo{bestOf}",             enabled: true,  lastSent: "5m ago" },
  { id: "a2", trigger: "Match Result",        channel: "#match-results",   message: "✅ Match #{number} Result: {winner} wins {score}! GGs to both teams.",          enabled: true,  lastSent: "18m ago" },
  { id: "a3", trigger: "Check-In Open",       channel: "#check-in",        message: "⏰ Check-in is now OPEN for {team}! You have 15 minutes to check in.",          enabled: true,  lastSent: "1h ago" },
  { id: "a4", trigger: "Standings Update",    channel: "#standings",       message: "📊 Standings updated after Round {round}. See the latest rankings below.",       enabled: true,  lastSent: "23m ago" },
  { id: "a5", trigger: "Tournament Complete", channel: "#announcements",   message: "🏆 {winner} are your Season 4 Champions! Thank you to all participants!",       enabled: false  },
  { id: "a6", trigger: "Stage Advance",       channel: "#bracket-updates", message: "🔥 {team} advances to the {stage}! Next match: {nextOpponent}",                 enabled: false  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function BotStatusBadge({ status }: { status: BotStatus }) {
  const map = {
    connected:    { label: "Connected",    classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400 animate-pulse" },
    disconnected: { label: "Disconnected", classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",       dot: "bg-slate-500" },
    error:        { label: "Error",        classes: "bg-rose-500/15 text-rose-400 border-rose-500/30",          dot: "bg-rose-400 animate-pulse" },
  };
  const cfg = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold border ${cfg.classes}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const CHANNEL_ICONS = {
  text:         <Hash  className="w-3.5 h-3.5 text-slate-500" />,
  announcement: <Bell  className="w-3.5 h-3.5 text-amber-500" />,
  voice:        <Users className="w-3.5 h-3.5 text-blue-500"  />,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentDiscordPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [automations, setAutomations] = useState(MOCK_AUTOMATIONS);
  const [channels,    setChannels]    = useState(MOCK_CHANNELS);
  const [testMsg,     setTestMsg]     = useState("");

  const toggleAutomation = (aid: string) =>
    setAutomations(prev => prev.map(a => a.id === aid ? { ...a, enabled: !a.enabled } : a));

  const toggleAutoPost = (cid: string) =>
    setChannels(prev => prev.map(c => c.id === cid ? { ...c, autoPost: !c.autoPost } : c));

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
              <span className="text-slate-300">Discord</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Discord Integration</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Auto-post match updates to your server</p>
                </div>
                <BotStatusBadge status={MOCK_BOT.status} />
              </div>
              {MOCK_BOT.status !== "connected" && (
                <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Connect Bot
                </button>
              )}
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Discord" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Server info + channels */}
            <div className="space-y-5">
              {/* Server info */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-white font-semibold mb-4">Connected Server</h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-xl font-black text-white">
                    C
                  </div>
                  <div>
                    <p className="text-white font-semibold">{MOCK_BOT.guildName}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" />{MOCK_BOT.memberCount.toLocaleString()} members
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Bot Name</span>
                    <span className="text-slate-300 text-xs font-medium">{MOCK_BOT.botName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Guild ID</span>
                    <code className="text-slate-400 text-xs font-mono">{MOCK_BOT.guildId}</code>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 py-1.5 rounded-lg text-xs transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 py-1.5 rounded-lg text-xs transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              </div>

              {/* Channels */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Channels</h2>
                  <button className="text-yellow-500 hover:text-yellow-500 text-xs transition-colors flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                {channels.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    {CHANNEL_ICONS[ch.type]}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium">#{ch.name}</p>
                      <p className="text-slate-600 text-xs truncate">{ch.purpose}</p>
                    </div>
                    <button
                      onClick={() => toggleAutoPost(ch.id)}
                      className={`flex-shrink-0 ${ch.autoPost ? "text-emerald-400" : "text-slate-700 hover:text-slate-500"} transition-colors`}
                      title="Toggle auto-post"
                    >
                      {ch.autoPost ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Automations + test message */}
            <div className="lg:col-span-2 space-y-5">
              {/* Automations */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Auto-Messages</h2>
                  <button className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" /> New Rule
                  </button>
                </div>
                <div className="space-y-3">
                  {automations.map((auto) => (
                    <div key={auto.id} className={`border rounded-xl p-4 transition-all ${auto.enabled ? "border-white/[0.08] bg-white/[0.01]" : "border-white/[0.04] opacity-60"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${auto.enabled ? "bg-emerald-400" : "bg-slate-700"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white text-sm font-medium">{auto.trigger}</span>
                            <span className="text-yellow-500 text-xs bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">→ {auto.channel}</span>
                            {auto.lastSent && (
                              <span className="text-slate-600 text-xs">sent {auto.lastSent}</span>
                            )}
                          </div>
                          <p className="text-slate-500 text-xs font-mono leading-relaxed bg-white/[0.02] rounded-lg px-3 py-2 border border-white/[0.04]">
                            {auto.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toggleAutomation(auto.id)}
                            className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${auto.enabled ? "bg-yellow-500" : "bg-white/[0.08]"}`}>
                            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${auto.enabled ? "left-4" : "left-0.5"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send test message */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-white font-semibold mb-3">Send Test Message</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a test message to send to #announcements…"
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50"
                  />
                  <button
                    onClick={() => setTestMsg("")}
                    disabled={!testMsg.trim()}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
                <p className="text-slate-600 text-xs mt-2">Message will be posted to #announcements as a test</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}