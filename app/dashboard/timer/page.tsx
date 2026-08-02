"use client";

import { useState } from "react";
import { Copy, ExternalLink, Check, Clock, Zap } from "lucide-react";

export default function TimerSetupPage() {
  const [minutes, setMinutes] = useState(5);
  const [label, setLabel] = useState("MATCH STARTING IN");
  const [theme, setTheme] = useState("dark");
  const [size, setSize] = useState("lg");
  const [copied, setCopied] = useState(false);

  const base = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";
  const url = `${base}/timer?theme=${theme}&label=${encodeURIComponent(label)}&size=${size}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { label: "MATCH STARTING IN", mins: 5 },
    { label: "NEXT MATCH", mins: 10 },
    { label: "BREAK", mins: 15 },
    { label: "HALFTIME", mins: 3 },
    { label: "LOBBY OPEN", mins: 2 },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Match Timer</h1>
        <p className="text-gray-400 mt-1">Countdown timer for OBS — perfect for between-match breaks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-5">
          {/* Presets */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Presets</p>
            <div className="grid grid-cols-1 gap-2">
              {presets.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setLabel(p.label); setMinutes(p.mins); }}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm transition-all border ${
                    label === p.label ? "border-blue-500 bg-blue-500/10 text-blue-300" : "border-white/8 text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="font-mono text-xs">{p.mins}:00</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom */}
          <div className="glass-card rounded-xl p-5 border border-white/10 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customize</p>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">Label Text</label>
              <input type="text" value={label} onChange={e => setLabel(e.target.value)} className="input-field text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">Default Minutes: {minutes}</label>
              <input type="range" min={1} max={60} value={minutes} onChange={e => setMinutes(parseInt(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {["dark","fire","green","minimal"].map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`py-2 px-3 rounded-lg text-xs capitalize border transition-all ${theme === t ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">Font Size</label>
              <div className="flex gap-2">
                {["sm","md","lg","xl"].map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`flex-1 py-2 rounded-lg text-xs uppercase border transition-all ${size === s ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-500 hover:border-white/20"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">OBS Browser Source URL</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-blue-300 text-xs border border-white/10 overflow-x-auto whitespace-nowrap">{url}</code>
              <button onClick={copy} className={`p-2 rounded-lg border transition-colors ${copied ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 hover:border-white/20 text-gray-400"}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-700 text-xs mt-2">Width: 400px · Height: 300px recommended</p>
          </div>
        </div>

        {/* Preview */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
          <div className="glass-card rounded-xl p-4 border border-white/10">
            <iframe src={url} className="w-full rounded-lg" style={{ height: 280, background: "transparent" }} title="Timer Preview" />
            <div className="mt-3 flex gap-2">
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm flex-1 justify-center">
                <ExternalLink className="w-4 h-4" />Open Full Screen
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}