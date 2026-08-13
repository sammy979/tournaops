"use client";

import { useState, useEffect } from "react";
import { Zap, Star } from "lucide-react";

const MOCK = {
  player: "ShadowX", team: "Team Alpha", tag: "ALPH",
  kills: 24, deaths: 8, assists: 6, acs: 312, kd: "3.0",
  agent: "Jett", headshots: "42%", color: "#D4AF37",
};

export default function TopFraggerOverlay() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div className="w-full h-screen bg-transparent flex items-end justify-start p-6">
      <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Card — 400×200 OBS source */}
        <div className="w-[400px] bg-gradient-to-br from-black/95 to-[#0a0814]/95 border border-yellow-500/40 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl shadow-yellow-500">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08]" style={{ background: `${MOCK.color}20` }}>
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Top Performer</span>
          </div>
          {/* Body */}
          <div className="flex items-center gap-4 p-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0 shadow-lg"
              style={{ background: MOCK.color }}>
              {MOCK.player[0]}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-xl leading-none">{MOCK.player}</p>
              <p className="text-white/40 text-xs mt-0.5">{MOCK.team} · {MOCK.agent}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <p className="text-white font-black text-lg leading-none">{MOCK.kills}</p>
                  <p className="text-white/30 text-xs">K</p>
                </div>
                <div className="w-px h-6 bg-white/[0.10]" />
                <div className="text-center">
                  <p className="text-white/50 font-black text-lg leading-none">{MOCK.deaths}</p>
                  <p className="text-white/30 text-xs">D</p>
                </div>
                <div className="w-px h-6 bg-white/[0.10]" />
                <div className="text-center">
                  <p className="text-white/70 font-black text-lg leading-none">{MOCK.assists}</p>
                  <p className="text-white/30 text-xs">A</p>
                </div>
                <div className="w-px h-6 bg-white/[0.10]" />
                <div className="text-center">
                  <p className="text-yellow-500 font-black text-lg leading-none">{MOCK.acs}</p>
                  <p className="text-white/30 text-xs">ACS</p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 flex items-center justify-between">
            <span className="text-white/20 text-xs">K/D: <span className="text-white/50 font-bold">{MOCK.kd}</span></span>
            <span className="text-white/20 text-xs">HS: <span className="text-white/50 font-bold">{MOCK.headshots}</span></span>
            <span className="text-white/15 text-xs font-bold tracking-wider">TOURNAOPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}