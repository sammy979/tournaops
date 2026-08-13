"use client";

import { useState, useEffect } from "react";
import { Trophy, CheckCircle2 } from "lucide-react";

const MOCK = {
  winner: { name: "Team Alpha", tag: "ALPH", color: "#D4AF37" },
  loser:  { name: "Team Nexus", tag: "NEX",  color: "#2563EB" },
  score: "2-1", stage: "Quarterfinals", maps: ["Ascent 13-8","Bind 9-13","Icebox 13-11"],
};

export default function FinalResultsOverlay() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="w-full h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className={`transition-all duration-1000 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <div className="w-[900px] bg-gradient-to-br from-[#0a0814] via-[#0d0f1a] to-[#0a0814] border border-yellow-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-yellow-500">
          {/* Header */}
          <div className="text-center py-6 border-b border-white/[0.06] bg-yellow-500/[0.05]">
            <p className="text-yellow-500 text-sm font-black uppercase tracking-widest mb-1">{MOCK.stage}</p>
            <p className="text-white/40 text-xs">Match Complete</p>
          </div>
          {/* Score */}
          <div className="flex items-center gap-8 px-10 py-8">
            <div className="flex-1 text-center">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-black text-white shadow-xl"
                style={{ background: MOCK.winner.color }}>{MOCK.winner.tag[0]}</div>
              <p className="text-white font-black text-2xl">{MOCK.winner.name}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 text-sm font-bold">Winner</span>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-white font-black text-6xl tracking-tight">{MOCK.score}</p>
              <p className="text-white/20 text-sm mt-1">Maps Won</p>
            </div>
            <div className="flex-1 text-center opacity-50">
              <div className="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl font-black text-white"
                style={{ background: MOCK.loser.color }}>{MOCK.loser.tag[0]}</div>
              <p className="text-white font-black text-2xl">{MOCK.loser.name}</p>
              <p className="text-white/40 text-sm mt-2">Good game</p>
            </div>
          </div>
          {/* Map breakdown */}
          <div className="px-10 pb-6">
            <p className="text-white/25 text-xs font-semibold uppercase tracking-wide mb-2 text-center">Map Results</p>
            <div className="flex gap-2 justify-center">
              {MOCK.maps.map(m => (
                <span key={m} className="bg-white/[0.05] border border-white/[0.08] text-white/50 text-xs px-3 py-1 rounded-lg font-mono">{m}</span>
              ))}
            </div>
          </div>
          <div className="text-center pb-4">
            <span className="text-white/10 text-xs font-bold tracking-widest">TOURNAOPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}