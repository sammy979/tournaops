"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Monitor, Check, Palette, Trophy, Users, RefreshCw, Eye, EyeOff } from "lucide-react";
import { getMyTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

const THEMES = [
  { key: "midnight", label: "Midnight", colors: ["#3b82f6", "#8b5cf6"] },
  { key: "inferno", label: "Inferno", colors: ["#f97316", "#ef4444"] },
  { key: "toxic", label: "Toxic", colors: ["#22c55e", "#10b981"] },
  { key: "royal", label: "Royal", colors: ["#a855f7", "#ec4899"] },
  { key: "arctic", label: "Arctic", colors: ["#22d3ee", "#0ea5e9"] },
  { key: "gold", label: "Gold", colors: ["#facc15", "#ca8a04"] },
  { key: "transparent", label: "Transparent", colors: ["#ffffff", "#94a3b8"] },
];

export default function OverlaySetupPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [theme, setTheme] = useState("midnight");
  const [rows, setRows] = useState(10);
  const [fontSize, setFontSize] = useState("md");
  const [showLogos, setShowLogos] = useState(true);
  const [showKills, setShowKills] = useState(true);
  const [showWWCD, setShowWWCD] = useState(true);
  const [compact, setCompact] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      if (t && t.length > 0) setSelected(t[0].id);
      setLoading(false);
    })();
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";

  const params = new URLSearchParams();
  params.set("theme", theme);
  params.set("rows", String(rows));
  params.set("size", fontSize);
  if (!showLogos) params.set("logos", "false");
  if (!showKills) params.set("kills", "false");
  if (!showWWCD) params.set("wwcd", "false");
  if (compact) params.set("compact", "true");

  const overlayUrl = selected ? `${baseUrl}/overlay/${selected}?${params.toString()}` : "";

  const copyUrl = () => {
    if (!overlayUrl) return;
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (tournaments.length === 0) return (
    <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2 border-white/10">
      <Monitor className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <h3 className="text-white text-xl font-bold mb-2">No Tournaments Yet</h3>
      <p className="text-gray-500">Create a tournament first to set up an OBS overlay.</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          OBS Overlay Studio
        </h1>
        <p className="text-gray-400 mt-2">Premium live leaderboard for your stream - 7 themes, team logos, real-time updates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CONFIGURATION */}
        <div className="space-y-5">

          {/* Tournament */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Tournament</label>
            <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field text-sm">
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Theme */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-3 h-3" />Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`p-3 rounded-xl border-2 transition-all ${theme === t.key ? "border-white/60 scale-105" : "border-white/10 hover:border-white/30"}`}
                  style={{
                    background: t.key === "transparent"
                      ? "linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.5))"
                      : `linear-gradient(135deg, ${t.colors[0]}30, ${t.colors[1]}30)`,
                  }}
                  title={t.label}
                >
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors[0] }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: t.colors[1] }} />
                  </div>
                  <div className="text-[10px] mt-1.5 text-white/80">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Size & Rows */}
          <div className="glass-card rounded-xl p-5 border border-white/10 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                Teams Shown: <span className="text-white">{rows}</span>
              </label>
              <input type="range" min={3} max={20} value={rows} onChange={e => setRows(parseInt(e.target.value))} className="w-full accent-blue-500" />
              <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                <span>3</span><span>10</span><span>20</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Font Size</label>
              <div className="flex gap-2">
                {["sm","md","lg","xl"].map(s => (
                  <button key={s} onClick={() => setFontSize(s)} className={`flex-1 py-2 rounded-lg text-xs uppercase border transition-all ${fontSize === s ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column Toggles */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Show/Hide Columns</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "logos", label: "Team Logos", state: showLogos, set: setShowLogos, icon: "🎨" },
                { key: "kills", label: "Kills (K)", state: showKills, set: setShowKills, icon: "💥" },
                { key: "wwcd", label: "WWCD (W)", state: showWWCD, set: setShowWWCD, icon: "🏆" },
                { key: "compact", label: "Compact Mode", state: compact, set: setCompact, icon: "📐" },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => opt.set(!opt.state)}
                  className={`p-3 rounded-xl border transition-all text-left ${opt.state ? "border-green-500/30 bg-green-500/10" : "border-white/10 hover:border-white/20 bg-white/2"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{opt.icon}</span>
                    {opt.state ? <Eye className="w-3.5 h-3.5 text-green-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-600" />}
                  </div>
                  <div className={`text-xs mt-1 font-medium ${opt.state ? "text-white" : "text-gray-600"}`}>{opt.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* URL */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Browser Source URL</label>
            <div className="flex gap-2">
              <code className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-blue-300 text-xs border border-white/10 overflow-x-auto whitespace-nowrap font-mono">
                {overlayUrl || "Select a tournament"}
              </code>
              <button onClick={copyUrl} className={`p-2 rounded-lg border transition-all ${copied ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 hover:border-white/20 text-gray-400"}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/15 text-center">
                <div className="text-gray-500 text-[10px]">WIDTH</div>
                <div className="text-blue-300 font-bold">480px</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/15 text-center">
                <div className="text-gray-500 text-[10px]">HEIGHT</div>
                <div className="text-purple-300 font-bold">700px</div>
              </div>
            </div>
          </div>

          {/* Setup Guide */}
          <div className="glass-card rounded-xl p-5 border border-white/10 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">OBS Setup (30 seconds)</label>
            <ol className="space-y-2 text-xs text-gray-400">
              {[
                "Open OBS Studio",
                "Sources → + → Browser",
                "Paste the URL above",
                "Set Width: 480, Height: 700",
                "Check 'Refresh browser when scene becomes active'",
                "Done! Overlay updates every 10 seconds",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i+1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Preview</label>
            <button onClick={() => window.location.reload()} className="btn-ghost text-xs px-3 py-1.5">
              <RefreshCw className="w-3 h-3" />Refresh
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 sticky top-6">
            <div className="relative rounded-xl overflow-hidden" style={{
              background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
              minHeight: 500,
              backgroundImage: "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.1), transparent 50%), radial-gradient(circle at 70% 70%, rgba(139,92,246,0.1), transparent 50%)",
            }}>
              {overlayUrl && (
                <iframe
                  key={overlayUrl}
                  src={overlayUrl}
                  className="w-full rounded-lg"
                  style={{ height: 620, background: "transparent" }}
                  title="Preview"
                />
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <a href={overlayUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm flex-1 justify-center">
                <ExternalLink className="w-4 h-4" />Open Full Screen
              </a>
              <button onClick={copyUrl} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${copied ? "border-green-500 bg-green-500/20 text-green-400" : "btn-primary"}`}>
                {copied ? <><Check className="w-4 h-4 mr-1" />Copied!</> : <><Copy className="w-4 h-4 mr-1" />Copy URL</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}