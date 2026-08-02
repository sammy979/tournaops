"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";

function ChickenDinnerContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);

  const theme = searchParams?.get("theme") || "gold";

  const load = useCallback(async () => {
    const token = params?.token as string;
    if (!token) return;
    try {
      const res = await fetch(`/api/tournaments/${token}`, { cache: "no-store" });
      if (res.ok) setData((await res.json()).tournament);
    } catch {}
  }, [params?.token]);

  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, [load]);

  if (!data) return null;

  const completedMatches = (data.matches || []).filter((m: any) => m.status === "completed" && m.results);
  const lastMatch = completedMatches[completedMatches.length - 1];
  if (!lastMatch || !lastMatch.results?.[0]) return null;

  const winner = lastMatch.results[0];
  const teamMap = Object.fromEntries((data.teams || []).map((t: any) => [t.id, t]));
  const winnerTeam = teamMap[winner.teamId];

  return (
    <div style={{ background: "transparent", padding: 12, fontFamily: "Inter, sans-serif" }}>
      <div style={{
        background: "rgba(30,15,0,0.95)", borderRadius: 24, overflow: "hidden",
        maxWidth: 480, backdropFilter: "blur(20px)",
        border: "2px solid rgba(250,204,21,0.5)",
        boxShadow: "0 0 80px rgba(250,204,21,0.4), 0 0 30px rgba(249,115,22,0.3)",
        textAlign: "center", padding: "32px 24px",
      }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🍗</div>

        <div style={{
          color: "#facc15", fontSize: 12, fontWeight: 900, letterSpacing: 8,
          textTransform: "uppercase", marginBottom: 16,
          textShadow: "0 0 20px rgba(250,204,21,0.5)",
        }}>
          WINNER WINNER CHICKEN DINNER
        </div>

        {(winnerTeam as any)?.logo && (
          <img
            src={(winnerTeam as any).logo}
            alt=""
            style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", margin: "0 auto 12px", boxShadow: "0 0 30px rgba(250,204,21,0.4)", border: "3px solid rgba(250,204,21,0.6)" }}
          />
        )}

        <div style={{
          color: "#fef3c7", fontSize: 36, fontWeight: 900,
          textShadow: "0 0 30px rgba(250,204,21,0.4)",
          marginBottom: 8,
        }}>
          {winner.teamName}
        </div>

        <div style={{ color: "#ca8a04", fontSize: 14, marginBottom: 20 }}>
          {lastMatch.name} · {lastMatch.map}
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {[
            { label: "KILLS", value: winner.kills, color: "#fb923c" },
            { label: "POINTS", value: winner.totalPoints, color: "#facc15" },
            { label: "DAMAGE", value: (winner.damage || 0).toLocaleString(), color: "#22c55e" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "14px 24px", borderRadius: 14,
              background: "rgba(255,255,255,0.05)", border: `1px solid ${s.color}30`,
            }}>
              <div style={{ color: s.color, fontSize: 28, fontWeight: 900, fontFamily: "monospace" }}>{s.value}</div>
              <div style={{ color: "#92400e", fontSize: 8, letterSpacing: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ color: "#78350f", fontSize: 9, marginTop: 20, letterSpacing: 2 }}>
          {data.name} · tournaops.com
        </div>
      </div>
    </div>
  );
}

export default function ChickenDinnerPage() {
  return <Suspense fallback={null}><ChickenDinnerContent /></Suspense>;
}