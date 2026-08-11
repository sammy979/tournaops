"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import DashboardShell from "@/components/ui/DashboardShell";
import {
  Monitor,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  Zap,
  Trophy,
  Clock,
  Users,
  BarChart2,
  Play,
  Square,
  Settings,
} from "lucide-react";

interface Overlay {
  id:       string;
  name:     string;
  type:     string;
  url:      string;
  enabled:  boolean;
  preview:  string;
  dims:     string;
  fps:      number;
}

const OVERLAYS: Overlay[] = [
  { id: "o1", name: "Scoreboard",          type: "scoreboard", url: "/overlay/tok123/match",        enabled: true,  preview: "Live match scores and team logos",        dims: "1920×120", fps: 30 },
  { id: "o2", name: "Top Fragger",          type: "stats",      url: "/overlay/tok123/top-fragger",  enabled: true,  preview: "Current top performer stats",              dims: "400×200",  fps: 30 },
  { id: "o3", name: "Next Match Preview",   type: "upcoming",   url: "/overlay/tok123/next-match",   enabled: true,  preview: "Upcoming match teams and countdown",       dims: "800×200",  fps: 30 },
  { id: "o4", name: "Final Results",        type: "results",    url: "/overlay/tok123/final-results",enabled: false, preview: "Match final results full screen",           dims: "1920×1080",fps: 30 },
  { id: "o5", name: "Chicken Dinner",       type: "winner",     url: "/overlay/tok123/chicken-dinner",enabled: false,"preview": "Winner celebration full screen",          dims: "1920×1080",fps: 30 },
  { id: "o6", name: "Standings Ticker",     type: "ticker",     url: "/overlay/tok123/standings",    enabled: true,  preview: "Scrolling standings ticker bar",            dims: "1920×60",  fps: 30 },
];

const ICON_MAP: Record<string, React.ElementType> = {
  scoreboard: Zap,
  stats:      BarChart2,
  upcoming:   Clock,
  results:    CheckCircle2,
  winner:     Trophy,
  ticker:     Users,
};

export default function TournamentOverlaysPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [overlays,  setOverlays]  = useState(OVERLAYS);
  const [copiedId,  setCopiedId]  = useState<string | null>(null);
  const [obsUrl] = useState("obs://localhost:4455");

  const toggleOverlay = (oid: string) =>
    setOverlays(prev => prev.map(o => o.id === oid ? { ...o, enabled: !o.enabled } : o));

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}${url}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
    <DashboardShell>
      <div className="min-h-screen bg-[#080a0e] text-white">
        <div className="border-b border-white/[0.06] bg-[#0a0c10]">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
              <button onClick={() => router.push("/dashboard/tournaments")} className="hover:text-slate-300 transition-colors">Tournaments</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <button onClick={() => router.push(`/dashboard/tournaments/${id}/overview`)} className="hover:text-slate-300 transition-colors">Champions Circuit S4</button>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-300">OBS Overlays</span>
            </div>
            <h1 className="text-2xl font-bold text-white">OBS Overlays</h1>
            <p className="text-slate-500 text-sm mt-0.5">Browser source URLs for OBS Studio integration</p>
          </div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide">
              {navTabs.map((tab) => (
                <button key={tab.label} onClick={() => router.push(tab.href)}
                  className="flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-300 transition-colors">
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* OBS setup banner */}
          <div className="bg-indigo-500/[0.07] border border-indigo-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Monitor className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">How to add overlays to OBS</p>
              <p className="text-white/40 text-xs mt-0.5">Add a Browser Source in OBS → paste the overlay URL → set the correct dimensions shown below each overlay.</p>
            </div>
            <a href="https://obsproject.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors flex-shrink-0">
              OBS Guide <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Overlays",   value: overlays.length,                                 color: "text-white"       },
              { label: "Active",           value: overlays.filter(o => o.enabled).length,           color: "text-emerald-400" },
              { label: "Inactive",         value: overlays.filter(o => !o.enabled).length,          color: "text-slate-500"   },
            ].map(s => (
              <div key={s.label} className="bg-[#0f1117] border border-white/[0.06] rounded-xl p-4 text-center">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Overlay cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {overlays.map((overlay) => {
              const Icon = ICON_MAP[overlay.type] ?? Monitor;
              const copied = copiedId === overlay.id;
              return (
                <div key={overlay.id} className={`bg-[#0f1117] border rounded-xl p-5 transition-all ${overlay.enabled ? "border-white/[0.08]" : "border-white/[0.04] opacity-60"}`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${overlay.enabled ? "bg-violet-500/15 border border-violet-500/20" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                      <Icon className={`w-4.5 h-4.5 ${overlay.enabled ? "text-violet-400" : "text-slate-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-semibold text-sm">{overlay.name}</p>
                        {overlay.enabled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{overlay.preview}</p>
                    </div>
                    <button onClick={() => toggleOverlay(overlay.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${overlay.enabled ? "bg-violet-600" : "bg-white/[0.08]"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${overlay.enabled ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                    <span className="font-mono">{overlay.dims}</span>
                    <span>·</span>
                    <span>{overlay.fps}fps</span>
                    <span>·</span>
                    <span className="capitalize">{overlay.type}</span>
                  </div>

                  {/* URL */}
                  <div className="flex items-center gap-2 bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2">
                    <code className="flex-1 text-xs text-slate-400 font-mono truncate">{overlay.url}</code>
                    <button onClick={() => copyUrl(overlay.url, overlay.id)}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${copied ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}>
                      {copied ? <><CheckCircle2 className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                    <button className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refresh token section */}
          <div className="mt-6 bg-[#0f1117] border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">Overlay Token</p>
                <p className="text-slate-500 text-xs mt-0.5">Regenerating the token will invalidate all existing overlay URLs</p>
              </div>
              <button className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate Token
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2">
              <code className="text-xs text-slate-500 font-mono">tok123...xxxx (hidden for security)</code>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}