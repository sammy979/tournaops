"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function MainOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<any>({ standings: [] });

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) setData(await res.json());
      } catch {}
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const { standings = [], tournament, organizer, branding } = data;
  const primaryColor = branding?.primaryColor || "#facc15";
  const orgName = branding?.organizerName || organizer?.displayName || organizer?.username || "";
  const orgLogo = branding?.logoUrl || organizer?.avatar;

  const TeamLogo = ({ team, size = 26 }: any) => {
    if (team?.teamLogo) return <img src={team.teamLogo} style={{ width: size, height: size, borderRadius: 4, objectFit: "cover" }} alt="" />;
    return (
      <div style={{ 
        width: size, height: size, borderRadius: 4, 
        background: primaryColor + "20",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${primaryColor}40`,
        color: primaryColor, fontWeight: 900, fontSize: size / 2.5,
      }}>
        {team?.teamName?.[0]?.toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <div style={{ background: "transparent", padding: 20, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <div style={{
        maxWidth: 600,
        background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(15,15,25,0.92))",
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: `2px solid ${primaryColor}`,
        overflow: "hidden",
        boxShadow: `0 30px 80px ${primaryColor}50`,
      }}>
        {orgName && (
          <div style={{ padding: "12px 20px", background: "rgba(0,0,0,0.7)", borderBottom: `1px solid ${primaryColor}30`, display: "flex", alignItems: "center", gap: 12 }}>
            {orgLogo ? (
              <img src={orgLogo} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${primaryColor}` }} alt="" />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "black", fontSize: 16 }}>
                {orgName[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 700, letterSpacing: 2 }}>PRESENTED BY</div>
              <div style={{ fontSize: 14, color: "white", fontWeight: 800 }}>{orgName}</div>
            </div>
            <div style={{ background: primaryColor, color: "black", padding: "4px 10px", fontSize: 10, fontWeight: 900, borderRadius: 6, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", animation: "pulse 1.5s infinite" }}></span>
              LIVE
            </div>
          </div>
        )}

        <div style={{ background: `linear-gradient(135deg, ${primaryColor}, #f97316)`, padding: "16px 20px" }}>
          <div style={{ fontSize: 10, color: "rgba(0,0,0,0.6)", fontWeight: 700, letterSpacing: 2 }}>LIVE STANDINGS</div>
          <h1 style={{ color: "black", fontWeight: 900, fontSize: 22, margin: 0, letterSpacing: "-0.02em" }}>
            {tournament?.name || "TOURNAMENT"}
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "35px 30px 1fr 50px 55px 65px", gap: 10, padding: "10px 20px", background: `${primaryColor}15`, color: primaryColor, fontSize: 10, fontWeight: 800, letterSpacing: 1, borderBottom: `1px solid ${primaryColor}30` }}>
          <div>#</div><div></div><div>TEAM</div>
          <div style={{ textAlign: "center" }}>WWCD</div>
          <div style={{ textAlign: "center" }}>KILLS</div>
          <div style={{ textAlign: "right" }}>PTS</div>
        </div>

        {standings.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>
            No matches completed yet
          </div>
        ) : standings.slice(0, 16).map((team: any, index: number) => (
          <div key={team.teamId} style={{
            display: "grid", gridTemplateColumns: "35px 30px 1fr 50px 55px 65px",
            gap: 10, padding: "8px 20px", fontSize: 13,
            background: index === 0 ? `${primaryColor}25` : index < 3 ? "rgba(31,41,55,0.4)" : "transparent",
            color: index === 0 ? "#fde68a" : index < 3 ? "#ffffff" : "#d1d5db",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            fontWeight: index < 3 ? 700 : 500,
            alignItems: "center",
          }}>
            <div style={{ fontWeight: 900, fontSize: 15, color: index === 0 ? primaryColor : index < 3 ? "#fbbf24" : "#9ca3af" }}>{team.rank}</div>
            <div><TeamLogo team={team} /></div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {team.teamTag && <span style={{ color: primaryColor, fontSize: 11, fontWeight: 700, marginRight: 5 }}>[{team.teamTag}]</span>}
              <span>{team.teamName}</span>
            </div>
            <div style={{ textAlign: "center", color: team.wwcdCount > 0 ? primaryColor : "#6b7280", fontWeight: 700 }}>{team.wwcdCount || 0}</div>
            <div style={{ textAlign: "center", color: "#ffffff", fontWeight: 700 }}>{team.totalKills}</div>
            <div style={{ textAlign: "right", fontWeight: 900, color: primaryColor, fontSize: 15 }}>{team.totalPoints}</div>
          </div>
        ))}

        <div style={{ padding: "8px 20px", background: "rgba(0,0,0,0.6)", textAlign: "center" }}>
          <span style={{ color: primaryColor, fontSize: 9, fontWeight: 700, letterSpacing: 3 }}>TOURNAOPS.COM</span>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}