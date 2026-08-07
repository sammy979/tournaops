"use client";
import { useEffect, useState, use } from "react";
import { Trophy, Shield, Target, Crosshair, ArrowLeft, Flame, Globe } from "lucide-react";
import Link from "next/link";

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/players/${id}`).then(r => r.json()).then(d => setPlayer(d.player)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: "2rem", height: "2rem", border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}/></div>;
  if (!player) return <div style={{ textAlign: "center", padding: "5rem" }}>Player not found</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem", background: "rgba(255,255,255,0.03)", padding: "2rem", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: "6rem", height: "6rem", borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 900 }}>{player.name[0]}</div>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "0.25rem" }}>{player.ign || player.name}</h1>
            <p style={{ color: "#6b7280" }}>{player.team?.name} • {player.role || "Player"}</p>
            {player.country && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", color: "#9ca3af", fontSize: "0.9rem" }}><Globe size={14}/> {player.country}</div>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
            <Crosshair color="#f87171" style={{ margin: "0 auto 0.5rem" }}/>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{player.stats?.totalKills || 0}</div>
            <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>TOTAL KILLS</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "1rem", textAlign: "center" }}>
            <Flame color="#fb923c" style={{ margin: "0 auto 0.5rem" }}/>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{player.stats?.avgKills || "0.0"}</div>
            <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>AVG KILLS</div>
          </div>
        </div>
      </div>
    </div>
  );
}