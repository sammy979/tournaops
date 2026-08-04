"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, Save, Check, Eye, Upload, Globe, RefreshCw } from "lucide-react";

interface BrandingData {
  primaryColor: string;
  accentColor: string;
  orgName: string;
  orgLogo: string;
  customMessage: string;
  discordUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  bannerColor: string;
}

interface Tournament {
  id: string;
  name: string;
}

const DEFAULT_BRANDING: BrandingData = {
  primaryColor: "#3b82f6",
  accentColor: "#8b5cf6",
  orgName: "",
  orgLogo: "",
  customMessage: "",
  discordUrl: "",
  twitterUrl: "",
  websiteUrl: "",
  bannerColor: "from-blue-900/20 to-purple-900/20",
};

export default function BrandingPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING);

  useEffect(() => {
    fetch("/api/tournaments")
      .then(r => r.json())
      .then(data => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) {
          setSelected(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadBranding = useCallback((id: string) => {
    if (!id) return;
    setLoading(true);
    fetch("/api/tournaments/" + id + "/branding")
      .then(r => r.json())
      .then(data => {
        if (data.branding && Object.keys(data.branding).length > 0) {
          setBranding({ ...DEFAULT_BRANDING, ...data.branding });
        } else {
          setBranding(DEFAULT_BRANDING);
        }
      })
      .catch(() => setBranding(DEFAULT_BRANDING))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) loadBranding(selected);
  }, [selected, loadBranding]);

  const saveBranding = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tournaments/" + selected + "/branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) { alert("Max 500KB"); return; }
    const reader = new FileReader();
    reader.onload = ev => setBranding(b => ({ ...b, orgLogo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

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
          <button onClick={() => setBranding(DEFAULT_BRANDING)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
            <RefreshCw className="w-4 h-4" />Reset
          </button>
          <button onClick={saveBranding} disabled={saving || !selected}
            className={"flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all " +
              (saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50")}>
            {saved ? <><Check className="w-4 h-4" />Saved!</> : saving ? "Saving..." : <><Save className="w-4 h-4" />Save</>}
          </button>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <label className="text-sm font-medium text-gray-400 block mb-2">Tournament</label>
        <select value={selected}
          onChange={e => setSelected(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-auto focus:outline-none focus:border-indigo-500">
          {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {loading && <p className="text-gray-500 text-xs mt-2">Loading branding...</p>}
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />Color Theme
        </h3>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {COLORS.map(c => (
            <button key={c.name}
              onClick={() => setBranding(b => ({ ...b, primaryColor: c.primary, accentColor: c.accent }))}
              className={"flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all " +
                (branding.primaryColor === c.primary ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/20")}>
              <div className="w-8 h-8 rounded-lg" style={{ background: "linear-gradient(135deg, " + c.primary + ", " + c.accent + ")" }} />
              <span className="text-[10px] text-gray-500">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />Organization
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Organization Name</label>
            <input type="text" value={branding.orgName}
              onChange={e => setBranding(b => ({ ...b, orgName: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="e.g. BGMI Esports Nepal" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Logo (max 500KB)</label>
            <div className="flex items-center gap-3">
              {branding.orgLogo && (
                <img src={branding.orgLogo} alt="Logo"
                  className="w-12 h-12 rounded-xl object-cover border border-white/10" />
              )}
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm cursor-pointer transition-all">
                <Upload className="w-4 h-4" />Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Discord URL</label>
            <input type="url" value={branding.discordUrl}
              onChange={e => setBranding(b => ({ ...b, discordUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="https://discord.gg/..." />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400 block mb-1.5">Twitter/X URL</label>
            <input type="url" value={branding.twitterUrl}
              onChange={e => setBranding(b => ({ ...b, twitterUrl: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              placeholder="https://twitter.com/..." />
          </div>
        </div>
      </div>
    </div>
  );
}
