"use client";
import { useDialog } from "@/lib/use-confirm";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft, Loader2, Monitor, Sparkles } from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";

const SIZES = [
  { name: "youtube", width: 1920, height: 1080, label: "YouTube / Twitter (16:9)" },
  { name: "instagram", width: 1080, height: 1080, label: "Instagram Post (1:1)" },
  { name: "story", width: 1080, height: 1920, label: "Instagram Story (9:16)" },
];

export default function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const dialog = useDialog();
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [topN, setTopN] = useState(10);
  const [size, setSize] = useState(SIZES[0]);
  const [subtitle, setSubtitle] = useState("Overall Standings");
  const [showSponsors, setShowSponsors] = useState(true);
  const [showSocial, setShowSocial] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetch("/api/tournaments/" + id).then(r => r.json()).then(d => setTournament(d.tournament)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!tournament) return;
    const p = new URLSearchParams({
      top: String(topN), subtitle, format: size.name,
      sponsors: showSponsors ? "1" : "0", social: showSocial ? "1" : "0",
      t: String(Date.now()),
    });
    setPreviewUrl("/api/tournaments/" + id + "/screenshot?" + p.toString());
  }, [tournament, topN, size, subtitle, showSponsors, showSocial, id]);

  const download = async () => {
    if (!previewUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(previewUrl);
      if (!res.ok) throw new Error("Server returned " + res.status);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.download = (tournament?.name || "standings") + "-" + size.name + "-" + Date.now() + ".png";
      link.href = URL.createObjectURL(blob);
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (e: any) {
      void dialog.alert({ title: "Download Failed", description: "Download failed: " + (e?.message || "Unknown error"), variant: "danger" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!tournament) return <div style={{ padding: "2rem", textAlign: "center", color: "#9ca3af" }}>Not found</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => router.push("/dashboard/tournaments/" + id)} style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        color: "#9ca3af", fontSize: "0.75rem", fontWeight: 500,
        background: "transparent", border: "none", cursor: "pointer", marginBottom: "1rem",
      }}>
        <ArrowLeft style={{ width: "0.875rem", height: "0.875rem" }} />
        Back to Tournament
      </button>

      <div style={{ marginBottom: "1.5rem" }}>
        <TournamentNav tournamentId={id} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Download style={{ width: "1.75rem", height: "1.75rem", color: "#f59e0b" }} />
            Export Image
          </h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>Server-rendered PNG • Perfect quality guaranteed</p>
        </div>
        <button onClick={download} disabled={downloading} style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: downloading ? "rgba(245,158,11,0.4)" : "#f59e0b",
          color: "#000", padding: "0.75rem 1.5rem", borderRadius: "0.75rem",
          fontSize: "0.875rem", fontWeight: 800, border: "none",
          cursor: downloading ? "not-allowed" : "pointer",
          boxShadow: "0 8px 25px rgba(245,158,11,0.3)",
        }}>
          {downloading
            ? <><Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 0.8s linear infinite" }} />Downloading...</>
            : <><Download style={{ width: "1rem", height: "1rem" }} />Download {size.width}x{size.height}</>
          }
        </button>
      </div>

      {/* Controls */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem", marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>FORMAT</label>
            <select value={size.name} onChange={e => setSize(SIZES.find(s => s.name === e.target.value) || SIZES[0])} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
              {SIZES.map(s => <option key={s.name} value={s.name} style={{ background: "#111116" }}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>SHOW TOP</label>
            <select value={topN} onChange={e => setTopN(Number(e.target.value))} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem", color: "#fff", fontSize: "0.8rem", outline: "none" }}>
              {[5,8,10,12,16,20].map(n => <option key={n} value={n} style={{ background: "#111116" }}>Top {n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.7rem", color: "#9ca3af", display: "block", marginBottom: "0.375rem" }}>SUBTITLE</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#fff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#d1d5db", cursor: "pointer" }}>
              <input type="checkbox" checked={showSponsors} onChange={e => setShowSponsors(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#f59e0b" }} /> Sponsors
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "#d1d5db", cursor: "pointer" }}>
              <input type="checkbox" checked={showSocial} onChange={e => setShowSocial(e.target.checked)} style={{ width: "1rem", height: "1rem", accentColor: "#f59e0b" }} /> Social
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.875rem", padding: "1rem" }}>
        <div style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: "0.75rem", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          <Monitor style={{ width: "0.875rem", height: "0.875rem" }} />
          Live Preview — {size.width}x{size.height} • Server rendered
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#000", borderRadius: "0.5rem", padding: "0.5rem", minHeight: "24rem" }}>
          {previewUrl && (
            <img key={previewUrl} src={previewUrl} alt="Preview" style={{ maxWidth: "100%", height: "auto", maxHeight: "70vh", borderRadius: "0.375rem" }} />
          )}
        </div>
      </div>
    </div>
  );
}