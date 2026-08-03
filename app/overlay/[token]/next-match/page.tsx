"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function NextMatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const theme = searchParams?.get("theme") || "midnight";

  const load = useCallback(async () => {
    const token = params?.token as string;
    if (!token) return;
    try {
      const res = await fetch(`/api/tournaments/${token}`, { cache: "no-store" });
      if (res.ok) setData((await res.json()).tournament);
    } catch {}
  }, [params?.token]);

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);

  if (!data) return null;

  const pendingMatches = (data.matches || []).filter((m: any) => m.status === "pending");
  const completedCount = (data.matches || []).filter((m: any) => m.status === "completed").length;
  const nextMatch = pendingMatches[0];
  const totalMatches = (data.matches || []).length;

  if (!nextMatch) return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter" }}>
      <div style={{ background: "rgba(10,10,20,0.9)", borderRadius: 16, padding: 24, textAlign: "center", color: "#22c55e", fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)" }}>
        All matches completed! 
      </div>
    </div>
  );

  const themes: Record<string, any> = {
    midnight: { bg: "rgba(10,10,25,0.92)", accent: "#60a5fa", text: "#fff", border: "rgba(96,165,250,0.3)" },
    inferno: { bg: "rgba(20,5,0,0.92)", accent: "#fb923c", text: "#fff", border: "rgba(249,115,22,0.3)" },
    royal: { bg: "rgba(20,5,30,0.92)", accent: "#c084fc", text: "#fff", border: "rgba(168,85,247,0.3)" },
  };
  const t = themes[theme] || themes.midnight;

  return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: t.bg, borderRadius: 16, overflow: "hidden", maxWidth: 400,
        backdropFilter: "blur(20px)", border: `1.5px solid ${t.border}`,
        boxShadow: `0 20px 60px -10px ${t.accent}40`,
      }}>
        <div style={{ padding: "12px 16px", background: "rgba(0,0,0,0.3)", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: t.accent, fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>NEXT MATCH</span>
          <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}>{completedCount}/{totalMatches}</span>
        </div>

        <div style={{ padding: 20, textAlign: "center" }}>
          <div style={{ color: t.text, fontSize: 32, fontWeight: 900, marginBottom: 8 }}>{nextMatch.name}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: `${t.accent}15`, border: `1px solid ${t.accent}30` }}>
            <span style={{ fontSize: 16 }}></span>
            <span style={{ color: t.accent, fontSize: 14, fontWeight: 700 }}>{nextMatch.map}</span>
          </div>
        </div>

        <div style={{ padding: "8px 16px", background: "rgba(0,0,0,0.2)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#4b5563", fontSize: 9 }}>{data.name}</span>
          <span style={{ color: t.accent, fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>tournaops.com</span>
        </div>
      </div>
    </div>
  );
}

export default function NextMatchPage() {
  return <Suspense fallback={null}><NextMatchContent /></Suspense>;
}