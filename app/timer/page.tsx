"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function TimerContent() {
  const searchParams = useSearchParams();
  const theme = searchParams?.get("theme") || "dark";
  const label = searchParams?.get("label") || "MATCH STARTING IN";
  const size = searchParams?.get("size") || "lg";

  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalRef = useRef(300);
  const remainingRef = useRef(300);

  const themes: Record<string, any> = {
    dark: { bg: "rgba(10,10,15,0.92)", text: "#ffffff", accent: "#60a5fa", sub: "#4b5563", border: "rgba(96,165,250,0.3)" },
    fire: { bg: "rgba(20,5,0,0.92)", text: "#ffffff", accent: "#f97316", sub: "#92400e", border: "rgba(249,115,22,0.4)" },
    green: { bg: "rgba(0,15,5,0.92)", text: "#ffffff", accent: "#22c55e", sub: "#166534", border: "rgba(34,197,94,0.4)" },
    minimal: { bg: "transparent", text: "#ffffff", accent: "#ffffff", sub: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.2)" },
  };

  const t = themes[theme] || themes.dark;
  const fontSizes: Record<string, string> = { sm: "72px", md: "96px", lg: "128px", xl: "160px" };
  const fs = fontSizes[size] || fontSizes.lg;

  const start = (mins: number, secs: number) => {
    const total = mins * 60 + secs;
    totalRef.current = total;
    remainingRef.current = total;
    setFinished(false);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      remainingRef.current -= 1;
      setMinutes(Math.floor(remainingRef.current / 60));
      setSeconds(remainingRef.current % 60);
      if (remainingRef.current <= 0) {
        clearInterval(intervalRef.current!);
        setRunning(false);
        setFinished(true);
      }
    }, 1000);
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  };

  const reset = () => {
    stop();
    setFinished(false);
    remainingRef.current = totalRef.current;
    setMinutes(Math.floor(totalRef.current / 60));
    setSeconds(totalRef.current % 60);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const progress = totalRef.current > 0 ? (remainingRef.current / totalRef.current) * 100 : 100;
  const isLow = remainingRef.current <= 30 && running;

  return (
    <div style={{ minHeight: "100vh", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{
        background: t.bg,
        border: `2px solid ${isLow ? "#ef4444" : t.border}`,
        borderRadius: 20,
        padding: "32px 48px",
        backdropFilter: "blur(16px)",
        textAlign: "center",
        minWidth: 320,
        transition: "border-color 0.3s",
        boxShadow: isLow ? "0 0 40px rgba(239,68,68,0.3)" : "0 0 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          color: isLow ? "#ef4444" : t.accent,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginBottom: 16,
          fontFamily: "Inter, sans-serif",
        }}>
          {finished ? "TIME'S UP!" : label}
        </div>

        <div style={{
          color: isLow ? "#ef4444" : t.text,
          fontSize: fs,
          fontWeight: 900,
          fontFamily: "monospace",
          lineHeight: 1,
          letterSpacing: -2,
          transition: "color 0.3s",
        }}>
          {pad(minutes)}:{pad(seconds)}
        </div>

        <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 20, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: isLow ? "#ef4444" : t.accent,
            borderRadius: 2,
            transition: "width 1s linear, background 0.3s",
          }} />
        </div>

        <div style={{ color: t.sub, fontSize: 11, marginTop: 12, fontFamily: "Inter, sans-serif" }}>
          tournaops.com
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 8, justifyContent: "center" }}>
          {!running ? (
            <button
              onClick={() => start(minutes, seconds)}
              style={{ background: t.accent, color: "#000", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              {finished ? "Restart" : "Start"}
            </button>
          ) : (
            <button
              onClick={stop}
              style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
            >
              Pause
            </button>
          )}
          <button
            onClick={reset}
            style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
        <div style={{ color: "#60a5fa", fontFamily: "monospace", fontSize: 48 }}>00:00</div>
      </div>
    }>
      <TimerContent />
    </Suspense>
  );
}