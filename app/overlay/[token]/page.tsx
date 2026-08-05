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

export default function OverlayPage() {
  const params = useParams();
  const token = params?.token as string;
  const [standings, setStandings] = useState<Standing[]>([]);
  const [tournamentName, setTournamentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const res = await fetch(`/api/overlay/${token}`);
      if (!res.ok) {
        setError("Overlay not found");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStandings(data.standings || []);
      setTournamentName(data.tournament?.name || "");
      setError("");
    } catch (e) {
      console.error("Overlay error:", e);
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div style={{ background: "transparent", padding: "20px", color: "white" }}>
        Loading standings...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "transparent", padding: "20px", color: "#f87171" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ background: "transparent", padding: "20px", minHeight: "100vh" }}>
      <div style={{
        maxWidth: "500px",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        border: "2px solid #facc15",
        overflow: "hidden",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(to right, #eab308, #f97316)",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h1 style={{
            color: "black",
            fontWeight: 900,
            fontSize: "18px",
            margin: 0,
            letterSpacing: "-0.02em",
          }}>
            {tournamentName || "STANDINGS"}
          </h1>
          <span style={{
            background: "black",
            color: "#facc15",
            padding: "2px 8px",
            fontSize: "10px",
            fontWeight: 700,
            borderRadius: "4px",
          }}>
            LIVE
          </span>
        </div>

        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 50px 50px 60px",
          gap: "8px",
          padding: "8px 16px",
          background: "rgba(250, 204, 21, 0.1)",
          color: "#facc15",
          fontSize: "11px",
          fontWeight: 700,
          borderBottom: "1px solid rgba(250, 204, 21, 0.3)",
        }}>
          <div>#</div>
          <div>TEAM</div>
          <div style={{ textAlign: "center" }}>WWCD</div>
          <div style={{ textAlign: "center" }}>KILL</div>
          <div style={{ textAlign: "right" }}>PTS</div>
        </div>

        {/* Standings */}
        <div>
          {standings.length === 0 ? (
            <div style={{
              padding: "40px 16px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
            }}>
              No results yet
            </div>
          ) : (
            standings.slice(0, 16).map((team, index) => (
              <div
                key={team.teamId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 50px 50px 60px",
                  gap: "8px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  background: index === 0 
                    ? "rgba(250, 204, 21, 0.2)" 
                    : index < 3 
                    ? "rgba(31, 41, 55, 0.5)" 
                    : "transparent",
                  color: index === 0 
                    ? "#fde68a" 
                    : index < 3 
                    ? "#ffffff" 
                    : "#d1d5db",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  fontWeight: index < 3 ? 700 : 400,
                }}
              >
                <div style={{ fontWeight: 700 }}>{team.rank}</div>
                <div style={{ 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {team.teamTag && (
                    <span style={{ color: "#facc15", marginRight: "4px" }}>
                      [{team.teamTag}]
                    </span>
                  )}
                  {team.teamName}
                </div>
                <div style={{ textAlign: "center", color: "#facc15" }}>
                  {team.wwcdCount || 0}
                </div>
                <div style={{ textAlign: "center" }}>{team.totalKills}</div>
                <div style={{ 
                  textAlign: "right", 
                  fontWeight: 700, 
                  color: "#facc15" 
                }}>
                  {team.totalPoints}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "8px 16px",
          background: "rgba(0, 0, 0, 0.5)",
          textAlign: "center",
        }}>
          <span style={{
            color: "#facc15",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
          }}>
            TOURNAOPS.COM
          </span>
        </div>
      </div>
    </div>
  );
}