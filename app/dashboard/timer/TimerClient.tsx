"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type TimerMode = "COUNTDOWN" | "COUNTUP";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export default function TimerClient() {
  const [mode, setMode] = useState<TimerMode>("COUNTDOWN");
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [inputMinutes, setInputMinutes] = useState("25");
  const [inputSeconds, setInputSeconds] = useState("00");
  const [label, setLabel] = useState("MATCH TIMER");
  const [targetSeconds, setTargetSeconds] = useState(25 * 60);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const remaining = mode === "COUNTDOWN"
    ? Math.max(0, targetSeconds - elapsed)
    : elapsed;

  const isFinished = mode === "COUNTDOWN" && elapsed >= targetSeconds;

  const progress = mode === "COUNTDOWN" && targetSeconds > 0
    ? Math.min(1, elapsed / targetSeconds)
    : 0;

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (isFinished) return;
    setHasStarted(true);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, [isFinished]);

  const pause = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
    setHasStarted(false);
  }, [stop]);

  useEffect(() => {
    if (isFinished && isRunning) {
      stop();
    }
  }, [isFinished, isRunning, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const mins = parseInt(inputMinutes) || 0;
    const secs = parseInt(inputSeconds) || 0;
    setTargetSeconds(mins * 60 + secs);
  }, [inputMinutes, inputSeconds]);

  function handleModeChange(newMode: TimerMode) {
    stop();
    setElapsed(0);
    setHasStarted(false);
    setMode(newMode);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        if (isRunning) pause();
        else start();
      }
      if (e.code === "KeyR") reset();
      if (e.code === "KeyF") toggleFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isRunning, pause, reset, start]);

  const timeColor = isFinished
    ? "#ef4444"
    : mode === "COUNTDOWN" && remaining <= 30
    ? "#f97316"
    : "var(--gold)";

  const timerDisplay = (
    <div
      ref={fullscreenRef}
      style={{
        background: "var(--black)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isFullscreen ? "0" : "3rem 2rem",
        minHeight: isFullscreen ? "100vh" : "auto",
        width: "100%",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        zIndex: isFullscreen ? 9999 : "auto",
      }}
    >
      {label && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: isFullscreen ? "1.5rem" : "0.75rem",
          color: "var(--charcoal)",
          letterSpacing: "0.3em",
          marginBottom: isFullscreen ? "2rem" : "1rem",
          textTransform: "uppercase",
        }}>
          {label}
        </div>
      )}

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: isFullscreen ? "clamp(6rem, 20vw, 18rem)" : "clamp(4rem, 12vw, 8rem)",
        fontWeight: "900",
        color: timeColor,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        transition: "color 0.3s",
        userSelect: "none",
      }}>
        {formatTime(remaining)}
      </div>

      {mode === "COUNTDOWN" && hasStarted && (
        <div style={{
          width: isFullscreen ? "60%" : "100%",
          maxWidth: "600px",
          height: "4px",
          background: "var(--surface)",
          marginTop: isFullscreen ? "2rem" : "1.5rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress * 100}%`,
            background: timeColor,
            transition: "width 1s linear, background 0.3s",
          }} />
        </div>
      )}

      {isFinished && (
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: isFullscreen ? "2rem" : "1rem",
          color: "#ef4444",
          marginTop: "1rem",
          letterSpacing: "0.2em",
          animation: "pulse 1s ease-in-out infinite",
        }}>
          TIME IS UP
        </div>
      )}

      {isFullscreen && (
        <div style={{
          display: "flex",
          gap: "2rem",
          marginTop: "3rem",
        }}>
          {!isRunning && !isFinished && (
            <button
              onClick={start}
              style={{
                padding: "1rem 3rem",
                background: "var(--gold)",
                color: "var(--black)",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "1.25rem",
                fontWeight: "900",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              START
            </button>
          )}
          {isRunning && (
            <button
              onClick={pause}
              style={{
                padding: "1rem 3rem",
                background: "transparent",
                color: "var(--gold)",
                border: "2px solid var(--gold)",
                fontFamily: "var(--font-mono)",
                fontSize: "1.25rem",
                fontWeight: "900",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              PAUSE
            </button>
          )}
          <button
            onClick={reset}
            style={{
              padding: "1rem 3rem",
              background: "transparent",
              color: "var(--charcoal)",
              border: "2px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "1.25rem",
              fontWeight: "900",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            RESET
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: "1rem 3rem",
              background: "transparent",
              color: "var(--charcoal)",
              border: "2px solid var(--border)",
              fontFamily: "var(--font-mono)",
              fontSize: "1.25rem",
              fontWeight: "900",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            EXIT
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      padding: "2rem",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "Barlow Condensed, sans-serif",
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--gold)",
          letterSpacing: "0.2em",
          marginBottom: "0.25rem",
        }}>
          DASHBOARD / TIMER
        </div>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "800",
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
        }}>
          Match Timer
        </h1>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}>
          <div>
            <label style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--charcoal)",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
            }}>
              MODE
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["COUNTDOWN", "COUNTUP"] as TimerMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  disabled={isRunning}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    background: mode === m ? "var(--gold)" : "var(--black)",
                    color: mode === m ? "var(--black)" : "var(--charcoal)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.6 : 1,
                  }}
                >
                  {m === "COUNTDOWN" ? "COUNT DOWN" : "COUNT UP"}
                </button>
              ))}
            </div>
          </div>

          {mode === "COUNTDOWN" && (
            <div>
              <label style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--charcoal)",
                letterSpacing: "0.15em",
                marginBottom: "0.4rem",
              }}>
                DURATION
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  type="number"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  disabled={isRunning || hasStarted}
                  min="0"
                  max="999"
                  placeholder="MM"
                  style={{
                    width: "60px",
                    background: "var(--black)",
                    border: "1px solid var(--border)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: "1rem",
                    padding: "0.4rem",
                    textAlign: "center",
                    opacity: isRunning || hasStarted ? 0.5 : 1,
                  }}
                />
                <span style={{ color: "var(--gold)", fontFamily: "var(--font-mono)", fontSize: "1.25rem" }}>:</span>
                <input
                  type="number"
                  value={inputSeconds}
                  onChange={(e) => setInputSeconds(e.target.value)}
                  disabled={isRunning || hasStarted}
                  min="0"
                  max="59"
                  placeholder="SS"
                  style={{
                    width: "60px",
                    background: "var(--black)",
                    border: "1px solid var(--border)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    fontSize: "1rem",
                    padding: "0.4rem",
                    textAlign: "center",
                    opacity: isRunning || hasStarted ? 0.5 : 1,
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{
              display: "block",
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--charcoal)",
              letterSpacing: "0.15em",
              marginBottom: "0.4rem",
            }}>
              LABEL (OPTIONAL)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. MATCH 1, BREAK TIME..."
              style={{
                width: "100%",
                background: "var(--black)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                padding: "0.5rem 0.6rem",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "0.75rem",
        }}>
          {[
            { label: "1 MIN", mins: 1, secs: 0 },
            { label: "3 MIN", mins: 3, secs: 0 },
            { label: "5 MIN", mins: 5, secs: 0 },
            { label: "10 MIN", mins: 10, secs: 0 },
            { label: "15 MIN", mins: 15, secs: 0 },
            { label: "25 MIN", mins: 25, secs: 0 },
            { label: "30 MIN", mins: 30, secs: 0 },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                if (isRunning || hasStarted) return;
                setInputMinutes(String(preset.mins));
                setInputSeconds(String(preset.secs).padStart(2, "0"));
              }}
              disabled={isRunning || hasStarted || mode === "COUNTUP"}
              style={{
                padding: "0.35rem 0.75rem",
                background: "var(--black)",
                color: "var(--charcoal)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                cursor: isRunning || hasStarted || mode === "COUNTUP" ? "not-allowed" : "pointer",
                opacity: isRunning || hasStarted || mode === "COUNTUP" ? 0.4 : 1,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        background: "var(--black)",
        border: "1px solid var(--border)",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3rem 2rem",
      }}>
        {label && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            color: "var(--charcoal)",
            letterSpacing: "0.3em",
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}>
            {label}
          </div>
        )}

        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(4rem, 12vw, 8rem)",
          fontWeight: "900",
          color: timeColor,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          transition: "color 0.3s",
          userSelect: "none",
        }}>
          {formatTime(remaining)}
        </div>

        {mode === "COUNTDOWN" && hasStarted && (
          <div style={{
            width: "100%",
            maxWidth: "500px",
            height: "4px",
            background: "var(--surface)",
            marginTop: "1.5rem",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${progress * 100}%`,
              background: timeColor,
              transition: "width 1s linear, background 0.3s",
            }} />
          </div>
        )}

        {isFinished && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            color: "#ef4444",
            marginTop: "1rem",
            letterSpacing: "0.2em",
            animation: "pulse 1s ease-in-out infinite",
          }}>
            TIME IS UP
          </div>
        )}
      </div>

      <div style={{
        display: "flex",
        gap: "1rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
      }}>
        {!isRunning && !isFinished && (
          <button
            onClick={start}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "1rem",
              background: "var(--gold)",
              color: "var(--black)",
              border: "none",
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              fontWeight: "900",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            ▶ START
          </button>
        )}
        {isRunning && (
          <button
            onClick={pause}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "1rem",
              background: "transparent",
              color: "var(--gold)",
              border: "2px solid var(--gold)",
              fontFamily: "var(--font-mono)",
              fontSize: "1rem",
              fontWeight: "900",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            ⏸ PAUSE
          </button>
        )}
        <button
          onClick={reset}
          style={{
            flex: 1,
            minWidth: "120px",
            padding: "1rem",
            background: "transparent",
            color: "var(--charcoal)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: "900",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ↺ RESET
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            flex: 1,
            minWidth: "120px",
            padding: "1rem",
            background: "transparent",
            color: "var(--charcoal)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            fontWeight: "900",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ⛶ FULLSCREEN
        </button>
      </div>

      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: "1rem",
      }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--charcoal)",
          letterSpacing: "0.15em",
          marginBottom: "0.5rem",
        }}>
          KEYBOARD SHORTCUTS
        </div>
        <div style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "var(--charcoal)",
        }}>
          {[
            { key: "SPACE", action: "Start / Pause" },
            { key: "R", action: "Reset" },
            { key: "F", action: "Fullscreen" },
          ].map((s) => (
            <div key={s.key} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{
                background: "var(--black)",
                border: "1px solid var(--border)",
                padding: "0.15rem 0.5rem",
                color: "var(--gold)",
                fontSize: "0.65rem",
              }}>
                {s.key}
              </span>
              <span>{s.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}