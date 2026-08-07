"use client";
import { useEffect, useState, use } from "react";
import { Award, Flame } from "lucide-react";

export default function ChickenDinnerOverlay({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [match, setMatch] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/overlay/${token}/match`).then(r => r.json()).then(d => setMatch(d.currentMatch));
  }, [token]);

  if (!match?.results?.[0]) return null;
  const winner = match.results[0];

  return (
    <div style={{ width: "1920px", height: "1080px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "Rajdhani, sans-serif" }}>
      <div style={{ textAlign: "center", animation: "victory 1s ease-out" }}>
        <div style={{ fontSize: "2rem", color: "#facc15", fontWeight: 900, letterSpacing: "0.5em", marginBottom: "1rem" }}>WINNER WINNER</div>
        <h1 style={{ fontSize: "6rem", fontWeight: 900, textShadow: "0 0 40px #f59e0b" }}>{winner.teamName}</h1>
        <div style={{ fontSize: "2rem", color: "#f59e0b", fontWeight: 700 }}>CHICKEN DINNER</div>
      </div>
      <style>{`@keyframes victory { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}