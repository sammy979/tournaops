"use client";
import { useEffect, useState, use } from "react";

export default function OverlayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetcher = () =>
      fetch(`/api/overlay/${token}`)
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => {});
    fetcher();
    const i = setInterval(fetcher, 5000);
    return () => clearInterval(i);
  }, [token]);

  if (!data) return <div style={{ width: "1920px", height: "1080px", background: "transparent" }} />;

  const { tournament, standings = [] } = data;
  const branding = tournament?.brandingData || {};
  const primaryColor = branding.primaryColor || "#f59e0b";
  const orgName = branding.orgName || "";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700;900&display=swap"
        rel="stylesheet"
      />

      <div style={{
        width: "1920px",
        height: "1080px",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "Rajdhani, sans-serif",
        background: "transparent",
      }}>

        {/* Live Standings Panel (Bottom Left) */}
        <div style={{
          position: "absolute",
          bottom: "50px",
          left: "50px",
          width: "540px",
          background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,20,30,0.9))",
          borderRadius: "1.25rem",
          border: `2px solid ${primaryColor}`,
          overflow: "hidden",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${primaryColor}30`,
          backdropFilter: "blur(20px)",
        }}>

          {/* Header */}
          <div style={{
            background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "2px solid rgba(0,0,0,0.2)",
          }}>
            <div>
              <div style={{ color: "#000", fontSize: "1.375rem", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {tournament?.name || "TOURNAMENT"}
              </div>
              {orgName && (
                <div style={{ color: "rgba(0,0,0,0.7)", fontSize: "0.65rem", fontWeight: 600, marginTop: "0.125rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  by {orgName}
                </div>
              )}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.375rem",
              background: "rgba(0,0,0,0.15)",
              padding: "0.3rem 0.625rem",
              borderRadius: "9999px",
            }}>
              <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite" }} />
              <span style={{ color: "#000", fontSize: "0.7rem", fontWeight: 900, letterSpacing: "0.1em" }}>LIVE</span>
            </div>
          </div>

          {/* Standings List */}
          <div style={{ padding: "0.5rem 0" }}>
            {standings.slice(0, 10).map((s: any, i: number) => {
              const rank = s.rank || i + 1;
              const isTop3 = rank <= 3;
              const isFirst = rank === 1;
              const rankColors: Record<number, string> = {
                1: "#facc15",
                2: "#d1d5db",
                3: "#f97316",
              };
              const rankColor = rankColors[rank] || "#6b7280";

              return (
                <div
                  key={s.teamId || i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 1.25rem",
                    background: isFirst
                      ? `linear-gradient(90deg, ${primaryColor}20, transparent)`
                      : isTop3
                      ? `linear-gradient(90deg, ${rankColor}10, transparent)`
                      : i % 2 === 0
                      ? "rgba(255,255,255,0.02)"
                      : "transparent",
                    borderLeft: isFirst ? `3px solid ${primaryColor}` : "3px solid transparent",
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: "2.5rem",
                    textAlign: "center",
                    fontSize: "1.375rem",
                    fontWeight: 900,
                    color: rankColor,
                    fontFamily: "Rajdhani, sans-serif",
                    lineHeight: 1,
                    textShadow: isTop3 ? `0 0 12px ${rankColor}80` : "none",
                  }}>
                    {rank}
                  </div>

                  {/* Team Info */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {s.teamLogo && (
                      <img
                        src={s.teamLogo}
                        alt=""
                        style={{
                          width: "1.75rem",
                          height: "1.75rem",
                          borderRadius: "0.375rem",
                          objectFit: "cover",
                          border: `1px solid ${primaryColor}40`,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        color: "#fff",
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        lineHeight: 1.1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {s.teamName}
                      </div>
                      {s.teamTag && (
                        <div style={{
                          color: primaryColor,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          marginTop: "0.125rem",
                          lineHeight: 1,
                        }}>
                          [{s.teamTag}]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kills */}
                  <div style={{ textAlign: "center", minWidth: "2.5rem" }}>
                    <div style={{ color: "#f87171", fontWeight: 800, fontSize: "0.95rem", lineHeight: 1 }}>
                      {s.totalKills || 0}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.55rem", fontWeight: 700, marginTop: "0.125rem", letterSpacing: "0.05em" }}>
                      K
                    </div>
                  </div>

                  {/* WWCD */}
                  <div style={{ textAlign: "center", minWidth: "2rem" }}>
                    <div style={{
                      color: s.wwcdCount > 0 ? primaryColor : "#6b7280",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      lineHeight: 1,
                    }}>
                      {s.wwcdCount || 0}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "0.55rem", fontWeight: 700, marginTop: "0.125rem", letterSpacing: "0.05em" }}>
                      W
                    </div>
                  </div>

                  {/* Total Points */}
                  <div style={{
                    minWidth: "3rem",
                    textAlign: "right",
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    color: isFirst ? primaryColor : "#fff",
                    fontFamily: "Rajdhani, sans-serif",
                    lineHeight: 1,
                    textShadow: isFirst ? `0 0 15px ${primaryColor}80` : "none",
                  }}>
                    {s.totalPoints || 0}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "0.5rem 1.25rem",
            background: "rgba(0,0,0,0.4)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ color: "#6b7280", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              PMGC SCORING
            </div>
            <div style={{ color: primaryColor, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              TOURNAOPS.COM
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    </>
  );
}