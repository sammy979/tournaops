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
    const t = getMyTournaments();
    setTournaments(t);
    if (t.length > 0) {
      setSelected(t[0].id);
      loadBranding(t[0].id);
    }
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
          <p className="text-gray-400 mt-1">White-label your tournament with custom colors and identity</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="btn-ghost flex items-center gap-2 px-4 py-2 text-sm">
            <RefreshCw className="w-4 h-4" />Reset
          </button>
          <button onClick={saveBranding} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "btn-primary"}`}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Branding</>}
          </button>
        </div>
      </div>

      {/* Tournament Select */}
      <div className="glass-card rounded-xl p-4 border border-white/10">
        <label className="text-sm font-medium text-gray-400 block mb-2">Tournament</label>
        <select
          value={selected}
          onChange={e => { setSelected(e.target.value); loadBranding(e.target.value); }}
          className="input-field w-auto text-sm"
        >
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {/* Color Presets */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />Color Theme
        </h3>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setBranding(b => ({ ...b, primaryColor: c.primary, accentColor: c.accent }))}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${branding.primaryColor === c.primary ? "border-white/40 bg-white/10" : "border-white/8 hover:border-white/20"}`}
            >
              <div className="w-8 h-8 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.accent})` }} />
              <span className="text-[10px] text-gray-500">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
              <input type="text" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} className="input-field text-sm font-mono flex-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1.5">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={branding.accentColor} onChange={e => setBranding(b => ({ ...b, accentColor: e.target.value }))} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
              <input type="text" value={branding.accentColor} onChange={e => setBranding(b => ({ ...b, accentColor: e.target.value }))} className="input-field text-sm font-mono flex-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Organization Identity */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />Organization Identity
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Organization Name</label>
            <input type="text" value={branding.orgName} onChange={e => setBranding(b => ({ ...b, orgName: e.target.value }))} className="input-field" placeholder="e.g. BGMI Esports India" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Organization Logo</label>
            <div className="flex items-center gap-3">
              {branding.orgLogo && (
                <img src={branding.orgLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
              )}
              <label className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
              {branding.orgLogo && (
                <button onClick={() => setBranding(b => ({ ...b, orgLogo: "" }))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Custom Welcome Message</label>
            <textarea value={branding.customMessage} onChange={e => setBranding(b => ({ ...b, customMessage: e.target.value }))} className="input-field resize-none text-sm" rows={2} placeholder="Welcome to our tournament! Follow the action live..." />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Social Links</h3>
        <div className="space-y-3">
          {[
            { key: "discordUrl", label: "Discord Server", placeholder: "https://discord.gg/yourserver" },
            { key: "twitterUrl", label: "Twitter / X", placeholder: "https://twitter.com/yourhandle" },
            { key: "websiteUrl", label: "Website", placeholder: "https://yourorg.com" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm font-medium text-gray-400 block mb-1.5">{f.label}</label>
              <input
                type="url"
                value={(branding as any)[f.key]}
                onChange={e => setBranding(b => ({ ...b, [f.key]: e.target.value }))}
                className="input-field text-sm"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-400" />Preview
        </h3>
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="p-5" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}15, ${branding.accentColor}10)` }}>
            <div className="flex items-center gap-3 mb-3">
              {branding.orgLogo ? (
                <img src={branding.orgLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-bold">{branding.orgName || "Your Organization"}</p>
                <p className="text-gray-400 text-xs">PUBG Mobile Tournament</p>
              </div>
            </div>
            {branding.customMessage && (
              <p className="text-gray-300 text-sm italic">{branding.customMessage}</p>
            )}
          </div>
          <div className="px-5 py-3 bg-white/3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: branding.primaryColor }} />
            <span className="text-white text-sm font-medium">Live Standings</span>
            <div className="ml-auto flex gap-3 text-xs text-gray-500">
              {branding.discordUrl && <span>Discord</span>}
              {branding.twitterUrl && <span>Twitter</span>}
              {branding.websiteUrl && <span>Website</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}