"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Monitor, Check } from "lucide-react";
import { getAllTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function OverlaySetupPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [theme, setTheme] = useState("dark");
  const [rows, setRows] = useState(10);
  const [fontSize, setFontSize] = useState("md");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const all = getAllTournaments();
    setTournaments(all);
    if (all.length > 0) setSelected(all[0].id);
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";
  const overlayUrl = selected ? `${baseUrl}/overlay/${selected}?theme=${theme}&rows=${rows}&size=${fontSize}` : "";

  const copyUrl = () => {
    if (!overlayUrl) return;
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">OBS Overlay</h1>
        <p className="text-gray-400 mt-2">Add a live leaderboard to your stream as a browser source</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Configuration</h2>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Tournament</label>
              <select value={selected} onChange={e => setSelected(e.target.value)} className="input-field w-full">
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Theme</label>
              <div className="grid grid-cols-4 gap-2">
                {["dark", "blue", "gold", "transparent"].map(t => (
                  <button key={t} onClick={() => setTheme(t)} className={`py-2 px-3 rounded-lg text-xs capitalize border transition-colors ${theme === t ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-400 hover:border-white/30"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Teams shown: {rows}</label>
              <input type="range" min={5} max={20} value={rows} onChange={e => setRows(parseInt(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Font Size</label>
              <div className="flex gap-2">
                {["sm", "md", "lg", "xl"].map(s => (
                  <button key={s} onClick={() => setFontSize(s)} className={`flex-1 py-2 rounded-lg text-xs uppercase border transition-colors ${fontSize === s ? "border-blue-500 bg-blue-500/20 text-blue-400" : "border-white/10 text-gray-400 hover:border-white/30"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">Browser Source URL</h2>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-blue-300 text-xs border border-white/10 overflow-x-auto whitespace-nowrap">
                {overlayUrl || "Select a tournament"}
              </code>
              <button onClick={copyUrl} className={`p-2 rounded-lg border transition-colors ${copied ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 hover:border-white/30 text-gray-400"}`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-2">Updates every 10 seconds automatically</p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-400" />OBS Setup Instructions
            </h2>
            <ol className="space-y-3 text-sm text-gray-400">
              {["Open OBS Studio", "In Sources panel click + then Browser", "Give it a name like TournaOps Leaderboard", "Paste the URL above into the URL field", "Set Width: 420 Height: 600", "Check Shutdown source when not visible", "Click OK and position overlay on your scene"].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div>
          <h2 className="text-white font-semibold mb-3">Live Preview</h2>
          <div className="glass-card rounded-xl p-4 border border-white/10">
            {overlayUrl ? (
              <iframe src={overlayUrl} className="w-full rounded-lg border border-white/10" style={{ height: 500 }} title="Overlay Preview" />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-600">Select a tournament to preview</div>
            )}
            <div className="mt-3">
              <a href={overlayUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm justify-center w-full">
                <ExternalLink className="w-4 h-4" />Open in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
