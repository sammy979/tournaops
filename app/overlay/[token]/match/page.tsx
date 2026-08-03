"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function MatchOverlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);

  const theme = searchParams?.get("theme") || "midnight";
  const size = searchParams?.get("size") || "md";
  const matchNum = searchParams?.get("match");
  const showLogos = searchParams?.get("logos") !== "false";

  const load = useCallback(async () => {
    const token = params?.token as string;
    if (!token) return;
    try {
      const res = await fetch(`/api/tournaments/${token}`, { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setData(d.tournament);
      }
    } catch {}
  }, [params?.token]);

  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, [load]);

  if (!data) return <div style={{ background: "transparent", padding: 16, color: "#666", fontFamily: "Inter" }}>Loading...</div>;

  // Find latest completed match or specific match
  const completedMatches = (data.matches || []).filter((m: any) => m.status === "completed" && m.results);
  const targetMatch = matchNum
    ? completedMatches.find((m: any) => m.matchNumber === parseInt(matchNum))
    : completedMatches[completedMatches.length - 1];

  if (!targetMatch || !targetMatch.results) {
    return (
      <div style={{ background: "transparent", padding: 20 }}>
        <div style={{ background: "rgba(10,10,20,0.9)", borderRadius: 16, padding: 30, textAlign: "center", color: "#60a5fa", fontFamily: "Inter", backdropFilter: "blur(20px)", border: "1px solid rgba(96,165,250,0.3)" }}>
          Waiting for match results...
        </div>
      </div>
    );
  }

  const results = targetMatch.results.sort((a: any, b: any) => a.placement - b.placement);
  const teamMap = Object.fromEntries((data.teams || []).map((t: any) => [t.id, t]));
  const winner = results[0];
  const top3 = results.slice(0, 3);

  const themes: Record<string, any> = {
    midnight: { bg: "rgba(10,10,25,0.92)", accent: "#60a5fa", text: "#fff", sub: "#94a3b8", border: "rgba(96,165,250,0.3)", glow: "rgba(96,165,250,0.4)" },
    inferno: { bg: "rgba(20,5,0,0.92)", accent: "#fb923c", text: "#fff", sub: "#fbbf24", border: "rgba(249,115,22,0.3)", glow: "rgba(251,146,60,0.4)" },
    royal: { bg: "rgba(20,5,30,0.92)", accent: "#c084fc", text: "#fff", sub: "#e9d5ff", border: "rgba(168,85,247,0.3)", glow: "rgba(192,132,252,0.4)" },
    gold: { bg: "rgba(30,15,0,0.92)", accent: "#facc15", text: "#fef3c7", sub: "#fde047", border: "rgba(234,179,8,0.4)", glow: "rgba(250,204,21,0.5)" },
  };
  const t = themes[theme] || themes.midnight;
  const fontSizes: Record<string, number> = { sm: 12, md: 14, lg: 17, xl: 20 };
  const fs = fontSizes[size] || 14;

  return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 16,
        overflow: "hidden", backdropFilter: "blur(20px)", maxWidth: 500,
        boxShadow: `0 20px 60px -10px ${t.glow}`,
      }}>
        {/* Header */}
        <div style={{ background: "rgba(0,0,0,0.3)", borderBottom: `1px solid ${t.border}`, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: t.accent, fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>MATCH RESULT</div>
            <div style={{ color: t.text, fontSize: fs + 4, fontWeight: 900, marginTop: 2 }}>{targetMatch.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: t.sub, fontSize: 10, letterSpacing: 2 }}>{targetMatch.map}</div>
          </div>
        </div>

        {/* Winner Highlight */}
        <div style={{
          padding: "16px", textAlign: "center",
          background: `linear-gradient(180deg, rgba(250,204,21,0.15) 0%, transparent 100%)`,
          borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}></div>
          <div style={{ color: "#facc15", fontSize: 10, fontWeight: 800, letterSpacing: 4, textTransform: "uppercase" }}>WINNER WINNER CHICKEN DINNER</div>
          <div style={{ color: t.text, fontSize: fs + 10, fontWeight: 900, marginTop: 6 }}>{winner?.teamName}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
            <div><div style={{ color: "#fb923c", fontSize: fs + 6, fontWeight: 900, fontFamily: "monospace" }}>{winner?.kills || 0}</div><div style={{ color: t.sub, fontSize: 9, letterSpacing: 2 }}>KILLS</div></div>
            <div><div style={{ color: t.accent, fontSize: fs + 6, fontWeight: 900, fontFamily: "monospace" }}>{winner?.totalPoints || 0}</div><div style={{ color: t.sub, fontSize: 9, letterSpacing: 2 }}>POINTS</div></div>
          </div>
        </div>

        {/* Top 3 */}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ color: t.sub, fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>TOP 3</div>
          {top3.map((r: any, idx: number) => {
            const team = teamMap[r.teamId];
            const medals = ["", "", ""];
            const colors = ["#facc15", "#e5e7eb", "#d97706"];
            return (
              <div key={r.teamId} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4,
                borderRadius: 10, background: idx === 0 ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${idx === 0 ? "rgba(250,204,21,0.2)" : "rgba(255,255,255,0.05)"}`,
              }}>
                <span style={{ fontSize: 20, width: 28 }}>{medals[idx]}</span>
                {showLogos && (team as any)?.logo && (
                  <img src={(team as any).logo} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }} />
                )}
                <span style={{ flex: 1, color: t.text, fontSize: fs, fontWeight: idx === 0 ? 800 : 600 }}>{r.teamName}</span>
                <span style={{ color: "#fb923c", fontFamily: "monospace", fontSize: fs - 1, fontWeight: 700 }}>{r.kills}K</span>
                <span style={{ color: colors[idx], fontFamily: "monospace", fontSize: fs + 2, fontWeight: 900, minWidth: 36, textAlign: "right" }}>{r.totalPoints}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "6px 16px", background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.sub, fontSize: 9, letterSpacing: 1 }}>{data.name}</span>
          <span style={{ color: t.accent, fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>tournaops.com</span>
        </div>
      </div>
    </div>
  );
}

export default function MatchOverlayPage() {
  return <Suspense fallback={<div style={{ color: "#666", padding: 20 }}>Loading...</div>}><MatchOverlayContent /></Suspense>;
}