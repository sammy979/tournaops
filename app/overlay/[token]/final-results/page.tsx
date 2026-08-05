"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function FinalResultsOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [standings, setStandings] = useState<any[]>([]);
  const [tournamentName, setTournamentName] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          setStandings(data.standings || []);
          setTournamentName(data.tournament?.name || "");
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const aiBg = `https://image.pollinations.ai/prompt/${encodeURIComponent("epic esports championship stage, spotlights on podium, crowd cheering, cinematic, dramatic, gold and black theme")}?width=1920&height=1080&nologo=true&model=flux`;

  const top3 = standings.slice(0, 3);

  return (
    <div style={{
      background: "transparent",
      minHeight: "100vh",
      padding: 40,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        position: "relative",
        maxWidth: 1000,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        border: "3px solid #facc15",
        boxShadow: "0 30px 100px rgba(250,204,21,0.4)",
      }}>
        <div style={{
          background: `url(${aiBg})`,
          backgroundSize: "cover",
          padding: "50px 40px 40px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.7), rgba(30,20,0,0.9))",
          }}></div>

          <div style={{ position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #facc15, #f97316)",
                color: "black",
                padding: "6px 24px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 4,
                marginBottom: 12,
              }}>
                🏆 FINAL RESULTS
              </div>
              <h1 style={{
                fontSize: 42,
                fontWeight: 900,
                color: "white",
                margin: 0,
                letterSpacing: "-0.02em",
              }}>
                {tournamentName || "TOURNAMENT"}
              </h1>
            </div>

            {top3.length > 0 ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.2fr 1fr",
                gap: 20,
                alignItems: "end",
              }}>
                <PodiumCard team={top3[1]} rank={2} medal="🥈" height={220} color="#94a3b8" />
                <PodiumCard team={top3[0]} rank={1} medal="🏆" height={280} color="#facc15" main />
                <PodiumCard team={top3[2]} rank={3} medal="🥉" height={180} color="#f97316" />
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 20 }}>
                Awaiting results...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ team, rank, medal, height, color, main }: any) {
  if (!team) return <div style={{ height }}></div>;
  
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: main ? 80 : 60, marginBottom: 10 }}>{medal}</div>
      {team.teamTag && (
        <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 4 }}>
          [{team.teamTag}]
        </div>
      )}
      <div style={{
        fontSize: main ? 24 : 18,
        fontWeight: 900,
        color: "white",
        marginBottom: 12,
        letterSpacing: "-0.02em",
      }}>
        {team.teamName}
      </div>
      <div style={{
        height,
        background: `linear-gradient(180deg, ${color}, ${color}CC)`,
        borderRadius: "12px 12px 0 0",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        border: `2px solid ${color}`,
        boxShadow: `0 0 40px ${color}66`,
      }}>
        <div style={{ fontSize: 42, fontWeight: 900, color: main ? "black" : "white" }}>
          {team.totalPoints}
        </div>
        <div style={{ fontSize: 11, color: main ? "black" : "white", opacity: 0.8, fontWeight: 700, letterSpacing: 2 }}>
          POINTS
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: main ? "black" : "white", marginTop: 8, opacity: 0.9 }}>
          {rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd"}
        </div>
      </div>
    </div>
  );
}