"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ChickenDinnerOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [winner, setWinner] = useState<any>(null);
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          setWinner(data.standings?.[0]);
          setTournamentName(data.tournament?.name || "");
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const aiBg = `https://image.pollinations.ai/prompt/${encodeURIComponent("PUBG chicken dinner victory, golden trophy, confetti explosion, epic celebration, dark dramatic background")}?width=1920&height=1080&nologo=true&model=flux`;

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
        maxWidth: 800,
        width: "100%",
        borderRadius: 24,
        overflow: "hidden",
        border: "3px solid #facc15",
        boxShadow: "0 30px 100px rgba(250,204,21,0.5), inset 0 0 60px rgba(250,204,21,0.1)",
      }}>
        <div style={{
          background: `url(${aiBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 40px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.75), rgba(30,20,0,0.85))",
          }}></div>

          <div style={{ position: "relative", textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 80, marginBottom: 20, animation: "bounce 1s infinite" }}>🏆</div>
            
            <div style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #facc15, #f97316)",
              color: "black",
              padding: "6px 24px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 4,
              marginBottom: 20,
            }}>
              WINNER WINNER
            </div>
            
            <h1 style={{
              fontSize: 72,
              fontWeight: 900,
              margin: 0,
              background: "linear-gradient(135deg, #facc15, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              textShadow: "0 0 60px rgba(250,204,21,0.5)",
            }}>
              CHICKEN DINNER!
            </h1>

            {winner ? (
              <>
                <div style={{ marginTop: 40 }}>
                  {winner.teamTag && (
                    <div style={{ fontSize: 24, color: "#facc15", fontWeight: 700, marginBottom: 8 }}>
                      [{winner.teamTag}]
                    </div>
                  )}
                  <div style={{ fontSize: 48, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                    {winner.teamName}
                  </div>
                </div>
                <div style={{
                  marginTop: 30,
                  display: "flex",
                  justifyContent: "center",
                  gap: 40,
                }}>
                  <Stat label="POINTS" value={winner.totalPoints} />
                  <Stat label="KILLS" value={winner.totalKills} />
                  <Stat label="WWCDS" value={winner.wwcdCount} />
                </div>
              </>
            ) : (
              <div style={{ marginTop: 40, fontSize: 20, color: "#9ca3af" }}>
                Awaiting champion...
              </div>
            )}

            <div style={{ marginTop: 40, fontSize: 14, color: "#facc15", letterSpacing: 3, fontWeight: 700 }}>
              {tournamentName?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#facc15" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 2, fontWeight: 700 }}>{label}</div>
    </div>
  );
}