"use client";

import { useState, useEffect } from "react";
import { Palette, Save, Check, Eye, Upload, Zap, Globe, RefreshCw } from "lucide-react";
import { getMyTournaments, saveTournament } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function BrandingPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [saved, setSaved] = useState(false);
  const [branding, setBranding] = useState({
    primaryColor: "#3b82f6",
    accentColor: "#8b5cf6",
    orgName: "",
    orgLogo: "",
    customMessage: "",
    discordUrl: "",
    twitterUrl: "",
    websiteUrl: "",
    bannerColor: "from-blue-900/20 to-purple-900/20",
  });

  useEffect(() => {
    (async () => {
      const t = await getMyTournaments();
      setTournaments(t || []);
      if (t && t.length > 0) {
        setSelected(t[0].id);
        loadBranding(t[0].id);
      }
    })();
  }, []);

  const loadBranding = (id: string) => {
    try {
      const saved = localStorage.getItem(`branding_${id}`);
      if (saved) setBranding(JSON.parse(saved));
    } catch {}
  };

  const saveBranding = () => {
    if (!selected) return;
    localStorage.setItem(`branding_${selected}`, JSON.stringify(branding));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) { alert("Max 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setBranding(b => ({ ...b, orgLogo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const reset = () => setBranding({
    primaryColor: "#3b82f6", accentColor: "#8b5cf6",
    orgName: "", orgLogo: "", customMessage: "",
    discordUrl: "", twitterUrl: "", websiteUrl: "",
    bannerColor: "from-blue-900/20 to-purple-900/20",
  });

  const COLORS = [
    { name: "Blue", primary: "#3b82f6", accent: "#8b5cf6" },
    { name: "Red", primary: "#ef4444", accent: "#f97316" },
    { name: "Green", primary: "#22c55e", accent: "#10b981" },
    { name: "Gold", primary: "#f59e0b", accent: "#eab308" },
    { name: "Pink", primary: "#ec4899", accent: "#d946ef" },
    { name: "Cyan", primary: "#06b6d4", accent: "#0ea5e9" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Custom Branding</h1>
          <p className="text-gray-400 mt-1">White-label your tournament</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
            <RefreshCw className="w-4 h-4" />Reset
          </button>
          <button onClick={saveBranding} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "btn-primary"}`}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save</>}
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 border border-white/10">
        <label className="text-sm font-medium text-gray-400 block mb-2">Tournament</label>
        <select value={selected} onChange={e => { setSelected(e.target.value); loadBranding(e.target.value); }} className="input-field w-auto text-sm">
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />Color Theme
        </h3>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {COLORS.map(c => (
            <button key={c.name} onClick={() => setBranding(b => ({ ...b, primaryColor: c.primary, accentColor: c.accent }))} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${branding.primaryColor === c.primary ? "border-white/40 bg-white/10" : "border-white/8 hover:border-white/20"}`}>
              <div className="w-8 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
              <span className="text-[10px] text-gray-500">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />Organization
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Organization Name</label>
            <input type="text" value={branding.orgName} onChange={e => setBranding(b => ({ ...b, orgName: e.target.value }))} className="input-field" placeholder="e.g. BGMI Esports India" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Logo</label>
            <div className="flex items-center gap-3">
              {branding.orgLogo && <img src={branding.orgLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-white/10" />}
              <label className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}