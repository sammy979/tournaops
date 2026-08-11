"use client";

import { useState, useEffect } from "react";
import { Clock, Zap } from "lucide-react";

const MOCK = {
  team1: { name: "Team Void",  tag: "VOD", color: "#7C3AED" },
  team2: { name: "Team Storm", tag: "STM", color: "#2563EB" },
  stage: "Quarterfinals", bestOf: 3, map: "TBD",
  startsIn: 900, // seconds
};

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

export default function NextMatchOverlay() {
  const [secs, setSecs] = useState(MOCK.startsIn);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const i = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-center pb-8">
      <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* 800×200 OBS source */}
        <div className="w-[800px] bg-gradient-to-r from-black/95 via-[#0a0814]/95 to-black/95 border border-white/[0.12] rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="flex items-center gap-2 px-5 py-2 border-b border-white/[0.06] bg-white/[0.02]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 text-xs font-black uppercase tracking-widest">Next Match</span>
            <span className="ml-auto text-white font-black text-sm font-mono tabular-nums">{fmt(secs)}</span>
          </div>
          <div className="flex items-center gap-6 px-6 py-5">
            {/* Team 1 */}
            <div className="flex-1 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0"
                style={{ background: MOCK.team1.color }}>{MOCK.team1.tag[0]}</div>
              <div>
                <p className="text-white font-black text-xl">{MOCK.team1.name}</p>
                <p className="text-white/30 text-xs font-mono">[{MOCK.team1.tag}]</p>
              </div>
            </div>
            {/* VS */}
            <div className="text-center flex-shrink-0">
              <p className="text-white/20 font-black text-2xl">VS</p>
              <p className="text-white/40 text-xs mt-1">Bo{MOCK.bestOf} · {MOCK.stage}</p>
            </div>
            {/* Team 2 */}
            <div className="flex-1 flex items-center justify-end gap-3">
              <div className="text-right">
                <p className="text-white font-black text-xl">{MOCK.team2.name}</p>
                <p className="text-white/30 text-xs font-mono">[{MOCK.team2.tag}]</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg flex-shrink-0"
                style={{ background: MOCK.team2.color }}>{MOCK.team2.tag[0]}</div>
            </div>
          </div>
          <div className="flex items-center justify-center pb-2">
            <span className="text-white/10 text-xs font-bold tracking-widest">TOURNAOPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}