"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function TopFraggerOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [topFragger, setTopFragger] = useState<any>(null);
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          const sorted = [...(data.standings || [])].sort((a, b) => b.totalKills - a.totalKills);
          setTopFragger(sorted[0]);
          setTournamentName(data.tournament?.name || "");
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const aiBg = `https://image.pollinations.ai/prompt/${encodeURIComponent("PUBG sniper aiming through scope, muzzle flash, intense action, red neon lighting, dramatic")}?width=1920&height=1080&nologo=true&model=flux`;

  return (
    <div style={{
      background: "transparent",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        position: "relative",
        maxWidth: 700,
        width: "100%",
        borderRadius: 24,
        overflow: "hidden",
        border: "3px solid #ef4444",
        boxShadow: "0 30px 100px rgba(239,68,68,0.5)",
      }}>
        <div style={{
          background: `url(${aiBg})`,
          backgroundSize: "cover",
          padding: "50px 40px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(50,0,0,0.9))",
          }}></div>

          <div style={{ position: "relative", textAlign: "center", color: "white" }}>
            <div style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white",
              padding: "6px 24px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 4,
              marginBottom: 20,
              boxShadow: "0 0 30px rgba(239,68,68,0.6)",
            }}>
              🎯 TOP FRAGGER
            </div>

            <h1 style={{
              fontSize: 60,
              fontWeight: 900,
              margin: 0,
              color: "#ef4444",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textShadow: "0 0 40px rgba(239,68,68,0.8)",
            }}>
              MVP KILLER
            </h1>

            {topFragger ? (
              <>
                <div style={{ marginTop: 40 }}>
                  {topFragger.teamTag && (
                    <div style={{ fontSize: 20, color: "#f87171", fontWeight: 700 }}>
                      [{topFragger.teamTag}]
                    </div>
                  )}
                  <div style={{ fontSize: 42, fontWeight: 900, color: "white" }}>
                    {topFragger.teamName}
                  </div>
                </div>
                <div style={{
                  marginTop: 30,
                  padding: 20,
                  background: "rgba(239,68,68,0.15)",
                  border: "2px solid rgba(239,68,68,0.4)",
                  borderRadius: 16,
                }}>
                  <div style={{ fontSize: 12, color: "#fca5a5", letterSpacing: 3, fontWeight: 700 }}>
                    TOTAL KILLS
                  </div>
                  <div style={{ fontSize: 80, fontWeight: 900, color: "#ef4444", lineHeight: 1, marginTop: 5 }}>
                    {topFragger.totalKills}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 40, fontSize: 18, color: "#9ca3af" }}>
                No kills yet
              </div>
            )}

            <div style={{ marginTop: 30, fontSize: 12, color: "#ef4444", letterSpacing: 3, fontWeight: 700 }}>
              {tournamentName?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}