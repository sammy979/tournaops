"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Palette, Save, Check, Upload, Globe, ChevronLeft,
  Loader2, Plus, Trash2, Award, Building2, Image as ImageIcon,
  Sparkles, ExternalLink, X
} from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: "title" | "platinum" | "gold" | "silver";
  website: string;
  description: string;
}

interface BrandingData {
  primaryColor: string;
  accentColor: string;
  orgName: string;
  orgLogo: string;
  tagline: string;
  customMessage: string;
  discordUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  bannerColor: string;
  sponsors: Sponsor[];
}

const DEFAULT_BRANDING: BrandingData = {
  primaryColor: "#f59e0b",
  accentColor: "#8b5cf6",
  orgName: "",
  orgLogo: "",
  tagline: "",
  customMessage: "",
  discordUrl: "",
  twitterUrl: "",
  websiteUrl: "",
  bannerColor: "from-orange-900/20 to-purple-900/20",
  sponsors: [],
};

const TIER_CONFIG = {
  title: { label: "Title Sponsor", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  platinum: { label: "Platinum", color: "#e5e7eb", bg: "rgba(229,231,235,0.1)" },
  gold: { label: "Gold", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
  silver: { label: "Silver", color: "#9ca3af", bg: "rgba(156,163,175,0.15)" },
};

export default function TournamentBrandingPage() {
  const params = useParams();
  const tournamentId = params?.id as string;
  const [tournament, setTournament] = useState<any>(null);
  const [branding, setBranding] = useState<BrandingData>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"branding" | "sponsors">("branding");

  useEffect(() => {
    if (!tournamentId) return;
    Promise.all([
      fetch(`/api/tournaments/${tournamentId}`).then(r => r.json()),
      fetch(`/api/tournaments/${tournamentId}/branding`).then(r => r.json()),
    ])
      .then(([tData, bData]) => {
        setTournament(tData.tournament);
        if (bData.branding && Object.keys(bData.branding).length > 0) {
          setBranding({ ...DEFAULT_BRANDING, ...bData.branding, sponsors: bData.branding.sponsors || [] });
        }
      })
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/branding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save");
      }
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "orgLogo" | string, sponsorId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Max 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (sponsorId) {
        setBranding(b => ({
          ...b,
          sponsors: b.sponsors.map(s => s.id === sponsorId ? { ...s, logo: dataUrl } : s),
        }));
      } else {
        setBranding(b => ({ ...b, [field]: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const addSponsor = () => {
    const newSponsor: Sponsor = {
      id: `sp_${Date.now()}`,
      name: "",
      logo: "",
      tier: "gold",
      website: "",
      description: "",
    };
    setBranding(b => ({ ...b, sponsors: [...b.sponsors, newSponsor] }));
  };

  const updateSponsor = (id: string, field: keyof Sponsor, value: string) => {
    setBranding(b => ({
      ...b,
      sponsors: b.sponsors.map(s => s.id === id ? { ...s, [field]: value } : s),
    }));
  };

  const removeSponsor = (id: string) => {
    if (!confirm("Remove this sponsor?")) return;
    setBranding(b => ({ ...b, sponsors: b.sponsors.filter(s => s.id !== id) }));
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <Link href={`/dashboard/tournaments/${tournamentId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "#9ca3af", fontSize: "0.75rem", textDecoration: "none", marginBottom: "1rem" }}>
        <ChevronLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </Link>

      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={tournamentId} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Palette style={{ width: "2rem", height: "2rem", color: "#f59e0b" }} />
            Branding & Sponsors
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {tournament?.name}  Customize appearance and manage sponsors
          </p>
        </div>
        <button onClick={save} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: saved ? "#22c55e" : "#f59e0b", color: "#000", padding: "0.625rem 1.25rem", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: saving ? "wait" : "pointer" }}>
          {saved ? <><Check style={{ width: "1rem", height: "1rem" }} /> Saved!</> : saving ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} /> Saving...</> : <><Save style={{ width: "1rem", height: "1rem" }} /> Save Changes</>}
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { key: "branding", label: "Branding", icon: Palette },
          { key: "sponsors", label: `Sponsors (${branding.sponsors.length})`, icon: Building2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: isActive ? "#f59e0b" : "#9ca3af", padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", borderBottom: isActive ? "2px solid #f59e0b" : "2px solid transparent", marginBottom: "-1px" }}>
              <Icon style={{ width: "1rem", height: "1rem" }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "branding" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.25rem" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
              Organization
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Organization Name</label>
                <input type="text" value={branding.orgName} onChange={e => setBranding({ ...branding, orgName: e.target.value })} placeholder="e.g. TournaOps Esports" style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Tagline</label>
                <input type="text" value={branding.tagline} onChange={e => setBranding({ ...branding, tagline: e.target.value })} placeholder="e.g. The ultimate PUBG battle" style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Logo</label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {branding.orgLogo && <img src={branding.orgLogo} alt="Logo" style={{ width: "3rem", height: "3rem", objectFit: "contain", background: "rgba(0,0,0,0.3)", borderRadius: "0.5rem", padding: "0.25rem" }} />}
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.625rem 1rem", cursor: "pointer", fontSize: "0.75rem", color: "#9ca3af", flex: 1 }}>
                    <Upload style={{ width: "0.875rem", height: "0.875rem" }} />
                    {branding.orgLogo ? "Replace" : "Upload logo"}
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "orgLogo")} style={{ display: "none" }} />
                  </label>
                  {branding.orgLogo && <button onClick={() => setBranding({ ...branding, orgLogo: "" })} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer" }}><X style={{ width: "1rem", height: "1rem" }} /></button>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Palette style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
              Colors
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Primary Color</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="color" value={branding.primaryColor} onChange={e => setBranding({ ...branding, primaryColor: e.target.value })} style={{ width: "3rem", height: "2.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", cursor: "pointer", background: "transparent" }} />
                  <input type="text" value={branding.primaryColor} onChange={e => setBranding({ ...branding, primaryColor: e.target.value })} style={{ flex: 1, padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", fontFamily: "monospace" }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Accent Color</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ width: "3rem", height: "2.5rem", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", cursor: "pointer", background: "transparent" }} />
                  <input type="text" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ flex: 1, padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", fontFamily: "monospace" }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem", gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Globe style={{ width: "1rem", height: "1rem", color: "#f59e0b" }} />
              Social Links
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Discord URL</label>
                <input type="url" value={branding.discordUrl} onChange={e => setBranding({ ...branding, discordUrl: e.target.value })} placeholder="https://discord.gg/..." style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Twitter/X URL</label>
                <input type="url" value={branding.twitterUrl} onChange={e => setBranding({ ...branding, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Website URL</label>
                <input type="url" value={branding.websiteUrl} onChange={e => setBranding({ ...branding, websiteUrl: e.target.value })} placeholder="https://yoursite.com" style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem" }} />
              </div>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.5rem", gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, display: "block", marginBottom: "0.375rem" }}>Custom Message</label>
            <textarea value={branding.customMessage} onChange={e => setBranding({ ...branding, customMessage: e.target.value })} placeholder="A message shown on your public tournament page..." rows={3} style={{ width: "100%", padding: "0.625rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", resize: "vertical", fontFamily: "inherit" }} />
          </div>
        </div>
      )}

      {activeTab === "sponsors" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>Tournament Sponsors</h3>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Add sponsors to display on public pages and overlays</p>
            </div>
            <button onClick={addSponsor} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f59e0b", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", border: "none", cursor: "pointer" }}>
              <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
              Add Sponsor
            </button>
          </div>

          {branding.sponsors.length === 0 ? (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "3rem", textAlign: "center" }}>
              <Building2 style={{ width: "2.5rem", height: "2.5rem", color: "#4b5563", margin: "0 auto 0.75rem" }} />
              <h4 style={{ color: "#9ca3af", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>No sponsors yet</h4>
              <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "1rem" }}>Add your first sponsor to get started</p>
              <button onClick={addSponsor} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#f59e0b", color: "#000", padding: "0.5rem 1rem", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", border: "none", cursor: "pointer" }}>
                <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
                Add First Sponsor
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {branding.sponsors.map(sponsor => {
                const tierConfig = TIER_CONFIG[sponsor.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.gold;
                return (
                  <div key={sponsor.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1rem", padding: "1.25rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1rem", alignItems: "start" }}>
                      <div>
                        {sponsor.logo ? (
                          <div style={{ position: "relative" }}>
                            <img src={sponsor.logo} alt={sponsor.name} style={{ width: "5rem", height: "5rem", objectFit: "contain", background: "rgba(255,255,255,0.05)", borderRadius: "0.75rem", padding: "0.5rem" }} />
                            <label style={{ position: "absolute", bottom: 0, right: 0, background: "#f59e0b", color: "#000", borderRadius: "50%", width: "1.5rem", height: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Upload style={{ width: "0.75rem", height: "0.75rem" }} />
                              <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "", sponsor.id)} style={{ display: "none" }} />
                            </label>
                          </div>
                        ) : (
                          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "5rem", height: "5rem", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: "0.75rem", cursor: "pointer" }}>
                            <ImageIcon style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280", marginBottom: "0.25rem" }} />
                            <span style={{ fontSize: "0.6rem", color: "#6b7280" }}>Logo</span>
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "", sponsor.id)} style={{ display: "none" }} />
                          </label>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.5rem" }}>
                          <input type="text" value={sponsor.name} onChange={e => updateSponsor(sponsor.id, "name", e.target.value)} placeholder="Sponsor name" style={{ padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.875rem", fontWeight: 600 }} />
                          <select value={sponsor.tier} onChange={e => updateSponsor(sponsor.id, "tier", e.target.value)} style={{ padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.75rem", cursor: "pointer" }}>
                            <option value="title">Title Sponsor</option>
                            <option value="platinum">Platinum</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                          </select>
                        </div>
                        <input type="url" value={sponsor.website} onChange={e => updateSponsor(sponsor.id, "website", e.target.value)} placeholder="https://sponsor-website.com" style={{ padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.75rem" }} />
                        <input type="text" value={sponsor.description} onChange={e => updateSponsor(sponsor.id, "description", e.target.value)} placeholder="Short description (optional)" style={{ padding: "0.5rem 0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#fff", fontSize: "0.75rem" }} />
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", background: tierConfig.bg, padding: "0.25rem 0.625rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 700, color: tierConfig.color, width: "fit-content", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          <Award style={{ width: "0.75rem", height: "0.75rem" }} />
                          {tierConfig.label}
                        </div>
                      </div>

                      <button onClick={() => removeSponsor(sponsor.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}>
                        <Trash2 style={{ width: "1rem", height: "1rem" }} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
