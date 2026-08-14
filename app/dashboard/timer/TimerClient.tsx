"use client";
import { useState, useEffect, useRef, useCallback } from "react";

export default function TimerClient() {
  const [mode, setMode] = useState<"countdown" | "countup">("countdown");
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [flash, setFlash] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSeconds = inputMinutes * 60 + inputSeconds;

  const reset = useCallback(() => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(mode === "countdown" ? totalSeconds : 0);
    setFlash(false);
  }, [mode, totalSeconds]);

  useEffect(() => { reset(); }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (mode === "countdown") {
            if (prev <= 1) {
              setRunning(false);
              setFlash(true);
              return 0;
            }
            return prev - 1;
          } else {
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); setRunning(r => !r); }
      if (e.code === "KeyR") reset();
      if (e.code === "KeyF") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reset]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const progress = mode === "countdown" && totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 100;
  const isLow = mode === "countdown" && timeLeft <= 30 && timeLeft > 0;
  const isDone = mode === "countdown" && timeLeft === 0;

  return (
    <div ref={containerRef} style={{ background: fullscreen ? "#0a0a0a" : "transparent", minHeight: fullscreen ? "100vh" : "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: fullscreen ? "center" : "flex-start", padding: fullscreen ? "2rem" : "0" }}>

      {!fullscreen && (
        <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "0.05em" }}>MATCH TIMER</h1>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>Space = play/pause · R = reset · F = fullscreen</p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            {(["countdown", "countup"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "0.75rem", background: mode === m ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${mode === m ? "#D4AF37" : "rgba(255,255,255,0.08)"}`, borderRadius: "0.5rem", color: mode === m ? "#D4AF37" : "#9ca3af", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em", minHeight: "44px" }}>
                {m === "countdown" ? "⏱ Countdown" : "⏫ Count Up"}
              </button>
            ))}
          </div>

          {mode === "countdown" && (
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>MINUTES</label>
                <input type="number" min={0} max={999} value={inputMinutes} onChange={e => { setInputMinutes(Number(e.target.value)); reset(); }} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.75rem", color: "#fff", fontSize: "1.25rem", fontWeight: 700, textAlign: "center", outline: "none", minHeight: "44px", boxSizing: "border-box" }} />
              </div>
              <div style={{ color: "#D4AF37", fontSize: "2rem", fontWeight: 900, paddingTop: "1.25rem" }}>:</div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "block", marginBottom: "0.25rem" }}>SECONDS</label>
                <input type="number" min={0} max={59} value={inputSeconds} onChange={e => { setInputSeconds(Number(e.target.value)); reset(); }} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.5rem", padding: "0.75rem", color: "#fff", fontSize: "1.25rem", fontWeight: 700, textAlign: "center", outline: "none", minHeight: "44px", boxSizing: "border-box" }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ background: isDone ? "rgba(239,68,68,0.08)" : isLow ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)", border: `2px solid ${isDone ? "#ef4444" : isLow ? "rgba(239,68,68,0.4)" : "rgba(212,175,55,0.2)"}`, borderRadius: "1rem", padding: fullscreen ? "4rem 2rem" : "2rem 1.5rem", textAlign: "center", animation: flash && isDone ? "pulse 0.5s infinite" : "none" }}>

          {mode === "countdown" && !fullscreen && (
            <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", marginBottom: "1.5rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: isLow ? "#ef4444" : "#D4AF37", borderRadius: "3px", transition: "width 1s linear, background 0.3s" }} />
            </div>
          )}

          <div style={{ fontSize: fullscreen ? "clamp(6rem, 20vw, 14rem)" : "clamp(4rem, 15vw, 8rem)", fontWeight: 900, color: isDone ? "#ef4444" : isLow ? "#f87171" : "#D4AF37", fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.05em", lineHeight: 1, textShadow: `0 0 40px ${isDone ? "rgba(239,68,68,0.4)" : "rgba(212,175,55,0.3)"}` }}>
            {formatTime(timeLeft)}
          </div>

          {isDone && (
            <div style={{ marginTop: "1rem", fontSize: "1.5rem", fontWeight: 800, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ⚠ TIME UP
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button onClick={() => setRunning(r => !r)} style={{ flex: 2, padding: "1rem", background: running ? "rgba(239,68,68,0.15)" : "rgba(212,175,55,0.15)", border: `1px solid ${running ? "rgba(239,68,68,0.4)" : "rgba(212,175,55,0.4)"}`, borderRadius: "0.5rem", color: running ? "#f87171" : "#D4AF37", fontWeight: 800, fontSize: "1rem", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em", minHeight: "56px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {running ? "⏸ PAUSE" : "▶ START"}
          </button>
          <button onClick={reset} style={{ flex: 1, padding: "1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#9ca3af", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", textTransform: "uppercase", minHeight: "56px" }}>
            ↺ RESET
          </button>
          <button onClick={toggleFullscreen} style={{ flex: 1, padding: "1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.5rem", color: "#9ca3af", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", textTransform: "uppercase", minHeight: "56px" }}>
            {fullscreen ? "⤡ EXIT" : "⤢ FULL"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        input[type=number]::-webkit-inner-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}