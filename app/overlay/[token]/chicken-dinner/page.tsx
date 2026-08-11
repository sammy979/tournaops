"use client";

import { useState, useEffect } from "react";
import { Trophy, Star } from "lucide-react";

const MOCK = { team: "Team Alpha", tag: "ALPH", tournament: "Champions Circuit S4", color: "#7C3AED" };

export default function ChickenDinnerOverlay() {
  const [visible, setVisible] = useState(false);
  const [stars,   setStars]   = useState<{ x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    setStars(Array.from({ length: 20 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100, delay: Math.random() * 2,
    })));
  }, []);

  return (
    <div className="w-full h-screen bg-black/85 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
      {/* Particle stars */}
      {stars.map((s, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-amber-400 animate-ping"
          style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s`, opacity: 0.6 }} />
      ))}

      {/* Glow */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ background: MOCK.color }} />

      <div className={`relative transition-all duration-1000 text-center ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
        {/* Trophy */}
        <div className="relative inline-block mb-6">
          <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-bounce"
            style={{ background: `radial-gradient(circle at 30% 30%, ${MOCK.color}cc, ${MOCK.color}44)`, boxShadow: `0 0 60px ${MOCK.color}80` }}>
            <Trophy className="w-16 h-16 text-amber-300" />
          </div>
          {[0,1,2,3,4,5].map(i => (
            <Star key={i} className="absolute w-4 h-4 text-amber-400 fill-amber-400 animate-spin"
              style={{ top: `${50 + 50 * Math.sin(i * 60 * Math.PI / 180)}%`, left: `${50 + 50 * Math.cos(i * 60 * Math.PI / 180)}%`, animationDuration: `${3 + i}s`, animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>

        {/* Text */}
        <p className="text-amber-400 text-sm font-black uppercase tracking-[0.4em] mb-3">WINNER WINNER</p>
        <h1 className="text-white font-black text-7xl leading-none mb-2 drop-shadow-2xl" style={{ textShadow: `0 0 40px ${MOCK.color}` }}>
          {MOCK.team}
        </h1>
        <p className="text-white/40 text-xl font-bold mb-6">[{MOCK.tag}]</p>
        <p className="text-white/25 text-sm">{MOCK.tournament} Champions</p>
        <p className="text-white/10 text-xs font-bold tracking-widest mt-8">TOURNAOPS</p>
      </div>
    </div>
  );
}