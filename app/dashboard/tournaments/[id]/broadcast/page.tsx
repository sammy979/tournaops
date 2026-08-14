"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Radio,
  ChevronRight,
  Monitor,
  Wifi,
  WifiOff,
  Copy,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Globe,
  Users,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Play,
  Square,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type StreamStatus = "live" | "offline" | "starting";

interface StreamScene {
  id: string;
  name: string;
  active: boolean;
  thumbnail: string;
}

interface BroadcastOverlay {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  url: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STREAM = {
  status:       "live" as StreamStatus,
  viewerCount:  1847,
  peakViewers:  2341,
  duration:     "02:14:33",
  bitrate:      "6000 kbps",
  resolution:   "1920x1080",
  fps:          60,
  platform:     "Twitch",
  channel:      "TournaOpsTV",
  streamKey:    "live_xxxx_xxxxxxxxxxxxxxxxxxxx",
  cdnLatency:   "~3s",
};

const MOCK_SCENES: StreamScene[] = [
  { id: "sc1", name: "Main Broadcast",    active: true,  thumbnail: "" },
  { id: "sc2", name: "Intermission",      active: false, thumbnail: "" },
  { id: "sc3", name: "Match Preview",     active: false, thumbnail: "" },
  { id: "sc4", name: "Winner Screen",     active: false, thumbnail: "" },
  { id: "sc5", name: "Bracket Display",   active: false, thumbnail: "" },
  { id: "sc6", name: "Stats Overlay",     active: false, thumbnail: "" },
];

const MOCK_OVERLAYS: BroadcastOverlay[] = [
  { id: "o1", name: "Scoreboard",         type: "scoreboard",  enabled: true,  url: "/overlays/scoreboard?tid=t1" },
  { id: "o2", name: "Team Logos Banner",  type: "banner",      enabled: true,  url: "/overlays/banner?tid=t1" },
  { id: "o3", name: "Match Timer",        type: "timer",       enabled: false, url: "/overlays/timer?tid=t1" },
  { id: "o4", name: "Prize Pool Ticker",  type: "ticker",      enabled: true,  url: "/overlays/ticker?tid=t1" },
  { id: "o5", name: "Viewer Poll",        type: "poll",        enabled: false, url: "/overlays/poll?tid=t1" },
  { id: "o6", name: "Social Handle Bar",  type: "social",      enabled: true,  url: "/overlays/social?tid=t1" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function StreamStatusBadge({ status }: { status: StreamStatus }) {
  const map = {
    live:     { label: "LIVE",     classes: "bg-red-500/20 text-red-400 border-red-500/40",        dot: "bg-red-400 animate-pulse" },
    offline:  { label: "Offline",  classes: "bg-slate-500/15 text-slate-400 border-slate-500/30",  dot: "bg-slate-500" },
    starting: { label: "Starting", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30",  dot: "bg-amber-400 animate-pulse" },
  };
  const cfg = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${cfg.classes}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Scene Card ───────────────────────────────────────────────────────────────
function SceneCard({ scene, onActivate }: { scene: StreamScene; onActivate: (id: string) => void }) {
  return (
    <button
      onClick={() => onActivate(scene.id)}
      className={`relative w-full aspect-video rounded-lg border-2 overflow-hidden transition-all text-left ${
        scene.active
          ? "border-yellow-500 ring-2 ring-yellow-500 bg-yellow-500/10"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Monitor className={`w-8 h-8 ${scene.active ? "text-yellow-500" : "text-slate-700"}`} />
      </div>
      {scene.active && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          ACTIVE
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className={`text-xs font-medium ${scene.active ? "text-white" : "text-slate-400"}`}>{scene.name}</p>
      </div>
    </button>
  );
}

// ─── Overlay Toggle Row ───────────────────────────────────────────────────────
function OverlayRow({ overlay, onToggle }: { overlay: BroadcastOverlay; onToggle: (id: string) => void }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${overlay.enabled ? "bg-emerald-400" : "bg-slate-700"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{overlay.name}</p>
        <p className="text-slate-600 text-xs font-mono truncate">{overlay.url}</p>
      </div>
      <button
        onClick={() => copyToClipboard(`${window.location.origin}${overlay.url}`)}
        className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
        title="Copy URL"
      >
        <Copy className="w-3.5 h-3.5" />
      </button>
      <button
        className="p-1.5 hover:bg-white/[0.06] rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
        title="Preview"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onToggle(overlay.id)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${overlay.enabled ? "bg-yellow-500" : "bg-white/[0.08]"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${overlay.enabled ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BroadcastPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [scenes,   setScenes]   = useState(MOCK_SCENES);
  const [overlays, setOverlays] = useState(MOCK_OVERLAYS);
  const [keyMasked,setKeyMasked]= useState(true);

  const activateScene = (sceneId: string) =>
    setScenes((prev) => prev.map((s) => ({ ...s, active: s.id === sceneId })));

  const toggleOverlay = (overlayId: string) =>
    setOverlays((prev) => prev.map((o) => o.id === overlayId ? { ...o, enabled: !o.enabled } : o));

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
              <span className="text-slate-300">Broadcast</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">Broadcast Control</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage stream, scenes, and overlays</p>
                </div>
                <StreamStatusBadge status={MOCK_STREAM.status} />
              </div>
              <div className="flex items-center gap-2">
                {MOCK_STREAM.status === "live" ? (
                  <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Square className="w-4 h-4" /> End Stream
                  </button>
                ) : (
                  <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Play className="w-4 h-4" /> Go Live
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${tab.label === "Broadcast" ? "border-yellow-500 text-yellow-500" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Stream Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {[
              { icon: Users,   label: "Viewers",    value: MOCK_STREAM.viewerCount.toLocaleString(), color: "text-yellow-500" },
              { icon: Zap,     label: "Peak",       value: MOCK_STREAM.peakViewers.toLocaleString(), color: "text-amber-400"  },
              { icon: Clock,   label: "Duration",   value: MOCK_STREAM.duration,                     color: "text-blue-400"  },
              { icon: Wifi,    label: "Bitrate",    value: MOCK_STREAM.bitrate,                      color: "text-emerald-400"},
              { icon: Monitor, label: "Resolution", value: MOCK_STREAM.resolution,                   color: "text-slate-300" },
              { icon: Globe,   label: "Latency",    value: MOCK_STREAM.cdnLatency,                   color: "text-slate-300" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="w-3.5 h-3.5 text-slate-600" />
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                </div>
                <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Scene Switcher */}
            <div className="lg:col-span-2">
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold">Scene Switcher</h2>
                  <span className="text-slate-500 text-xs">
                    Active: <span className="text-yellow-500 font-medium">{scenes.find(s => s.active)?.name}</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {scenes.map((scene) => (
                    <SceneCard key={scene.id} scene={scene} onActivate={activateScene} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-5">
              {/* Stream Key */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <h2 className="text-white font-semibold mb-3">Stream Settings</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Platform</p>
                    <p className="text-white text-sm font-medium">{MOCK_STREAM.platform} · {MOCK_STREAM.channel}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Stream Key</p>
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2">
                      <code className="text-xs text-slate-400 flex-1 font-mono truncate">
                        {keyMasked ? "•".repeat(28) : MOCK_STREAM.streamKey}
                      </code>
                      <button onClick={() => setKeyMasked(!keyMasked)} className="text-slate-600 hover:text-slate-300 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copyToClipboard(MOCK_STREAM.streamKey)} className="text-slate-600 hover:text-slate-300 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-emerald-400 text-xs">Stream connected · {MOCK_STREAM.fps}fps</p>
                  </div>
                </div>
              </div>

              {/* Overlays */}
              <div className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-semibold">Overlays</h2>
                  <span className="text-slate-500 text-xs">
                    {overlays.filter(o => o.enabled).length}/{overlays.length} active
                  </span>
                </div>
                {overlays.map((overlay) => (
                  <OverlayRow key={overlay.id} overlay={overlay} onToggle={toggleOverlay} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}