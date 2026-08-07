"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Copy, Check, Trophy, Target, TrendingUp, TrendingDown, Zap, Users, MessageSquare, Radio, Instagram } from "lucide-react";
import TournamentNav from "@/components/tournament/TournamentNav";

export default function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [insights, setInsights] = useState<any>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/tournaments/${id}/insights`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setInsights(data.insights); setStats(data.stats);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const CopyBtn = ({ text }: { text: string }) => {
    const [c, setC] = useState(false);
    return (
      <button onClick={() => { navigator.clipboard.writeText(text); setC(true); setTimeout(()=>setC(false),2000); }} style={{ padding: "0.4rem 0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", color: "#9ca3af", fontSize: "0.7rem", cursor: "pointer" }}>
        {c ? "Copied!" : "Copy Text"}
      </button>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <button onClick={() => router.push("/dashboard/tournaments/"+id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem", marginBottom: "1rem" }}><ArrowLeft size={14}/> Back</button>
      <TournamentNav tournamentId={id} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div><h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>AI Insights</h1><p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Predictive analytics and summaries</p></div>
        <button onClick={generate} disabled={loading} style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(to right, #a855f7, #ec4899)", color: "#fff", border: "none", borderRadius: "0.75rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(168,85,247,0.3)" }}>
          {loading ? "Analyzing Data..." : "Generate Insights"}
        </button>
      </div>

      {!loading && Object.keys(insights).length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.02)", border: "2px dashed rgba(255,255,255,0.08)", borderRadius: "1.5rem" }}>
          <Sparkles size={48} color="#4b5563" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ color: "#fff" }}>Ready to analyze</h3>
          <p style={{ color: "#6b7280" }}>Click the button above to generate AI tournament insights</p>
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: "4rem" }}><Loader2 size={48} color="#a855f7" className="animate-spin" style={{ margin: "0 auto" }}/></div>}

      {!loading && Object.keys(insights).length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {insights.summary && <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", marginBottom: "1rem" }}><MessageSquare size={18}/> Match Summary</h3>
            <p style={{ color: "#d1d5db", lineHeight: 1.6 }}>{insights.summary}</p>
            <div style={{ marginTop: "1rem" }}><CopyBtn text={insights.summary}/></div>
          </div>}
          {insights.mvp && <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#facc15", marginBottom: "1rem" }}><Trophy size={18}/> MVP Prediction</h3>
            <p style={{ color: "#d1d5db", lineHeight: 1.6 }}>{insights.mvp}</p>
            <div style={{ marginTop: "1rem" }}><CopyBtn text={insights.mvp}/></div>
          </div>}
        </div>
      )}
    </div>
  );
}