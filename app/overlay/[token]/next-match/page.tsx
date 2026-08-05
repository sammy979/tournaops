"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function NextMatchOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [tournament, setTournament] = useState<any>(null);
  const [countdown, setCountdown] = useState("--:--");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          setTournament(data.tournament);
        }
      } catch {}
    }
    load();
    
    // Countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const minutes = String(15 - (now.getMinutes() % 15) - 1).padStart(2, "0");
      const seconds = String(60 - now.getSeconds()).padStart(2, "0");
      setCountdown(`${minutes}:${seconds}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [token]);

  const aiBg = `https://image.pollinations.ai/prompt/${encodeURIComponent("PUBG game preparation, squad ready for drop, plane in the sky, tactical loadout, epic")}?width=1920&height=1080&nologo=true&model=flux`;

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
        borderRadius: 24,
        overflow: "hidden",
        border: "3px solid #3b82f6",
        boxShadow: "0 30px 100px rgba(59,130,246,0.4)",
      }}>
        <div style={{
          background: `url(${aiBg})`,
          backgroundSize: "cover",
          padding: "60px 40px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,20,0.85), rgba(0,20,50,0.9))",
          }}></div>

          <div style={{ position: "relative", textAlign: "center", color: "white" }}>
            <div style={{
              display: "inline-block",
              background: "#3b82f6",
              color: "white",
              padding: "6px 24px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 4,
              marginBottom: 20,
            }}>
              📅 NEXT MATCH
            </div>

            <h1 style={{
              fontSize: 48,
              fontWeight: 900,
              margin: 0,
              color: "white",
              letterSpacing: "-0.02em",
            }}>
              STARTING SOON
            </h1>

            <div style={{
              marginTop: 40,
              padding: 30,
              background: "rgba(59,130,246,0.15)",
              border: "2px solid rgba(59,130,246,0.5)",
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 12, color: "#93c5fd", letterSpacing: 3, fontWeight: 700 }}>
                COUNTDOWN
              </div>
              <div style={{ 
                fontSize: 96, 
                fontWeight: 900, 
                color: "#3b82f6", 
                fontFamily: "monospace",
                lineHeight: 1,
                marginTop: 10,
                textShadow: "0 0 40px rgba(59,130,246,0.8)",
              }}>
                {countdown}
              </div>
            </div>

            <div style={{ marginTop: 30, fontSize: 14, color: "#93c5fd", letterSpacing: 3, fontWeight: 700 }}>
              {tournament?.name?.toUpperCase() || "TOURNAMENT"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}