"use client";

import { useState } from "react";

interface Tournament {
  id: string;
  name: string;
  game: string;
  status: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string | null;
  overlayTheme: string | null;
}

interface Props { tournaments: Tournament[]; }

const THEMES = ["DARK", "LIGHT", "GOLD", "CUSTOM"] as const;

export default function BrandingClient({ tournaments }: Props) {
  const [selectedId, setSelectedId] = useState(tournaments[0]?.id || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, { logoUrl: string; bannerUrl: string; primaryColor: string; overlayTheme: string }>>(
    Object.fromEntries(
      tournaments.map((t) => [
        t.id,
        {
          logoUrl: t.logoUrl || "",
          bannerUrl: t.bannerUrl || "",
          primaryColor: t.primaryColor || "#D4AF37",
          overlayTheme: t.overlayTheme || "DARK",
        },
      ])
    )
  );

  const activeTournament = tournaments.find((t) => t.id === selectedId);
  const activeForm = form[selectedId] || { logoUrl: "", bannerUrl: "", primaryColor: "#D4AF37", overlayTheme: "DARK" };

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId], [field]: value } }));
  }

  async function saveBranding() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/tournaments/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logoUrl: activeForm.logoUrl.trim() || null,
          bannerUrl: activeForm.bannerUrl.trim() || null,
          primaryColor: activeForm.primaryColor || null,
          overlayTheme: activeForm.overlayTheme || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save branding"); return; }
      setSuccess("Branding saved successfully");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
          DASHBOARD / BRANDING
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
          Tournament Branding
        </h1>
      </div>

      {error && <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>{error}</div>}
      {success && <div style={{ background: "#001a00", border: "1px solid var(--gold)", color: "var(--gold)", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>{success}</div>}

      {tournaments.length === 0 ? (
        <div style={{ padding: "4rem 2rem", textAlign: "center", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--charcoal)" }}>
          No tournaments found. Create a tournament first.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>TOURNAMENT</label>
            <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setError(null); setSuccess(null); }} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.75rem", cursor: "pointer" }}>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.game})</option>
              ))}
            </select>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1.25rem" }}>MEDIA URLS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { field: "logoUrl", label: "LOGO URL", placeholder: "https://... (square, min 200x200)" },
                { field: "bannerUrl", label: "BANNER URL", placeholder: "https://... (16:9 recommended)" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>{label}</label>
                  <input type="url" value={activeForm[field as keyof typeof activeForm]} onChange={(e) => updateField(field, e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.75rem", boxSizing: "border-box" }} />
                  {activeForm[field as keyof typeof activeForm] && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <img src={activeForm[field as keyof typeof activeForm]} alt={label} style={{ maxHeight: "80px", maxWidth: "200px", objectFit: "contain", border: "1px solid var(--border)", background: "var(--black)", padding: "4px" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1.25rem" }}>COLORS & THEME</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>PRIMARY COLOR</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="color" value={activeForm.primaryColor} onChange={(e) => updateField("primaryColor", e.target.value)} style={{ width: "48px", height: "40px", background: "var(--black)", border: "1px solid var(--border)", cursor: "pointer", padding: "2px" }} />
                  <input type="text" value={activeForm.primaryColor} onChange={(e) => updateField("primaryColor", e.target.value)} placeholder="#D4AF37" style={{ flex: 1, background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.5rem 0.6rem" }} />
                </div>
                <div style={{ marginTop: "0.5rem", height: "8px", background: activeForm.primaryColor || "var(--gold)" }} />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>OVERLAY THEME</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {THEMES.map((theme) => (
                    <button key={theme} onClick={() => updateField("overlayTheme", theme)} style={{ padding: "0.4rem 0.75rem", background: activeForm.overlayTheme === theme ? "var(--gold)" : "var(--black)", color: activeForm.overlayTheme === theme ? "var(--black)" : "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", fontWeight: "700", cursor: "pointer", textAlign: "left" }}>
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {activeTournament && (
            <div style={{ background: "var(--black)", border: "1px solid var(--border)", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)", letterSpacing: "0.15em", marginBottom: "1rem" }}>PREVIEW</div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {activeForm.logoUrl && (
                  <img src={activeForm.logoUrl} alt="Logo" style={{ width: "60px", height: "60px", objectFit: "contain", background: "var(--surface)", border: "1px solid var(--border)" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <div>
                  <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.5rem", fontWeight: "900", color: activeForm.primaryColor || "var(--gold)", textTransform: "uppercase" }}>
                    {activeTournament.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--charcoal)" }}>
                    {activeTournament.game} · {activeForm.overlayTheme} THEME
                  </div>
                </div>
              </div>
            </div>
          )}

          <button onClick={saveBranding} disabled={saving} style={{ padding: "0.875rem 2.5rem", background: "var(--gold)", color: "var(--black)", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1, letterSpacing: "0.1em" }}>
            {saving ? "SAVING..." : "SAVE BRANDING"}
          </button>
        </>
      )}
    </div>
  );
}