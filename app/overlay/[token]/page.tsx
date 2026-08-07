"use client";
import { useEffect, useState, use } from "react";
import { Trophy, Target, Award } from "lucide-react";

export default function OverlayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetcher = () => fetch(`/api/overlay/${token}`).then(r => r.json()).then(d => setData(d));
    fetcher(); const i = setInterval(fetcher, 5000); return () => clearInterval(i);
  }, [token]);

  if (!data) return null;
  const { tournament, standings = [] } = data;

  return (
    <div style={{ width: "1920px", height: "1080px", position: "relative", overflow: "hidden", color: "#fff", fontFamily: "Rajdhani, sans-serif" }}>
      <div style={{ position: "absolute", bottom: "100px", left: "100px", width: "500px", background: "rgba(0,0,0,0.85)", borderRadius: "1.5rem", border: "2px solid #f59e0b", overflow: "hidden" }}>
        <div style={{ background: "#f59e0b", padding: "1rem", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#000", fontWeight: 900 }}>{tournament.name}</span>
          <span style={{ color: "#000", fontWeight: 700 }}>STANDINGS</span>
        </div>
        <div style={{ padding: "1rem" }}>
          {standings.slice(0, 10).map((s:any, i:number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <span>#{s.rank} {s.teamName}</span>
              <span style={{ fontWeight: 800 }}>{s.totalPoints}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}