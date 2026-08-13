"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface MatchData {
  team1: { name: string; tag: string; score: number; color: string };
  team2: { name: string; tag: string; score: number; color: string };
  stage: string;
  round: string;
  bestOf: number;
  map: string;
  timer: number;
}

const MOCK: MatchData = {
  team1: { name: "Team Alpha", tag: "ALPH", score: 1, color: "#D4AF37" },
  team2: { name: "Team Nexus", tag: "NEX",  score: 0, color: "#2563EB" },
  stage: "Quarterfinals", round: "Round 2", bestOf: 3, map: "Ascent", timer: 0,
};

export default function MatchOverlay() {
  const params = useParams();
  const [data] = useState<MatchData>(MOCK);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="w-full h-screen bg-transparent flex items-start justify-center pt-0">
      {/* Scoreboard bar — designed for 1920×120 OBS browser source */}
      <div className="w-full h-[120px] flex items-center bg-gradient-to-r from-black/90 via-[#0a0814]/95 to-black/90 border-b-2 border-yellow-500/60 backdrop-blur-sm">

        {/* Team 1 */}
        <div className="flex-1 flex items-center justify-end gap-4 px-8">
          <div className="text-right">
            <p className="text-white font-black text-2xl leading-none tracking-tight">{data.team1.name}</p>
            <p className="text-white/30 text-sm font-mono mt-0.5">[{data.team1.tag}]</p>
          </div>
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
            style={{ background: data.team1.color }}>
            {data.team1.score}
          </div>
        </div>

        {/* Center info */}
        <div className="flex-shrink-0 px-8 text-center">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-black uppercase tracking-widest">Live</span>
          </div>
          <p className="text-white/60 text-xs font-medium">{data.stage}</p>
          <p className="text-white/40 text-xs">Bo{data.bestOf} · {data.map}</p>
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex items-center gap-4 px-8">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
            style={{ background: data.team2.color }}>
            {data.team2.score}
          </div>
          <div>
            <p className="text-white font-black text-2xl leading-none tracking-tight">{data.team2.name}</p>
            <p className="text-white/30 text-sm font-mono mt-0.5">[{data.team2.tag}]</p>
          </div>
        </div>

        {/* TournaOps brand */}
        <div className="absolute bottom-2 right-4 text-white/20 text-xs font-bold tracking-wider">
          TOURNAOPS
        </div>
      </div>
    </div>
  );
}