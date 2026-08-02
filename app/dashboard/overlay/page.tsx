"use client";

import { useState, useEffect } from "react";
import { Copy, ExternalLink, Monitor, Check } from "lucide-react";
import { getMyTournaments } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function OverlaySetupPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [theme, setTheme] = useState("dark");
  const [rows, setRows] = useState(10);
  const [fontSize, setFontSize] = useState("md");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await getMyTournaments();
        setTournaments(t || []);
        if (t?.length > 0) setSelected(t[0].id);
      } catch { setTournaments([]); }
      setLoading(false);
    };
    load();
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";
  const overlayUrl = selected ? `${baseUrl}/overlay/${selected}?theme=${theme}&rows=${rows}&size=${fontSize}` : "";

  const copyUrl = () => {
    if (!overlayUrl) return;
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">OBS Overlay</h1>
        <p className="text-gray-400 mt-2">Add a live leaderboard to your stream as a browser source</p>
      </div>

      {tournaments.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Monitor className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">No Tournaments Yet</h3>
          <p className="text-gray-500">Create a tournament first, then come back here to set up your overlay.</p>
        </div>
      ) : (
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
                  {["dark","blue","gold","transparent"].map(t => (
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
            </div>

            <div className="glass-card rounded-xl p-6">
              <h2 className="text-white font-semibold mb-3">Browser Source URL</h2>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-blue-300 text-xs border border-white/10 overflow-x-auto whitespace-nowrap">{overlayUrl}</code>
                <button onClick={copyUrl} className={`p-2 rounded-lg border transition-colors ${copied ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 hover:border-white/30 text-gray-400"}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-white font-semibold mb-3">Live Preview</h2>
            <div className="glass-card rounded-xl p-4 border border-white/10">
              {overlayUrl && (
                <iframe src={overlayUrl} className="w-full rounded-lg border border-white/10" style={{ height: 500, background: "transparent" }} title="Overlay Preview" />
              )}
              <a href={overlayUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm mt-3 justify-center">
                <ExternalLink className="w-4 h-4" />Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}