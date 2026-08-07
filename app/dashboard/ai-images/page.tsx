"use client";
import { useState } from "react";
import {
  Sparkles, Download, Loader2, Wand2, Image as ImageIcon,
  Copy, Check, Zap, Palette
} from "lucide-react";

const STYLES = [
  { key: "esports poster", label: "Esports Poster", desc: "Dramatic tournament poster" },
  { key: "cinematic banner", label: "Cinematic Banner", desc: "Movie-style banner" },
  { key: "team logo", label: "Team Logo", desc: "Professional esports logo" },
  { key: "social media post", label: "Social Media", desc: "Instagram/Twitter ready" },
  { key: "gaming wallpaper", label: "Wallpaper", desc: "Desktop background" },
  { key: "podium victory", label: "Victory Podium", desc: "Winner celebration" },
];

const ASPECT_RATIOS = [
  { key: "1:1", label: "Square", desc: "Instagram" },
  { key: "16:9", label: "Landscape", desc: "YouTube" },
  { key: "9:16", label: "Portrait", desc: "Stories" },
];

const PROMPT_TEMPLATES = [
  "PUBG Mobile champion holding golden trophy, dramatic sunset, epic pose",
  "Squad of 4 players in tactical gear, ready for battle, muzzle flashes",
  "Massive tournament stage with crowd, spotlights, LED screens showing gameplay",
  "Chicken dinner celebration, confetti explosion, winning team cheering",
  "Sniper rifle silhouette on Erangel map, sunset background, dramatic",
  "Trophy on pedestal, spotlights, tournament logo, professional",
  "Team standing on podium with medals, crowd applauding, victory moment",
  "Gaming setup with RGB, PUBG on screen, professional streamer",
];

export default function AIImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("esports poster");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), style, aspectRatio }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        const item = { ...data, userPrompt: prompt, style, aspectRatio, timestamp: new Date().toISOString() };
        setGenerated(item);
        setHistory([item, ...history.slice(0, 9)]);
      } else {
        alert(data.error || "Failed to generate");
      }
    } catch {
      alert("Error generating image");
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `tournaops-ai-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      window.open(url, "_blank");
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          background: "rgba(168,85,247,0.15)",
          color: "#c084fc",
          padding: "0.3rem 0.875rem",
          borderRadius: "9999px",
          fontSize: "0.7rem", fontWeight: 700,
          marginBottom: "0.875rem",
          border: "1px solid rgba(168,85,247,0.25)",
        }}>
          <Sparkles style={{ width: "0.75rem", height: "0.75rem" }} />
          AI IMAGE GENERATOR
        </span>
        <h1 style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          fontWeight: 800, color: "#fff",
          display: "flex", alignItems: "center", gap: "0.75rem",
          marginBottom: "0.375rem",
        }}>
          <Wand2 style={{ width: "2rem", height: "2rem", color: "#c084fc" }} />
          AI Poster & Banner Studio
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
          Generate professional esports posters, banners, and social media graphics — powered by AI
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 340px) 1fr",
        gap: "1.25rem",
      }} className="ai-images-grid">

        {/* ── LEFT: Controls ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Prompt Card */}
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
              marginBottom: "0.5rem",
            }}>
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your image... e.g. Champion team holding trophy at sunset"
              rows={4}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "0.5rem",
                padding: "0.625rem",
                color: "#fff",
                fontSize: "0.8rem",
                outline: "none",
                resize: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            <div style={{ marginTop: "0.875rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#6b7280", fontWeight: 600, marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quick Prompts
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "10rem", overflowY: "auto" }} className="scrollbar-hide">
                {PROMPT_TEMPLATES.map(template => (
                  <button
                    key={template}
                    onClick={() => setPrompt(template)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      color: "#9ca3af",
                      fontSize: "0.7rem",
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(168,85,247,0.08)";
                      e.currentTarget.style.color = "#c084fc";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9ca3af";
                    }}
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Style Card */}
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
              marginBottom: "0.625rem",
            }}>
              Style
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {STYLES.map(s => {
                const active = style === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setStyle(s.key)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.5rem",
                      border: active ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      background: active ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: active ? "#c084fc" : "#fff" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "0.125rem" }}>
                      {s.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Card */}
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
              marginBottom: "0.625rem",
            }}>
              Format
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.375rem" }}>
              {ASPECT_RATIOS.map(r => {
                const active = aspectRatio === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => setAspectRatio(r.key)}
                    style={{
                      padding: "0.5rem 0.375rem",
                      borderRadius: "0.5rem",
                      border: active ? "1px solid rgba(168,85,247,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      background: active ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: active ? "#c084fc" : "#fff" }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "#6b7280", marginTop: "0.125rem" }}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            style={{
              width: "100%",
              padding: "1rem",
              background: loading || !prompt.trim() ? "rgba(168,85,247,0.4)" : "linear-gradient(to right, #a855f7, #ec4899)",
              color: "#fff",
              border: "none",
              borderRadius: "0.875rem",
              fontSize: "0.95rem", fontWeight: 800,
              cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 8px 25px rgba(168,85,247,0.4)",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: "1.125rem", height: "1.125rem", animation: "spin 0.8s linear infinite" }} />
                Generating...
              </>
            ) : (
              <>
                <Wand2 style={{ width: "1.125rem", height: "1.125rem" }} />
                Generate Image
              </>
            )}
          </button>

          <p style={{
            fontSize: "0.7rem", textAlign: "center", color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
          }}>
            <Zap style={{ width: "0.75rem", height: "0.75rem", color: "#fbbf24" }} />
            Powered by Flux AI • 100% Free
          </p>
        </div>

        {/* ── RIGHT: Preview + History ──────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Current Result */}
          {generated ? (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(168,85,247,0.2)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "0.875rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "0.5rem",
              }}>
                <h2 style={{
                  fontSize: "0.9rem", fontWeight: 700, color: "#fff",
                  display: "flex", alignItems: "center", gap: "0.5rem",
                }}>
                  <ImageIcon style={{ width: "1rem", height: "1rem", color: "#c084fc" }} />
                  Generated Image
                </h2>
                <div style={{ display: "flex", gap: "0.375rem" }}>
                  <button
                    onClick={() => copyUrl(generated.imageUrl)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.4rem 0.75rem",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                      borderRadius: "0.5rem",
                      fontSize: "0.7rem", fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {copied
                      ? <><Check style={{ width: "0.75rem", height: "0.75rem" }} />Copied</>
                      : <><Copy style={{ width: "0.75rem", height: "0.75rem" }} />Copy URL</>
                    }
                  </button>
                  <button
                    onClick={() => downloadImage(generated.imageUrl)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.25rem",
                      padding: "0.4rem 0.75rem",
                      background: "#c084fc",
                      color: "#000",
                      border: "none",
                      borderRadius: "0.5rem",
                      fontSize: "0.7rem", fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    <Download style={{ width: "0.75rem", height: "0.75rem" }} />
                    Download
                  </button>
                </div>
              </div>
              <div style={{ padding: "1rem", background: "#000" }}>
                <img
                  src={generated.imageUrl}
                  alt="Generated"
                  style={{ width: "100%", height: "auto", borderRadius: "0.5rem", display: "block" }}
                  loading="lazy"
                />
              </div>
              <div style={{
                padding: "0.875rem 1.25rem",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: "0.7rem", color: "#6b7280",
              }}>
                <div style={{ marginBottom: "0.25rem" }}>
                  <strong style={{ color: "#9ca3af" }}>Prompt:</strong> {generated.userPrompt}
                </div>
                <div>
                  <strong style={{ color: "#9ca3af" }}>Style:</strong> {generated.style} • <strong style={{ color: "#9ca3af" }}>Size:</strong> {generated.width}x{generated.height}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "4rem 2rem",
              textAlign: "center",
            }}>
              <ImageIcon style={{ width: "3rem", height: "3rem", color: "#374151", margin: "0 auto 1rem" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
                No Image Yet
              </h3>
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                Enter a prompt and click Generate to create your first AI image
              </p>
            </div>
          )}

          {/* History */}
          {history.length > 1 && (
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              padding: "1rem",
            }}>
              <h3 style={{
                fontSize: "0.75rem", fontWeight: 700,
                color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
                marginBottom: "0.625rem",
              }}>
                Recent Generations
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                gap: "0.375rem",
              }}>
                {history.slice(1).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setGenerated(item)}
                    style={{
                      aspectRatio: "1",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#c084fc"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  >
                    <img
                      src={item.imageUrl}
                      alt={`History ${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.05))",
            border: "1px solid rgba(168,85,247,0.2)",
            borderRadius: "1rem",
            padding: "1.25rem",
          }}>
            <h3 style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              fontSize: "0.9rem", fontWeight: 700, color: "#fff",
              marginBottom: "0.75rem",
            }}>
              <Sparkles style={{ width: "1rem", height: "1rem", color: "#c084fc" }} />
              Pro Tips for Better Images
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0, margin: 0,
              display: "flex", flexDirection: "column", gap: "0.5rem",
              fontSize: "0.8rem", color: "#d1d5db",
            }}>
              {[
                "Be specific about colors, lighting, mood, and setting",
                "Include tournament theme keywords: PUBG, esports, championship",
                "Add emotions: victorious, intense, dramatic, celebrating",
                "Reference styles: cyberpunk, cinematic, neon, minimalist",
                "For posters mention: professional tournament poster, 4k, sharp text",
              ].map((tip, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "#c084fc", fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          .ai-images-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}