"use client";

import { useState } from "react";
import Link from "next/link";

interface Overlay {
  slug: string;
  name: string;
  description: string;
  dimensions: string;
  fps: number;
}

const OVERLAYS: Overlay[] = [
  { slug: "match",          name: "Live Scoreboard",  description: "Live match scores and team logos",   dimensions: "1920x120",  fps: 30 },
  { slug: "next-match",     name: "Next Match",       description: "Upcoming match teams and countdown", dimensions: "800x200",   fps: 30 },
  { slug: "top-fragger",    name: "Top Fragger",      description: "Current top performer stats",        dimensions: "400x200",   fps: 30 },
  { slug: "chicken-dinner", name: "Chicken Dinner",   description: "Winner celebration full screen",     dimensions: "1920x1080", fps: 30 },
  { slug: "final-results",  name: "Final Results",    description: "Match final results full screen",    dimensions: "1920x1080", fps: 30 },
];

interface Props {
  tournamentId:   string;
  tournamentName: string;
  overlayToken:   string;
}

export default function OverlaysClient({ tournamentId, tournamentName, overlayToken }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [tokenVisible, setTokenVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [currentToken, setCurrentToken] = useState(overlayToken);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const buildUrl = (slug: string) => `${origin}/overlay/${currentToken}/${slug}`;

  const copy = async (slug: string) => {
    const url = buildUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(slug);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const regenerateToken = async () => {
    const confirmed = window.confirm(
      "Regenerating the overlay token will invalidate ALL existing overlay URLs. Are you sure?"
    );
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerateOverlayToken: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.overlayToken) {
          setCurrentToken(data.overlayToken);
        } else {
          window.location.reload();
        }
      } else {
        alert("Failed to regenerate token. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRegenerating(false);
    }
  };

  const maskedToken = currentToken.length > 8
    ? `${currentToken.slice(0, 4)}${"*".repeat(currentToken.length - 8)}${currentToken.slice(-4)}`
    : "*".repeat(currentToken.length);

  return (
    <div>
      {/* HOW TO USE */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--gold)",
        padding: "16px 20px",
        marginBottom: "24px",
      }}>
        <div className="section-label" style={{ marginBottom: "6px" }}>How To Use</div>
        <p style={{ color: "var(--white-70)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "8px" }}>
          In OBS Studio, add a <strong>Browser Source</strong> and paste one of the URLs below.
          Set the source width and height to match the recommended dimensions. Overlays update in real time.
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "12px",
        marginBottom: "24px",
      }}>
        <StatCard label="Available Overlays" value={String(OVERLAYS.length)} />
        <StatCard label="Tournament" value={tournamentName} truncate />
        <StatCard label="Overlay Token" value={tokenVisible ? currentToken : maskedToken} mono truncate />
      </div>

      {/* OVERLAY GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {OVERLAYS.map((ov) => {
          const isCopied = copied === ov.slug;
          const url = buildUrl(ov.slug);
          return (
            <div key={ov.slug} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  flexShrink: 0,
                }} />
                <p style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  color: "var(--white)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: 0,
                }}>{ov.name}</p>
              </div>

              <p style={{
                fontSize: "0.78rem",
                color: "var(--white-40)",
                marginBottom: "12px",
                lineHeight: 1.5,
              }}>{ov.description}</p>

              <div style={{
                display: "flex",
                gap: "10px",
                marginBottom: "12px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "0.7rem",
                color: "var(--white-40)",
              }}>
                <span>{ov.dimensions}</span>
                <span>-</span>
                <span>{ov.fps}fps</span>
              </div>

              {/* URL box */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--black)",
                border: "1px solid var(--border)",
                padding: "8px 10px",
                marginBottom: "8px",
              }}>
                <code style={{
                  flex: 1,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.7rem",
                  color: "var(--white-70)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>{url}</code>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => copy(ov.slug)}
                  className="btn-secondary"
                  style={{
                    fontSize: "0.72rem",
                    padding: "6px 12px",
                    flex: 1,
                    color: isCopied ? "var(--green)" : "var(--white)",
                    borderColor: isCopied ? "var(--green)" : "var(--border-2)",
                  }}
                >
                  {isCopied ? "Copied" : "Copy URL"}
                </button>
                <Link
                  href={`/overlay/${currentToken}/${ov.slug}`}
                  target="_blank"
                  className="btn-secondary"
                  style={{ fontSize: "0.72rem", padding: "6px 12px" }}
                >
                  Preview
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOKEN MANAGEMENT */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--red)",
        padding: "20px",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}>
          <div>
            <div style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              color: "var(--red)",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}>Danger Zone</div>
            <p style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 800,
              fontSize: "1rem",
              color: "var(--white)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "4px",
            }}>Overlay Token</p>
            <p style={{ fontSize: "0.78rem", color: "var(--white-40)", lineHeight: 1.6 }}>
              Regenerating will invalidate ALL existing overlay URLs. You will need to update OBS with the new URLs.
            </p>
          </div>

          <button
            onClick={regenerateToken}
            disabled={regenerating}
            className="btn-danger"
            style={{ opacity: regenerating ? 0.5 : 1 }}
          >
            {regenerating ? "Regenerating..." : "Regenerate Token"}
          </button>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "var(--black)",
          border: "1px solid var(--border)",
          padding: "10px 14px",
        }}>
          <code style={{
            flex: 1,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.78rem",
            color: "var(--white-70)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {tokenVisible ? currentToken : maskedToken}
          </code>
          <button
            onClick={() => setTokenVisible((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: "var(--white-40)",
              cursor: "pointer",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {tokenVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  mono,
  truncate,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      padding: "14px 16px",
    }}>
      <div style={{
        fontFamily: "Barlow Condensed, sans-serif",
        fontWeight: 700,
        fontSize: "0.65rem",
        letterSpacing: "0.15em",
        color: "var(--white-40)",
        textTransform: "uppercase",
        marginBottom: "6px",
      }}>{label}</div>
      <div style={{
        fontFamily: mono ? "JetBrains Mono, monospace" : "Barlow Condensed, sans-serif",
        fontWeight: mono ? 500 : 800,
        fontSize: mono ? "0.82rem" : "1rem",
        color: "var(--white)",
        textTransform: mono ? "none" : "uppercase",
        letterSpacing: mono ? "0" : "0.04em",
        overflow: truncate ? "hidden" : "visible",
        textOverflow: truncate ? "ellipsis" : "clip",
        whiteSpace: truncate ? "nowrap" : "normal",
      }}>{value}</div>
    </div>
  );
}