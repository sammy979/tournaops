"use client";

import { useState } from "react";

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number | null;
  createdAt: string;
}

interface Props {
  assets: Asset[];
}

const TYPE_FILTERS = ["ALL", "IMAGE", "LOGO", "BANNER", "PHOTO", "OTHER"] as const;
type TypeFilter = typeof TYPE_FILTERS[number];

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NP", { dateStyle: "medium" });
}

export default function AssetsClient({ assets: initialAssets }: Props) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", url: "", type: "IMAGE" });
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = typeFilter === "ALL"
    ? assets
    : assets.filter((a) => a.type === typeFilter);

  async function addAsset() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.url.trim()) { setError("URL is required"); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          url: form.url.trim(),
          type: form.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add asset"); return; }
      setAssets((prev) => [data.asset, ...prev]);
      setForm({ name: "", url: "", type: "IMAGE" });
      setShowForm(false);
      setSuccess("Asset added successfully");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function deleteAsset(id: string) {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete asset"); return; }
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSuccess("Asset deleted");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function copyUrl(asset: Asset) {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const counts = Object.fromEntries(
    TYPE_FILTERS.map((f) => [
      f,
      f === "ALL" ? assets.length : assets.filter((a) => a.type === f).length,
    ])
  );

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "Barlow Condensed, sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.2em", marginBottom: "0.25rem" }}>
          DASHBOARD / ASSETS
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
          Media Library
        </h1>
      </div>

      {error && (
        <div style={{ background: "#1a0000", border: "1px solid #ef4444", color: "#ef4444", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "#001a00", border: "1px solid var(--gold)", color: "var(--gold)", padding: "0.75rem 1rem", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "1rem" }}>
          {success}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {TYPE_FILTERS.map((f) => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{ padding: "0.4rem 0.85rem", background: typeFilter === f ? "var(--gold)" : "var(--surface)", color: typeFilter === f ? "var(--black)" : "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", fontWeight: "700", cursor: "pointer" }}>
              {f} ({counts[f]})
            </button>
          ))}
        </div>
        <button onClick={() => { setShowForm(true); setError(null); }} style={{ padding: "0.5rem 1.25rem", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
          + ADD ASSET
        </button>
      </div>

      {showForm && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--gold)", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.15em", marginBottom: "1rem" }}>
            NEW ASSET
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>NAME</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Tournament Banner" style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>URL</label>
              <input type="url" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="https://..." style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.3rem" }}>TYPE</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} style={{ width: "100%", background: "var(--black)", border: "1px solid var(--border)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}>
                <option value="IMAGE">IMAGE</option>
                <option value="LOGO">LOGO</option>
                <option value="BANNER">BANNER</option>
                <option value="PHOTO">PHOTO</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={addAsset} disabled={uploading} style={{ padding: "0.5rem 1.5rem", background: "var(--gold)", color: "var(--black)", border: "none", fontFamily: "var(--font-mono)", fontSize: "0.8rem", fontWeight: "700", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
              {uploading ? "SAVING..." : "SAVE ASSET"}
            </button>
            <button onClick={() => { setShowForm(false); setError(null); }} style={{ padding: "0.5rem 1.5rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", cursor: "pointer" }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--charcoal)" }}>
          No assets found. Click ADD ASSET to add your first media file.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1px", background: "var(--border)" }}>
          {filtered.map((asset) => (
            <div key={asset.id} style={{ background: "var(--surface)", padding: "1rem" }}>
              <div style={{ marginBottom: "0.75rem", height: "140px", background: "var(--black)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {(asset.type === "IMAGE" || asset.type === "LOGO" || asset.type === "BANNER" || asset.type === "PHOTO") ? (
                  <img src={asset.url} alt={asset.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--charcoal)" }}>
                    {asset.type}
                  </div>
                )}
              </div>
              <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.95rem", fontWeight: "700", color: "#fff", marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {asset.name}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--charcoal)", marginBottom: "0.75rem" }}>
                <span>{asset.type}</span>
                <span>{formatBytes(asset.size)}</span>
                <span>{formatDate(asset.createdAt)}</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => copyUrl(asset)} style={{ flex: 1, padding: "0.35rem", background: copiedId === asset.id ? "var(--gold)" : "transparent", color: copiedId === asset.id ? "var(--black)" : "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: "700", cursor: "pointer" }}>
                  {copiedId === asset.id ? "COPIED!" : "COPY URL"}
                </button>
                <a href={asset.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "0.35rem", background: "transparent", color: "var(--charcoal)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: "700", cursor: "pointer", textDecoration: "none", textAlign: "center", display: "block" }}>
                  VIEW
                </a>
                <button onClick={() => deleteAsset(asset.id)} disabled={deletingId === asset.id} style={{ padding: "0.35rem 0.6rem", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", fontFamily: "var(--font-mono)", fontSize: "0.6rem", cursor: deletingId === asset.id ? "not-allowed" : "pointer", opacity: deletingId === asset.id ? 0.6 : 1 }}>
                  {deletingId === asset.id ? "..." : "DEL"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}