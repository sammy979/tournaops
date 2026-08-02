"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function TopFraggerContent() {
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

  // Calculate top fragger
  const playerMap: Record<string, any> = {};
  (data.matches || []).forEach((m: any) => {
    if (m.status !== "completed" || !m.results) return;
    m.results.forEach((r: any) => {
      if (!r.playerResults) return;
      r.playerResults.forEach((pr: any) => {
        if (!pr.playerId) return;
        if (!playerMap[pr.playerId]) {
          playerMap[pr.playerId] = { name: pr.playerName, team: r.teamName, kills: 0, damage: 0, matches: 0 };
        }
        playerMap[pr.playerId].kills += pr.kills || 0;
        playerMap[pr.playerId].damage += pr.damage || 0;
        playerMap[pr.playerId].matches += 1;
      });
    });
  });

  const players = Object.values(playerMap).sort((a: any, b: any) => b.kills - a.kills);
  const mvp = players[0];

  if (!mvp) return <div style={{ background: "transparent", padding: 16, color: "#666" }}>No player data</div>;

  const themes: Record<string, any> = {
    midnight: { bg: "rgba(10,10,25,0.92)", accent: "#60a5fa", glow: "0 0 60px rgba(96,165,250,0.5)" },
    inferno: { bg: "rgba(20,5,0,0.92)", accent: "#fb923c", glow: "0 0 60px rgba(251,146,60,0.5)" },
    royal: { bg: "rgba(20,5,30,0.92)", accent: "#c084fc", glow: "0 0 60px rgba(192,132,252,0.5)" },
  };
  const t = themes[theme] || themes.midnight;

  return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: t.bg, borderRadius: 20, overflow: "hidden", maxWidth: 400,
        backdropFilter: "blur(20px)", border: `2px solid ${t.accent}40`,
        boxShadow: t.glow, textAlign: "center", padding: "24px 20px",
      }}>
        <div style={{ color: t.accent, fontSize: 10, fontWeight: 800, letterSpacing: 6, textTransform: "uppercase", marginBottom: 12 }}>
          🎯 TOP FRAGGER
        </div>

        <div style={{
          width: 100, height: 100, borderRadius: "50%", margin: "0 auto 12px",
          background: `linear-gradient(135deg, ${t.accent}, ${t.accent}80)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 40px ${t.accent}60`, border: `3px solid ${t.accent}`,
          fontSize: 48, fontWeight: 900, color: "#fff",
        }}>
          {(mvp as any).name.charAt(0).toUpperCase()}
        </div>

        <div style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{(mvp as any).name}</div>
        <div style={{ color: t.accent, fontSize: 12, marginBottom: 16, opacity: 0.8 }}>{(mvp as any).team}</div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <div style={{ padding: "12px 20px", borderRadius: 12, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
            <div style={{ color: "#fb923c", fontSize: 32, fontWeight: 900, fontFamily: "monospace" }}>{(mvp as any).kills}</div>
            <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 3 }}>KILLS</div>
          </div>
          <div style={{ padding: "12px 20px", borderRadius: 12, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div style={{ color: "#a78bfa", fontSize: 32, fontWeight: 900, fontFamily: "monospace" }}>{((mvp as any).damage / 1000).toFixed(1)}K</div>
            <div style={{ color: "#94a3b8", fontSize: 9, letterSpacing: 3 }}>DAMAGE</div>
          </div>
        </div>

        <div style={{ color: "#4b5563", fontSize: 9, marginTop: 14, letterSpacing: 1.5 }}>tournaops.com</div>
      </div>
    </div>
  );
}

export default function TopFraggerPage() {
  return <Suspense fallback={null}><TopFraggerContent /></Suspense>;
}