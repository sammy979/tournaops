"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function CurrentMatchOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [standings, setStandings] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          setStandings(data.standings || []);
          setTournament(data.tournament);
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div style={{
      background: "transparent",
      padding: 20,
      fontFamily: "Inter, sans-serif",
      minHeight: "100vh",
    }}>
      <div style={{
        maxWidth: 400,
        background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.9))",
        backdropFilter: "blur(20px)",
        borderRadius: 12,
        border: "2px solid #ef4444",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(239,68,68,0.4)",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ 
              width: 10, height: 10, borderRadius: "50%", 
              background: "white",
              animation: "pulse 1s infinite" 
            }}></span>
            <span style={{ color: "white", fontSize: 12, fontWeight: 900, letterSpacing: 3 }}>
              LIVE MATCH
            </span>
          </div>
          <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>
            {tournament?.name}
          </span>
        </div>

        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
            LIVE STANDINGS
          </div>
          
          {standings.slice(0, 8).map((team, i) => (
            <div key={team.teamId} style={{
              display: "grid",
              gridTemplateColumns: "30px 1fr 40px 50px",
              gap: 8,
              padding: "6px 0",
              fontSize: 13,
              color: i === 0 ? "#facc15" : "white",
              borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.05)" : "none",
              fontWeight: i < 3 ? 700 : 500,
            }}>
              <div style={{ fontWeight: 800 }}>{i + 1}</div>
              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {team.teamTag && <span style={{ color: "#facc15" }}>[{team.teamTag}] </span>}
                {team.teamName}
              </div>
              <div style={{ textAlign: "center", color: "#ef4444", fontWeight: 700 }}>
                {team.totalKills}K
              </div>
              <div style={{ textAlign: "right", color: "#facc15", fontWeight: 800 }}>
                {team.totalPoints}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}