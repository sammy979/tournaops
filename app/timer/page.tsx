"use client";

import PublicNav    from "@/components/ui/PublicNav";
import PublicFooter from "@/components/ui/PublicFooter";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Play, Square, RefreshCw, Bell, Volume2, VolumeX } from "lucide-react";

type Mode = "countdown" | "stopwatch";

export default function TimerPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState<Mode>("countdown");
  const [running, setRunning] = useState(false);
  const [secs,    setSecs]    = useState(900);
  const [initial, setInitial] = useState(900);
  const [muted,   setMuted]   = useState(false);
  const [laps,    setLaps]    = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(()=>{
    if(running){
      intervalRef.current = setInterval(()=>{
        setSecs(s=>{
          if(mode==="countdown"){ if(s<=1){ setRunning(false); return 0; } return s-1; }
          return s+1;
        });
      },1000);
    } else { if(intervalRef.current) clearInterval(intervalRef.current); }
    return ()=>{ if(intervalRef.current) clearInterval(intervalRef.current); };
  },[running,mode]);

  const fmt=(s:number)=>{
    const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;
    if(h>0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const reset=()=>{ setRunning(false); setSecs(mode==="countdown"?initial:0); setLaps([]); };
  const pct = mode==="countdown" ? (secs/initial)*100 : 0;
  const urgent = mode==="countdown" && secs<=30 && secs>0;

  const PRESETS=[{l:"5m",v:300},{l:"10m",v:600},{l:"15m",v:900},{l:"20m",v:1200},{l:"30m",v:1800},{l:"1h",v:3600}];

  return (
    <div className="min-h-screen bg-[#060810] text-white flex flex-col">
      <nav className="border-b border-white/[0.06] bg-[#060810]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={()=>router.push("/")} className="text-white font-black text-lg">Tourna<span className="text-violet-400">Ops</span></button>
          <span className="text-white/30 text-sm">Match Timer</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          {/* Mode toggle */}
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-8 gap-1">
            {(["countdown","stopwatch"] as Mode[]).map(m=>(
              <button key={m} onClick={()=>{setMode(m);reset();}}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${mode===m?"bg-yellow-500 text-white":"text-white/40 hover:text-white"}`}>
                {m}
              </button>
            ))}
          </div>

          {/* Timer display */}
          <div className="relative mb-8">
            <div className={`text-8xl font-black tabular-nums leading-none transition-colors ${urgent?"text-rose-400 animate-pulse":"text-white"}`}>
              {fmt(secs)}
            </div>
            {mode==="countdown" && (
              <div className="mt-4 w-full bg-white/[0.06] rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-1000 ${urgent?"bg-rose-500":"bg-yellow-500"}`} style={{width:`${pct}%`}} />
              </div>
            )}
            {mode==="stopwatch" && laps.length>0 && (
              <div className="mt-3 flex gap-2 justify-center flex-wrap">
                {laps.map((l,i)=>(
                  <span key={i} className="bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs px-2 py-1 rounded-lg font-mono">
                    L{i+1} {fmt(l)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          {mode==="countdown" && !running && (
            <div className="flex gap-2 justify-center mb-6 flex-wrap">
              {PRESETS.map(p=>(
                <button key={p.v} onClick={()=>{setSecs(p.v);setInitial(p.v);}}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${secs===p.v?"bg-yellow-500 text-white border-yellow-500":"bg-white/[0.04] text-white/40 border-white/[0.08] hover:text-white/70"}`}>
                  {p.l}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 justify-center">
            <button onClick={()=>setMuted(!muted)} className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors">
              {muted?<VolumeX className="w-4 h-4"/>:<Volume2 className="w-4 h-4"/>}
            </button>
            <button onClick={()=>setRunning(!running)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-lg transition-all ${running?"bg-rose-600 hover:bg-rose-500 text-white":"bg-yellow-500 hover:bg-yellow-500 text-white hover:scale-105"}`}>
              {running?<><Square className="w-5 h-5"/>Stop</>:<><Play className="w-5 h-5"/>Start</>}
            </button>
            <button onClick={reset} className="w-10 h-10 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4"/>
            </button>
          </div>

          {mode==="stopwatch" && running && (
            <button onClick={()=>setLaps(l=>[...l,secs])} className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors">
              + Lap
            </button>
          )}
        </div>
      </div>
    </div>
  );
}