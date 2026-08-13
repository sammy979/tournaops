"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Zap, ChevronRight, Clock, ArrowLeft, Star } from "lucide-react";
import { useState, useEffect } from "react";

const MOCK = {
  team1: { name: "Team Alpha", tag: "ALPH", color: "#D4AF37", seed: 1, wins: 6, losses: 0 },
  team2: { name: "Team Nexus", tag: "NEX",  color: "#2563EB", seed: 2, wins: 5, losses: 1 },
  date: "July 28, 2025", time: "18:00 UTC", venue: "Online", bestOf: 7,
  tournament: "Champions Circuit Season 4", prizeWinner: "$5,000", prizeSub: "$2,500",
  status: "upcoming",
};

function Countdown() {
  const [secs, setSecs] = useState(172800);
  useEffect(() => { const i = setInterval(() => setSecs(s => Math.max(0,s-1)),1000); return ()=>clearInterval(i); },[]);
  const d = Math.floor(secs/86400), h = Math.floor((secs%86400)/3600), m = Math.floor((secs%3600)/60), s = secs%60;
  const pad = (n:number) => String(n).padStart(2,"0");
  return (
    <div className="flex gap-4 justify-center">
      {[{v:d,l:"Days"},{v:h,l:"Hours"},{v:m,l:"Mins"},{v:s,l:"Secs"}].map(u=>(
        <div key={u.l} className="text-center">
          <div className="w-16 h-16 bg-white/[0.06] border border-white/[0.10] rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-2xl tabular-nums">{pad(u.v)}</span>
          </div>
          <p className="text-white/30 text-xs mt-1">{u.l}</p>
        </div>
      ))}
    </div>
  );
}

export default function GrandFinalPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <nav className="sticky top-0 z-50 bg-[#060810]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={()=>router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-yellow-500">Ops</span></button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <button onClick={()=>router.push(`/tournaments/${slug}`)} className="hover:text-white/70 transition-colors">Champions Circuit S4</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70">Grand Final</span>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-[#060810] to-yellow-950/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <button onClick={()=>router.push(`/tournaments/${slug}`)} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Tournament
          </button>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Trophy className="w-4 h-4" /> Grand Finals
          </div>
          <h1 className="text-5xl font-black text-white mb-2">{MOCK.tournament}</h1>
          <p className="text-white/40 mb-10">{MOCK.date} Â· {MOCK.time} Â· Bo{MOCK.bestOf}</p>

          {/* Teams */}
          <div className="flex items-center gap-8 justify-center mb-10">
            <div className="flex-1 text-right">
              <div className="w-24 h-24 rounded-2xl ml-auto mb-3 flex items-center justify-center text-4xl font-black text-white shadow-2xl"
                style={{background:MOCK.team1.color,boxShadow:`0 20px 60px ${MOCK.team1.color}50`}}>
                {MOCK.team1.tag[0]}
              </div>
              <p className="text-white font-black text-2xl">{MOCK.team1.name}</p>
              <p className="text-white/30 text-sm">[{MOCK.team1.tag}] Â· #{MOCK.team1.seed} Seed</p>
              <p className="text-emerald-400 text-sm font-bold mt-1">{MOCK.team1.wins}W â€” {MOCK.team1.losses}L</p>
            </div>
            <div className="text-center flex-shrink-0">
              <p className="text-white/20 font-black text-4xl">VS</p>
              <p className="text-amber-400/60 text-xs mt-1">Bo{MOCK.bestOf}</p>
            </div>
            <div className="flex-1 text-left">
              <div className="w-24 h-24 rounded-2xl mr-auto mb-3 flex items-center justify-center text-4xl font-black text-white shadow-2xl"
                style={{background:MOCK.team2.color,boxShadow:`0 20px 60px ${MOCK.team2.color}50`}}>
                {MOCK.team2.tag[0]}
              </div>
              <p className="text-white font-black text-2xl">{MOCK.team2.name}</p>
              <p className="text-white/30 text-sm">[{MOCK.team2.tag}] Â· #{MOCK.team2.seed} Seed</p>
              <p className="text-emerald-400 text-sm font-bold mt-1">{MOCK.team2.wins}W â€” {MOCK.team2.losses}L</p>
            </div>
          </div>

          <p className="text-white/40 text-sm mb-4">Match starts in</p>
          <Countdown />

          <div className="flex gap-4 justify-center mt-8">
            <div className="bg-white/[0.06] border border-white/[0.10] rounded-xl px-5 py-3 text-center">
              <p className="text-amber-400 font-black text-lg">{MOCK.prizeWinner}</p>
              <p className="text-white/30 text-xs">1st Place</p>
            </div>
            <div className="bg-white/[0.06] border border-white/[0.10] rounded-xl px-5 py-3 text-center">
              <p className="text-slate-300 font-black text-lg">{MOCK.prizeSub}</p>
              <p className="text-white/30 text-xs">2nd Place</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/[0.06] py-6 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white font-black">Tourna<span className="text-yellow-500">Ops</span></span>
          <p className="text-white/20 text-sm">Â© 2025 TournaOps</p>
        </div>
      </footer>
    </div>
  );
}