"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getTournamentById, getLeaderboard } from "@/lib/storage/tournaments";
import { Tournament } from "@/types/tournament";

function OverlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [tick, setTick] = useState(0);

  const rows = parseInt(searchParams?.get("rows") || "10");
  const theme = searchParams?.get("theme") || "midnight";
  const fontSize = searchParams?.get("size") || "md";
  const showLogos = searchParams?.get("logos") !== "false";
  const showKills = searchParams?.get("kills") !== "false";
  const showWWCD = searchParams?.get("wwcd") !== "false";
  const compact = searchParams?.get("compact") === "true";

  const load = useCallback(async () => {
    const token = params?.token as string;
    if (!token) return;
    const t = await getTournamentById(token);
    if (t) setTournament(t);
    setTick(t => t + 1);
  }, [params?.token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!tournament) {
    return (
      <div style={{ background: "transparent", padding: 16, fontFamily: "Inter, sans-serif" }}>
        <div style={{ color: "#60a5fa", fontSize: 14, opacity: 0.7 }}>
          🎮 TournaOps · Loading tournament...
        </div>
      </div>
    );
  }

  const leaderboard = getLeaderboard(tournament).slice(0, rows);
  const teamMap = Object.fromEntries(tournament.teams.map(t => [t.id, t]));

  const fontSizes: Record<string, { name: string; row: string; num: string }> = {
    sm: { name: "12px", row: "11px", num: "13px" },
    md: { name: "14px", row: "13px", num: "16px" },
    lg: { name: "17px", row: "15px", num: "19px" },
    xl: { name: "21px", row: "18px", num: "24px" },
  };

  const themes: Record<string, any> = {
    midnight: {
      bg: "linear-gradient(135deg, rgba(10,10,25,0.95) 0%, rgba(15,15,35,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))",
      border: "rgba(96,165,250,0.25)",
      text: "#ffffff",
      sub: "#94a3b8",
      accent: "#60a5fa",
      accentGlow: "rgba(96,165,250,0.4)",
      shadow: "0 20px 60px -10px rgba(59,130,246,0.4), 0 10px 30px -10px rgba(139,92,246,0.3)",
    },
    inferno: {
      bg: "linear-gradient(135deg, rgba(20,5,0,0.95) 0%, rgba(35,10,5,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(249,115,22,0.15), rgba(239,68,68,0.15))",
      border: "rgba(249,115,22,0.3)",
      text: "#ffffff",
      sub: "#fbbf24",
      accent: "#fb923c",
      accentGlow: "rgba(251,146,60,0.4)",
      shadow: "0 20px 60px -10px rgba(249,115,22,0.4), 0 10px 30px -10px rgba(239,68,68,0.3)",
    },
    toxic: {
      bg: "linear-gradient(135deg, rgba(0,15,5,0.95) 0%, rgba(5,25,15,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(34,197,94,0.15), rgba(16,185,129,0.15))",
      border: "rgba(34,197,94,0.3)",
      text: "#ffffff",
      sub: "#86efac",
      accent: "#4ade80",
      accentGlow: "rgba(74,222,128,0.4)",
      shadow: "0 20px 60px -10px rgba(34,197,94,0.4)",
    },
    royal: {
      bg: "linear-gradient(135deg, rgba(20,5,30,0.95) 0%, rgba(30,10,50,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(168,85,247,0.15), rgba(236,72,153,0.15))",
      border: "rgba(168,85,247,0.3)",
      text: "#ffffff",
      sub: "#e9d5ff",
      accent: "#c084fc",
      accentGlow: "rgba(192,132,252,0.4)",
      shadow: "0 20px 60px -10px rgba(168,85,247,0.4), 0 10px 30px -10px rgba(236,72,153,0.3)",
    },
    arctic: {
      bg: "linear-gradient(135deg, rgba(5,15,25,0.95) 0%, rgba(10,25,40,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(34,211,238,0.15), rgba(14,165,233,0.15))",
      border: "rgba(34,211,238,0.3)",
      text: "#ffffff",
      sub: "#7dd3fc",
      accent: "#22d3ee",
      accentGlow: "rgba(34,211,238,0.4)",
      shadow: "0 20px 60px -10px rgba(34,211,238,0.4)",
    },
    gold: {
      bg: "linear-gradient(135deg, rgba(30,15,0,0.95) 0%, rgba(45,25,5,0.95) 100%)",
      headerBg: "linear-gradient(90deg, rgba(234,179,8,0.2), rgba(202,138,4,0.15))",
      border: "rgba(234,179,8,0.4)",
      text: "#fef3c7",
      sub: "#fde047",
      accent: "#facc15",
      accentGlow: "rgba(250,204,21,0.5)",
      shadow: "0 20px 60px -10px rgba(234,179,8,0.5)",
    },
    transparent: {
      bg: "rgba(0,0,0,0.4)",
      headerBg: "rgba(0,0,0,0.5)",
      border: "rgba(255,255,255,0.15)",
      text: "#ffffff",
      sub: "#e5e7eb",
      accent: "#ffffff",
      accentGlow: "rgba(255,255,255,0.2)",
      shadow: "0 10px 30px rgba(0,0,0,0.5)",
    },
  };

  const t = themes[theme] || themes.midnight;
  const fs = fontSizes[fontSize] || fontSizes.md;
  const rankColors: Record<number, string> = { 1: "#facc15", 2: "#e5e7eb", 3: "#d97706" };
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div style={{
      background: "transparent",
      minHeight: "100vh",
      padding: 12,
      fontFamily: "Inter, -apple-system, sans-serif",
    }}>
      <div style={{
        background: t.bg,
        border: `1.5px solid ${t.border}`,
        borderRadius: 16,
        overflow: "hidden",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        minWidth: compact ? 280 : 380,
        maxWidth: compact ? 340 : 480,
        boxShadow: t.shadow,
      }}>
        {/* HEADER */}
        <div style={{
          background: t.headerBg,
          borderBottom: `1px solid ${t.border}`,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 12px rgba(34,197,94,0.8)",
              animation: "pulse 2s infinite",
            }} />
            <span style={{
              color: t.accent,
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 2,
              textTransform: "uppercase",
              textShadow: `0 0 8px ${t.accentGlow}`,
            }}>
              LIVE STANDINGS
            </span>
          </div>
          <span style={{
            color: t.sub,
            fontSize: 10,
            opacity: 0.7,
            fontFamily: "monospace",
          }}>
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* TOURNAMENT NAME */}
        <div style={{
          padding: "10px 16px",
          background: "rgba(0,0,0,0.2)",
          borderBottom: `1px solid ${t.border}`,
          textAlign: "center",
        }}>
          <div style={{
            color: t.text,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.5,
            textShadow: `0 2px 4px rgba(0,0,0,0.5)`,
          }}>
            {tournament.name}
          </div>
        </div>

        {/* COLUMN HEADERS */}
        <div style={{
          display: "grid",
          gridTemplateColumns: compact
            ? "36px 1fr 40px 50px"
            : (showLogos ? "36px 40px 1fr 45px 55px 55px" : "36px 1fr 45px 55px 55px"),
          gap: 8,
          padding: "8px 14px",
          borderBottom: `1px solid ${t.border}`,
          background: "rgba(0,0,0,0.25)",
        }}>
          <span style={{ color: t.sub, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>RANK</span>
          {showLogos && !compact && <span></span>}
          <span style={{ color: t.sub, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>SQUAD</span>
          {showKills && !compact && (
            <span style={{ color: t.sub, fontSize: 9, fontWeight: 700, letterSpacing: 1, textAlign: "center" }}>K</span>
          )}
          {showWWCD && !compact && (
            <span style={{ color: "#facc15", fontSize: 9, fontWeight: 700, letterSpacing: 1, textAlign: "center" }}>W</span>
          )}
          <span style={{ color: t.accent, fontSize: 9, fontWeight: 800, letterSpacing: 1, textAlign: "right", textShadow: `0 0 8px ${t.accentGlow}` }}>
            PTS
          </span>
        </div>

        {/* ROWS */}
        <div>
          {leaderboard.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: t.sub, fontSize: 12, opacity: 0.6 }}>
              Awaiting match results...
            </div>
          ) : (
            leaderboard.map((entry, idx) => {
              const team = teamMap[entry.teamId];
              const teamLogo = (team as any)?.logo;
              const isTop3 = entry.rank <= 3;
              const rankBg = entry.rank === 1
                ? "linear-gradient(90deg, rgba(250,204,21,0.15) 0%, transparent 100%)"
                : entry.rank === 2
                ? "linear-gradient(90deg, rgba(229,231,235,0.08) 0%, transparent 100%)"
                : entry.rank === 3
                ? "linear-gradient(90deg, rgba(217,119,6,0.08) 0%, transparent 100%)"
                : idx % 2 === 0
                ? "rgba(255,255,255,0.02)"
                : "transparent";

              return (
                <div key={entry.teamId} style={{
                  display: "grid",
                  gridTemplateColumns: compact
                    ? "36px 1fr 40px 50px"
                    : (showLogos ? "36px 40px 1fr 45px 55px 55px" : "36px 1fr 45px 55px 55px"),
                  gap: 8,
                  padding: "10px 14px",
                  borderBottom: `1px solid ${t.border}`,
                  background: rankBg,
                  alignItems: "center",
                  transition: "background 0.3s",
                }}>
                  {/* RANK */}
                  <div style={{
                    textAlign: "center",
                    fontSize: isTop3 ? 18 : parseInt(fs.num) - 2,
                    fontWeight: 900,
                    color: rankColors[entry.rank] || t.sub,
                    fontFamily: isTop3 ? "inherit" : "monospace",
                    textShadow: isTop3 ? `0 0 12px ${rankColors[entry.rank]}` : "none",
                  }}>
                    {medals[entry.rank] || `#${entry.rank}`}
                  </div>

                  {/* TEAM LOGO (if enabled) */}
                  {showLogos && !compact && (
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      overflow: "hidden",
                      background: teamLogo ? "transparent" : `linear-gradient(135deg, ${t.accent}20, ${t.accent}10)`,
                      border: `1px solid ${t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {teamLogo ? (
                        <img src={teamLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ color: t.text, fontSize: 14, fontWeight: 700 }}>
                          {entry.teamName.charAt(0)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* TEAM NAME */}
                  <div style={{
                    color: t.text,
                    fontSize: fs.name,
                    fontWeight: isTop3 ? 800 : 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    textShadow: isTop3 ? "0 1px 3px rgba(0,0,0,0.5)" : "none",
                  }}>
                    {entry.teamName}
                    {(team as any)?.tag && (
                      <span style={{
                        marginLeft: 6,
                        fontSize: 9,
                        opacity: 0.5,
                        fontFamily: "monospace",
                        fontWeight: 500,
                      }}>
                        [{(team as any).tag}]
                      </span>
                    )}
                  </div>

                  {/* KILLS */}
                  {showKills && !compact && (
                    <div style={{
                      textAlign: "center",
                      color: "#fb923c",
                      fontSize: fs.row,
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}>
                      {entry.totalKills || 0}
                    </div>
                  )}

                  {/* WWCD */}
                  {showWWCD && !compact && (
                    <div style={{
                      textAlign: "center",
                      color: entry.wwcds > 0 ? "#facc15" : t.sub,
                      fontSize: fs.row,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      opacity: entry.wwcds > 0 ? 1 : 0.3,
                    }}>
                      {entry.wwcds || 0}
                    </div>
                  )}

                  {/* TOTAL POINTS */}
                  <div style={{
                    textAlign: "right",
                    color: isTop3 ? rankColors[entry.rank] : t.text,
                    fontSize: fs.num,
                    fontFamily: "monospace",
                    fontWeight: 900,
                    textShadow: isTop3 ? `0 0 10px ${rankColors[entry.rank]}80` : "none",
                  }}>
                    {entry.totalPoints}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          padding: "8px 14px",
          background: "rgba(0,0,0,0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <span style={{ color: t.sub, fontSize: 9, opacity: 0.7, letterSpacing: 1 }}>
            {tournament.matches.filter(m => m.status === "completed").length} / {tournament.matches.length} MATCHES
          </span>
          <span style={{
            color: t.accent,
            fontSize: 9,
            opacity: 0.8,
            fontWeight: 700,
            letterSpacing: 1.5,
            textShadow: `0 0 6px ${t.accentGlow}`,
          }}>
            tournaops.com
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, color: "#94a3b8" }}>Loading...</div>}>
      <OverlayContent />
    </Suspense>
  );
}