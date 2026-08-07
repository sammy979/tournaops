"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Copy, ExternalLink, Monitor, Check, Trophy, Loader2, Radio,
  Info, Zap, ChevronRight, Award, PlayCircle, Sparkles, ClipboardCopy
} from "lucide-react";

interface Tournament {
  id: string;
  slug: string;
  name: string;
  status: string;
  overlayToken?: string;
}

const OVERLAY_TYPES = [
  {
    key: "",
    label: "Live Standings",
    icon: Trophy,
    description: "Main leaderboard for streams",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  {
    key: "chicken-dinner",
    label: "Chicken Dinner",
    icon: Award,
    description: "WWCD winner announcement",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.1)",
    border: "rgba(251,191,36,0.25)",
  },
  {
    key: "top-fragger",
    label: "Top Fragger",
    icon: Radio,
    description: "MVP kill leader spotlight",
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
  {
    key: "next-match",
    label: "Next Match",
    icon: PlayCircle,
    description: "Upcoming match countdown",
    color: "#60a5fa",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.25)",
  },
  {
    key: "final-results",
    label: "Final Results",
    icon: Trophy,
    description: "Tournament winner celebration",
    color: "#c084fc",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
  },
  {
    key: "match",
    label: "Current Match",
    icon: Radio,
    description: "Live match statistics",
    color: "#4ade80",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.25)",
  },
];

export default function OverlaySetupPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [overlayType, setOverlayType] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((data) => {
        const list = data.tournaments || [];
        setTournaments(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.tournaops.com";
  const overlayPath = overlayType ? `/${overlayType}` : "";
  const overlayUrl = selected?.overlayToken
    ? `${baseUrl}/overlay/${selected.overlayToken}${overlayPath}`
    : "";

  const selectedType = OVERLAY_TYPES.find(t => t.key === overlayType) || OVERLAY_TYPES[0];

  async function copyUrl() {
    if (!overlayUrl) return;
    await navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 style={{ width: "2rem", height: "2rem", color: "#f59e0b", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Radio style={{ width: "1.25rem", height: "1.25rem", color: "#fff" }} />
          </div>
          Broadcast Overlays
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.375rem" }}>
          Professional overlays for OBS Studio and streaming platforms
        </p>
      </div>

      {tournaments.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.08)",
          borderRadius: "1.25rem",
          padding: "4rem 2rem",
          textAlign: "center",
        }}>
          <Trophy style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem" }}>No Tournaments Yet</h2>
          <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Create your first tournament to unlock broadcast overlays
          </p>
          <Link
            href="/dashboard/tournaments/create"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              background: "#f59e0b", color: "#000",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              fontWeight: 700, fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            <Sparkles style={{ width: "1rem", height: "1rem" }} />
            Create Tournament
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 340px) 1fr",
          gap: "1.5rem",
        }} className="overlay-grid">

          {/* ── LEFT: Configuration ─────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Tournament Selector */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
              padding: "1rem",
            }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                Tournament
              </label>
              <select
                value={selected?.id || ""}
                onChange={(e) => {
                  const t = tournaments.find((tm) => tm.id === e.target.value);
                  setSelected(t || null);
                }}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.625rem",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id} style={{ background: "#111116" }}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Overlay Type Selector */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.875rem",
              padding: "1rem",
            }}>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.75rem" }}>
                Overlay Type
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {OVERLAY_TYPES.map((type) => {
                  const Icon = type.icon;
                  const active = overlayType === type.key;
                  return (
                    <button
                      key={type.key}
                      onClick={() => setOverlayType(type.key)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.75rem",
                        borderRadius: "0.625rem",
                        border: active ? `1px solid ${type.border}` : "1px solid rgba(255,255,255,0.06)",
                        background: active ? type.bg : "rgba(255,255,255,0.02)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        }
                      }}
                    >
                      <div style={{
                        width: "1.75rem", height: "1.75rem",
                        borderRadius: "0.4rem",
                        background: active ? type.bg : "rgba(255,255,255,0.03)",
                        border: `1px solid ${active ? type.border : "rgba(255,255,255,0.06)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon style={{ width: "0.875rem", height: "0.875rem", color: active ? type.color : "#6b7280" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: active ? type.color : "#fff" }}>
                          {type.label}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.125rem" }}>
                          {type.description}
                        </div>
                      </div>
                      {active && (
                        <Check style={{ width: "0.875rem", height: "0.875rem", color: type.color, flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: URL + Preview ────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* URL Copy Card */}
            <div style={{
              background: `linear-gradient(135deg, ${selectedType.bg}, transparent)`,
              border: `1px solid ${selectedType.border}`,
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <ClipboardCopy style={{ width: "1rem", height: "1rem", color: selectedType.color }} />
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                    Overlay URL
                  </h2>
                </div>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  color: selectedType.color,
                  background: selectedType.bg,
                  border: `1px solid ${selectedType.border}`,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "9999px",
                }}>
                  {selectedType.label.toUpperCase()}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={overlayUrl}
                  readOnly
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  style={{
                    flex: 1, minWidth: "200px",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.5rem",
                    padding: "0.625rem 0.75rem",
                    color: "#e5e7eb",
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
                <button
                  onClick={copyUrl}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    background: copied ? "#4ade80" : selectedType.color,
                    color: "#000",
                    border: "none",
                    padding: "0.625rem 1rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem", fontWeight: 700,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  {copied ? <><Check style={{ width: "0.875rem", height: "0.875rem" }} />Copied!</> : <><Copy style={{ width: "0.875rem", height: "0.875rem" }} />Copy</>}
                </button>
                <a
                  href={overlayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.375rem",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "0.625rem 0.875rem",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem", fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink style={{ width: "0.875rem", height: "0.875rem" }} />
                  Open
                </a>
              </div>
            </div>

            {/* OBS Setup Guide */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
                <Info style={{ width: "1rem", height: "1rem", color: "#60a5fa" }} />
                <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                  OBS Studio Setup Guide
                </h3>
              </div>

              <ol style={{ display: "flex", flexDirection: "column", gap: "0.625rem", listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  { step: 1, text: "Open OBS Studio and select your scene" },
                  { step: 2, text: "Click + in Sources → select Browser Source" },
                  { step: 3, text: "Paste the URL above into the URL field" },
                  { step: 4, text: "Set Width: 1920, Height: 1080" },
                  { step: 5, text: "Check 'Refresh browser when scene becomes active'" },
                  { step: 6, text: "Click OK — overlay is now live in your stream" },
                ].map(item => (
                  <li key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                    <div style={{
                      width: "1.25rem", height: "1.25rem",
                      borderRadius: "50%",
                      background: "rgba(96,165,250,0.15)",
                      color: "#60a5fa",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 800,
                      flexShrink: 0,
                    }}>
                      {item.step}
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#d1d5db", lineHeight: 1.5 }}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Live Preview */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "0.875rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Monitor style={{ width: "1rem", height: "1rem", color: selectedType.color }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                    Live Preview
                  </span>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "0.375rem",
                  fontSize: "0.65rem", fontWeight: 700,
                  color: "#f87171",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  padding: "0.15rem 0.625rem",
                  borderRadius: "9999px",
                }}>
                  <span style={{ width: "0.375rem", height: "0.375rem", borderRadius: "50%", background: "#f87171", animation: "pulse 2s infinite" }} />
                  LIVE
                </span>
              </div>
              <div style={{
                background: "#000",
                aspectRatio: "16/9",
                position: "relative",
              }}>
                {overlayUrl ? (
                  <iframe
                    src={overlayUrl}
                    style={{ width: "100%", height: "100%", border: 0 }}
                    title="Overlay Preview"
                  />
                ) : (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#374151",
                    fontSize: "0.85rem",
                  }}>
                    Select a tournament to preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 900px) {
          .overlay-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}