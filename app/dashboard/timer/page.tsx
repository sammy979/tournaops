"use client";

import { useState } from "react";
import {
  Copy, ExternalLink, Check, Clock, Zap, Palette,
  Monitor, Info, Sparkles
} from "lucide-react";

const PRESETS = [
  { label: "MATCH STARTING IN", mins: 5, icon: Zap, color: "#f59e0b" },
  { label: "NEXT MATCH", mins: 10, icon: Clock, color: "#60a5fa" },
  { label: "BREAK", mins: 15, icon: Clock, color: "#4ade80" },
  { label: "HALFTIME", mins: 3, icon: Clock, color: "#c084fc" },
  { label: "LOBBY OPEN", mins: 2, icon: Sparkles, color: "#f472b6" },
];

const THEMES = [
  { key: "dark", label: "Dark", color: "#0a0a0f", accent: "#fff" },
  { key: "fire", label: "Fire", color: "#f97316", accent: "#fff" },
  { key: "green", label: "Green", color: "#22c55e", accent: "#fff" },
  { key: "minimal", label: "Minimal", color: "#f3f4f6", accent: "#000" },
];

export default function TimerSetupPage() {
  const [minutes, setMinutes] = useState(5);
  const [label, setLabel] = useState("MATCH STARTING IN");
  const [theme, setTheme] = useState("dark");
  const [size, setSize] = useState("lg");
  const [copied, setCopied] = useState(false);

  const base = typeof window !== "undefined" ? window.location.origin : "https://tournaops.com";
  const url = `${base}/timer?theme=${theme}&label=${encodeURIComponent(label)}&size=${size}&mins=${minutes}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
          fontWeight: 800, color: "#fff",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            borderRadius: "0.625rem",
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Clock style={{ width: "1.25rem", height: "1.25rem", color: "#000" }} />
          </div>
          Match Timer
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.375rem" }}>
          Countdown timer for OBS Studio — perfect for between-match breaks
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.25rem",
      }} className="timer-grid">

        {/* ── LEFT: Configuration ────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Presets */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.875rem",
            padding: "1.125rem",
          }}>
            <label style={{
              display: "block",
              fontSize: "0.7rem", fontWeight: 700,
              color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}>
              Quick Presets
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {PRESETS.map(p => {
                const Icon = p.icon;
                const active = label === p.label;
                return (
                  <button
                    key={p.label}
                    onClick={() => { setLabel(p.label); setMinutes(p.mins); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.625rem 0.875rem",
                      borderRadius: "0.625rem",
                      border: active ? `1px solid ${p.color}40` : "1px solid rgba(255,255,255,0.06)",
                      background: active ? `${p.color}15` : "rgba(255,255,255,0.02)",
                      color: active ? p.color : "#9ca3af",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#fff";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "#9ca3af";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Icon style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
                      <span>{p.label}</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700 }}>
                      {p.mins}:00
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Settings */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.875rem",
            padding: "1.125rem",
          }}>
            <label style={{
              display: "block",
              fontSize: "0.7rem", fontWeight: 700,
              color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
              marginBottom: "0.875rem",
            }}>
              Customize
            </label>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.75rem", fontWeight: 600,
                color: "#d1d5db",
                marginBottom: "0.375rem",
              }}>
                Label Text
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "0.75rem", fontWeight: 600,
                color: "#d1d5db",
                marginBottom: "0.5rem",
              }}>
                <span>Duration</span>
                <span style={{ fontFamily: "monospace", color: "#f59e0b", fontWeight: 700 }}>
                  {minutes}:00
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={60}
                value={minutes}
                onChange={e => setMinutes(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#f59e0b",
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#4b5563", marginTop: "0.25rem" }}>
                <span>1 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.75rem", fontWeight: 600,
                color: "#d1d5db",
                marginBottom: "0.5rem",
              }}>
                Theme
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.375rem" }}>
                {THEMES.map(t => {
                  const active = theme === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setTheme(t.key)}
                      style={{
                        padding: "0.5rem 0.375rem",
                        borderRadius: "0.5rem",
                        border: active ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        background: active ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <div style={{
                        width: "1.5rem", height: "1.5rem",
                        borderRadius: "0.375rem",
                        background: t.color,
                        border: "1px solid rgba(255,255,255,0.15)",
                      }} />
                      <span style={{
                        fontSize: "0.65rem", fontWeight: 600,
                        color: active ? "#f59e0b" : "#9ca3af",
                        textTransform: "capitalize",
                      }}>
                        {t.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{
                display: "block",
                fontSize: "0.75rem", fontWeight: 600,
                color: "#d1d5db",
                marginBottom: "0.5rem",
              }}>
                Font Size
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.375rem" }}>
                {["sm", "md", "lg", "xl"].map(s => {
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        border: active ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        background: active ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.02)",
                        color: active ? "#f59e0b" : "#9ca3af",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* URL Copy */}
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.08), transparent)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "0.875rem",
            padding: "1.125rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.625rem" }}>
              <Copy style={{ width: "0.875rem", height: "0.875rem", color: "#f59e0b" }} />
              <label style={{
                fontSize: "0.7rem", fontWeight: 700,
                color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                OBS Browser Source URL
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <code style={{
                flex: 1,
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                color: "#fbbf24",
                fontSize: "0.7rem",
                fontFamily: "monospace",
                overflow: "auto",
                whiteSpace: "nowrap",
              }}>
                {url}
              </code>
              <button
                onClick={copy}
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  background: copied ? "#4ade80" : "#f59e0b",
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                {copied
                  ? <Check style={{ width: "1rem", height: "1rem" }} />
                  : <Copy style={{ width: "1rem", height: "1rem" }} />
                }
              </button>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <Info style={{ width: "0.7rem", height: "0.7rem" }} />
              Recommended size: 400x300px
            </p>
          </div>
        </div>

        {/* ── RIGHT: Preview ──────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.875rem",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "0.875rem 1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Monitor style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                  Live Preview
                </span>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                fontSize: "0.65rem", fontWeight: 700,
                background: "rgba(74,222,128,0.15)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.25)",
                padding: "0.15rem 0.625rem",
                borderRadius: "9999px",
              }}>
                <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
                LIVE
              </span>
            </div>
            <div style={{ padding: "0.75rem", background: "#000" }}>
              <iframe
                src={url}
                style={{
                  width: "100%", height: "22rem",
                  border: 0,
                  borderRadius: "0.5rem",
                  background: "transparent",
                }}
                title="Timer Preview"
              />
            </div>
            <div style={{
              padding: "0.75rem 1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: "0.5rem",
            }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  padding: "0.625rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.8rem", fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
                Open Full Screen
              </a>
            </div>
          </div>

          {/* OBS Setup Guide */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "0.875rem",
            padding: "1.25rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
              <Info style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                OBS Setup
              </h3>
            </div>

            <ol style={{
              listStyle: "none",
              padding: 0, margin: 0,
              display: "flex", flexDirection: "column", gap: "0.5rem",
            }}>
              {[
                "Open OBS Studio",
                "Add Source → Browser Source",
                "Paste URL above",
                "Set Width: 400, Height: 300",
                "Click OK — timer appears live",
              ].map((step, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.8rem", color: "#d1d5db" }}>
                  <span style={{
                    width: "1.25rem", height: "1.25rem",
                    borderRadius: "50%",
                    background: "rgba(96,165,250,0.15)",
                    color: "#60a5fa",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 800,
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) {
          .timer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}