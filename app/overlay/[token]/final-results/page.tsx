"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function FinalResultsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<any>(null);
  const theme = searchParams?.get("theme") || "gold";
  const rows = parseInt(searchParams?.get("rows") || "5");

  const load = useCallback(async () => {
    const token = params?.token as string;
    if (!token) return;
    try {
      const res = await fetch(`/api/tournaments/${token}`, { cache: "no-store" });
      if (res.ok) setTournament((await res.json()).tournament);
    } catch {}
  }, [params?.token]);

  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);

  if (!tournament) return null;

  // Calculate leaderboard
  const teamMap: Record<string, any> = {};
  (tournament.teams || []).forEach((t: any) => {
    teamMap[t.id] = { id: t.id, name: t.name, logo: t.logo, kills: 0, points: 0, wwcds: 0 };
  });

  (tournament.matches || []).forEach((m: any) => {
    if (m.status !== "completed" || !m.results) return;
    m.results.forEach((r: any) => {
      if (teamMap[r.teamId]) {
        teamMap[r.teamId].points += r.totalPoints || 0;
        teamMap[r.teamId].kills += r.kills || 0;
        if (r.placement === 1) teamMap[r.teamId].wwcds += 1;
      }
    });
  });

  const sorted = Object.values(teamMap).sort((a: any, b: any) => b.points - a.points).slice(0, rows);
  const champion = sorted[0];

  if (!champion || champion.points === 0) return null;

  const medals = ["", "", ""];
  const rankColors = ["#facc15", "#e5e7eb", "#d97706"];

  return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: "rgba(20,10,0,0.95)", borderRadius: 20, overflow: "hidden", maxWidth: 500,
        backdropFilter: "blur(20px)", border: "2px solid rgba(250,204,21,0.5)",
        boxShadow: "0 0 80px rgba(250,204,21,0.3)",
      }}>
        {/* Champion Banner */}
        <div style={{ padding: "20px", textAlign: "center", background: "linear-gradient(180deg, rgba(250,204,21,0.15) 0%, transparent 100%)", borderBottom: "1px solid rgba(250,204,21,0.2)" }}>
          <div style={{ fontSize: 10, color: "#facc15", fontWeight: 900, letterSpacing: 6, marginBottom: 8, textShadow: "0 0 20px rgba(250,204,21,0.5)" }}>
             TOURNAMENT CHAMPION 
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#fef3c7", textShadow: "0 0 30px rgba(250,204,21,0.4)" }}>
            {champion.name}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
            <div><div style={{ color: "#facc15", fontSize: 24, fontWeight: 900, fontFamily: "monospace" }}>{champion.points}</div><div style={{ color: "#92400e", fontSize: 8, letterSpacing: 2 }}>POINTS</div></div>
            <div><div style={{ color: "#fb923c", fontSize: 24, fontWeight: 900, fontFamily: "monospace" }}>{champion.kills}</div><div style={{ color: "#92400e", fontSize: 8, letterSpacing: 2 }}>KILLS</div></div>
            <div><div style={{ color: "#22c55e", fontSize: 24, fontWeight: 900, fontFamily: "monospace" }}>{champion.wwcds}</div><div style={{ color: "#92400e", fontSize: 8, letterSpacing: 2 }}>WWCD</div></div>
          </div>
        </div>

        {/* Rest of standings */}
        <div style={{ padding: "12px 16px" }}>
          <div style={{ color: "#92400e", fontSize: 9, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>FINAL STANDINGS</div>
          {sorted.map((team: any, idx: number) => (
            <div key={team.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", marginBottom: 3,
              borderRadius: 8, background: idx === 0 ? "rgba(250,204,21,0.08)" : "rgba(255,255,255,0.02)",
              border: `1px solid ${idx < 3 ? rankColors[idx] + "30" : "rgba(255,255,255,0.05)"}`,
            }}>
              <span style={{ fontSize: idx < 3 ? 18 : 12, width: 24, textAlign: "center", color: idx < 3 ? rankColors[idx] : "#6b7280", fontWeight: 900, fontFamily: "monospace" }}>
                {idx < 3 ? medals[idx] : `#${idx + 1}`}
              </span>
              <span style={{ flex: 1, color: "#fef3c7", fontSize: 14, fontWeight: idx < 3 ? 800 : 500 }}>{team.name}</span>
              <span style={{ color: "#fb923c", fontFamily: "monospace", fontSize: 12 }}>{team.kills}K</span>
              <span style={{ color: idx < 3 ? rankColors[idx] : "#fef3c7", fontFamily: "monospace", fontSize: 16, fontWeight: 900, minWidth: 40, textAlign: "right" }}>{team.points}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "8px 16px", background: "rgba(0,0,0,0.3)", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#78350f", fontSize: 9 }}>{tournament.name}</span>
          <span style={{ color: "#facc15", fontSize: 9, fontWeight: 700, letterSpacing: 1.5 }}>tournaops.com</span>
        </div>
      </div>
    </div>
  );
}

export default function FinalResultsPage() {
  return <Suspense fallback={null}><FinalResultsContent /></Suspense>;
}