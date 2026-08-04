"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getAllTournaments, getLeaderboard } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

export default function OBSOverlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const rows = parseInt(searchParams?.get("rows") || "10");
  const theme = searchParams?.get("theme") || "dark";
  const fontSize = searchParams?.get("size") || "md";

  const load = useCallback(() => {
    const token = params?.token as string;
    if (!token) return;
    const all = getAllTournaments();
    const found = all.find(t => t.id === token || t.slug === token);
    setTournament(found || null);
  }, [params?.token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!tournament) {
    return (
      <div style={{ background: "transparent", padding: 16 }}>
        <p style={{ color: "#666", fontFamily: "monospace", fontSize: 12 }}>TournaOps · Waiting...</p>
      </div>
    );
  }

  const leaderboard = getLeaderboard(tournament).slice(0, rows);
  const fontSizes: Record<string, string> = { sm: "11px", md: "13px", lg: "16px", xl: "20px" };
  const themes: Record<string, any> = {
    dark: { bg: "rgba(10,10,15,0.92)", border: "rgba(255,255,255,0.1)", headerBg: "rgba(255,255,255,0.05)", text: "#ffffff", sub: "#888", accent: "#60a5fa" },
    blue: { bg: "rgba(0,10,40,0.92)", border: "rgba(96,165,250,0.3)", headerBg: "rgba(96,165,250,0.1)", text: "#e0f2fe", sub: "#7eb8f7", accent: "#38bdf8" },
    gold: { bg: "rgba(20,10,0,0.92)", border: "rgba(234,179,8,0.3)", headerBg: "rgba(234,179,8,0.1)", text: "#fef9c3", sub: "#ca8a04", accent: "#facc15" },
    transparent: { bg: "transparent", border: "transparent", headerBg: "rgba(0,0,0,0.5)", text: "#ffffff", sub: "#aaa", accent: "#60a5fa" },
  };

  const t = themes[theme] || themes.dark;
  const fs = fontSizes[fontSize] || fontSizes.md;
  const rankColors: Record<number, string> = { 1: "#facc15", 2: "#d1d5db", 3: "#d97706" };

  return (
    <div style={{ background: "transparent", padding: 8 }}>
      <div style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden", fontFamily: "Inter, sans-serif", fontSize: fs, backdropFilter: "blur(12px)", minWidth: 280, maxWidth: 420 }}>
        <div style={{ background: t.headerBg, borderBottom: `1px solid ${t.border}`, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: t.accent, fontWeight: 700, letterSpacing: 1 }}>{tournament.name.toUpperCase()}</span>
          <span style={{ color: t.sub, fontSize: "0.8em" }}>LIVE</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 40px 50px", gap: 4, padding: "6px 14px", borderBottom: `1px solid ${t.border}`, background: t.headerBg }}>
          <span style={{ color: t.sub, fontSize: "0.75em" }}>#</span>
          <span style={{ color: t.sub, fontSize: "0.75em" }}>SQUAD</span>
          <span style={{ color: t.sub, fontSize: "0.75em", textAlign: "center" }}>K</span>
          <span style={{ color: t.accent, fontSize: "0.75em", textAlign: "center" }}>PTS</span>
        </div>
        {leaderboard.map((entry) => (
          <div key={entry.teamId} style={{ display: "grid", gridTemplateColumns: "32px 1fr 40px 50px", gap: 4, padding: "6px 14px", borderBottom: `1px solid ${t.border}`, background: entry.rank === 1 ? "rgba(250,204,21,0.06)" : "transparent", alignItems: "center" }}>
            <span style={{ color: rankColors[entry.rank] || t.sub, fontWeight: entry.rank <= 3 ? 700 : 400, fontFamily: "monospace", fontSize: "0.85em" }}>#{entry.rank}</span>
            <span style={{ color: t.text, fontWeight: entry.rank <= 3 ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.teamName}</span>
            <span style={{ color: "#f97316", textAlign: "center", fontFamily: "monospace", fontSize: "0.85em" }}>{entry.totalKills || 0}</span>
            <span style={{ color: entry.rank <= 3 ? rankColors[entry.rank] : t.text, fontWeight: 700, textAlign: "center", fontFamily: "monospace" }}>{entry.totalPoints}</span>
          </div>
        ))}
        <div style={{ padding: "5px 14px", background: t.headerBg, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: t.sub, fontSize: "0.7em" }}>tournaops.com</span>
          <span style={{ color: t.sub, fontSize: "0.7em" }}>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
