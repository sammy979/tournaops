"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag?: string;
  totalPoints: number;
  totalKills: number;
  matchesPlayed: number;
  wwcdCount: number;
}

export default function MainOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [standings, setStandings] = useState<Standing[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch(`/api/overlay/${token}`);
      if (res.ok) {
        const data = await res.json();
        setStandings(data.standings || []);
        setTournamentName(data.tournament?.name || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return <div style={{ background: "transparent", color: "#facc15", padding: 20, fontFamily: "Inter, sans-serif" }}>Loading...</div>;

  return (
    <div style={{ background: "transparent", padding: 20, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <div style={{
        maxWidth: 520,
        background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.9))",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: "2px solid #facc15",
        overflow: "hidden",
        boxShadow: "0 30px 80px rgba(250, 204, 21, 0.3)",
      }}>
        <div style={{
          background: "linear-gradient(135deg, #eab308, #f97316)",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(0,0,0,0.6)", fontWeight: 700, letterSpacing: 2 }}>
              LIVE STANDINGS
            </div>
            <h1 style={{ color: "black", fontWeight: 900, fontSize: 20, margin: 0, letterSpacing: "-0.02em" }}>
              {tournamentName || "TOURNAMENT"}
            </h1>
          </div>
          <div style={{
            background: "black",
            color: "#facc15",
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 800,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ 
              width: 8, height: 8, borderRadius: "50%", 
              background: "#ef4444",
              animation: "pulse 1.5s infinite" 
            }}></span>
            LIVE
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 55px 55px 65px",
          gap: 8,
          padding: "10px 20px",
          background: "rgba(250, 204, 21, 0.08)",
          color: "#facc15",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          borderBottom: "1px solid rgba(250, 204, 21, 0.2)",
        }}>
          <div>#</div>
          <div>TEAM</div>
          <div style={{ textAlign: "center" }}>WWCD</div>
          <div style={{ textAlign: "center" }}>KILLS</div>
          <div style={{ textAlign: "right" }}>PTS</div>
        </div>

        <div>
          {standings.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
              No matches completed yet
            </div>
          ) : (
            standings.slice(0, 16).map((team, index) => (
              <div key={team.teamId} style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 55px 55px 65px",
                gap: 8,
                padding: "10px 20px",
                fontSize: 14,
                background: index === 0 ? "rgba(250, 204, 21, 0.15)" : index < 3 ? "rgba(31, 41, 55, 0.4)" : "transparent",
                color: index === 0 ? "#fde68a" : index < 3 ? "#ffffff" : "#d1d5db",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontWeight: index < 3 ? 700 : 500,
                transition: "all 0.3s",
              }}>
                <div style={{ fontWeight: 800, color: index === 0 ? "#facc15" : index < 3 ? "#fbbf24" : "#9ca3af" }}>
                  {index === 0 ? "1" : team.rank}
                </div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {team.teamTag && <span style={{ color: "#facc15", marginRight: 6, fontSize: 12, fontWeight: 700 }}>[{team.teamTag}]</span>}
                  {team.teamName}
                </div>
                <div style={{ textAlign: "center", color: team.wwcdCount > 0 ? "#facc15" : "#6b7280", fontWeight: 700 }}>
                  {team.wwcdCount || 0}
                </div>
                <div style={{ textAlign: "center", color: "#ffffff" }}>{team.totalKills}</div>
                <div style={{ textAlign: "right", fontWeight: 800, color: "#facc15", fontSize: 15 }}>
                  {team.totalPoints}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: "8px 20px", background: "rgba(0,0,0,0.6)", textAlign: "center" }}>
          <span style={{ color: "#facc15", fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>
            TOURNAOPS.COM
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}