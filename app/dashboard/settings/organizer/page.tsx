"use client";
import { useState, useEffect } from "react";

export default function OrganizerSettingsPage() {
  const [form, setForm] = useState({ organizerName: "", organizerBio: "", organizerLogo: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) setForm({
        organizerName: d.user.organizerName || "",
        organizerBio: d.user.organizerBio || "",
        organizerLogo: d.user.organizerLogo || "",
      });
    });
  }, []);

  const save = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/organizer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else { const d = await r.json(); setError(d.error || "Failed to save"); }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.25rem, 4vw, 1.75rem)", fontWeight: 900, color: "#fff", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>ORGANIZER PROFILE</h1>
        <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Shown on your public tournament pages</p>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[
          { key: "organizerName", label: "Organizer Name", placeholder: "e.g. Nepal Esports Hub" },
          { key: "organizerLogo", label: "Logo URL", placeholder: "https://..." },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{f.label}</label>
            <input
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.75rem", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", minHeight: "44px" }}
            />
          </div>
        ))}

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Bio</label>
          <textarea
            value={form.organizerBio}
            onChange={e => setForm(p => ({ ...p, organizerBio: e.target.value }))}
            placeholder="Tell teams about your organization..."
            rows={4}
            style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.75rem", color: "#fff", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {error && <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", color: "#f87171", fontSize: "0.875rem" }}>{error}</div>}
        {saved && <div style={{ padding: "0.75rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "0.5rem", color: "#4ade80", fontSize: "0.875rem" }}>✅ Saved successfully</div>}

        <button onClick={save} disabled={loading} style={{ padding: "0.875rem", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)", borderRadius: "0.5rem", color: "#D4AF37", fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "44px", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}