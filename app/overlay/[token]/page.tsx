"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Standing {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag?: string;
  teamLogo?: string;
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
  const [organizer, setOrganizer] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch(`/api/overlay/${token}`);
      if (res.ok) {
        const data = await res.json();
        setStandings(data.standings || []);
        setTournamentName(data.tournament?.name || "");
        setOrganizer(data.organizer);
        setBranding(data.branding);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    if (!token) return;
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const primaryColor = branding?.primaryColor || "#facc15";
  const organizerName = branding?.organizerName || organizer?.displayName || organizer?.username || "TournaOps";
  const organizerLogo = branding?.logoUrl || organizer?.avatar;

  if (loading) return <div style={{ background: "transparent", color: primaryColor, padding: 20 }}>Loading...</div>;

  return (
    <div style={{ background: "transparent", padding: 20, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <div style={{
        maxWidth: 550,
        background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.9))",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: `2px solid ${primaryColor}`,
        overflow: "hidden",
        boxShadow: `0 30px 80px ${primaryColor}50`,
      }}>
        {/* Organizer Header */}
        <div style={{
          padding: "10px 16px",
          background: "rgba(0,0,0,0.7)",
          borderBottom: `1px solid ${primaryColor}30`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          {organizerLogo ? (
            <img src={organizerLogo} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: `2px solid ${primaryColor}` }} />
          ) : (
            <div style={{ 
              width: 28, height: 28, borderRadius: "50%", 
              background: primaryColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, color: "black", fontSize: 12,
            }}>
              {organizerName[0].toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: 2 }}>PRESENTED BY</div>
            <div style={{ fontSize: 12, color: "white", fontWeight: 800 }}>{organizerName}</div>
          </div>
          <div style={{
            background: primaryColor,
            color: "black",
            padding: "3px 8px",
            fontSize: 9,
            fontWeight: 900,
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
            LIVE
          </div>
        </div>

        {/* Tournament Header */}
        <div style={{ background: `linear-gradient(135deg, ${primaryColor}, #f97316)`, padding: "14px 20px" }}>
          <div style={{ fontSize: 10, color: "rgba(0,0,0,0.6)", fontWeight: 700, letterSpacing: 2 }}>
            LIVE STANDINGS
          </div>
          <h1 style={{ color: "black", fontWeight: 900, fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>
            {tournamentName || "TOURNAMENT"}
          </h1>
        </div>

        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 55px 55px 65px",
          gap: 8,
          padding: "10px 20px",
          background: `${primaryColor}15`,
          color: primaryColor,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          borderBottom: `1px solid ${primaryColor}30`,
        }}>
          <div>#</div>
          <div>TEAM</div>
          <div style={{ textAlign: "center" }}>WWCD</div>
          <div style={{ textAlign: "center" }}>KILLS</div>
          <div style={{ textAlign: "right" }}>PTS</div>
        </div>

        {/* Standings */}
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
                background: index === 0 ? `${primaryColor}25` : index < 3 ? "rgba(31,41,55,0.4)" : "transparent",
                color: index === 0 ? "#fde68a" : index < 3 ? "#ffffff" : "#d1d5db",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                fontWeight: index < 3 ? 700 : 500,
              }}>
                <div style={{ fontWeight: 800, color: index === 0 ? primaryColor : index < 3 ? "#fbbf24" : "#9ca3af" }}>
                  {team.rank}
                </div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
                  {team.teamLogo && <img src={team.teamLogo} style={{ width: 20, height: 20, borderRadius: 3 }} alt="" />}
                  {team.teamTag && <span style={{ color: primaryColor, fontSize: 12, fontWeight: 700 }}>[{team.teamTag}]</span>}
                  <span>{team.teamName}</span>
                </div>
                <div style={{ textAlign: "center", color: team.wwcdCount > 0 ? primaryColor : "#6b7280", fontWeight: 700 }}>
                  {team.wwcdCount || 0}
                </div>
                <div style={{ textAlign: "center", color: "#ffffff" }}>{team.totalKills}</div>
                <div style={{ textAlign: "right", fontWeight: 800, color: primaryColor, fontSize: 15 }}>
                  {team.totalPoints}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 20px", background: "rgba(0,0,0,0.6)", textAlign: "center" }}>
          <span style={{ color: primaryColor, fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>
            TOURNAOPS.COM
          </span>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}