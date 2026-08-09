"use client";
import SponsorTicker from "@/components/tournament/SponsorTicker";
import { useEffect, useState, use } from "react";

interface Standing {
  teamId: string;
  teamName: string;
  teamTag: string | null;
  teamLogo: string | null;
  totalPoints: number;
  totalKills: number;
  wwcdCount: number;
  rank: number;
}

interface Branding {
  primaryColor?: string;
  organizerName?: string;
  logoUrl?: string;
}

interface Organizer {
  displayName?: string;
  username?: string;
  avatar?: string;
}

interface OverlayData {
  tournament: { id: string; name: string; status: string } | null;
  standings: Standing[];
  organizer: Organizer | null;
  branding: Branding | null;
}

export default function MatchOverlay({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<OverlayData | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setData(json);
      } catch {}
    }
    load();
    const interval = setInterval(() => {
      load();
      setTick((t) => t + 1);
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const primaryColor = data?.branding?.primaryColor || "#f59e0b";
  const organizerName =
    data?.branding?.organizerName ||
    data?.organizer?.displayName ||
    data?.organizer?.username ||
    "TournaOps";
  const tournamentName = data?.tournament?.name || "";
  const standings = data?.standings || [];

  const rankColors: Record<number, string> = { 1: "#f59e0b", 2: "#94a3b8", 3: "#f97316" };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes slideIn {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          width: "1920px",
          height: "1080px",
          position: "relative",
          overflow: "hidden",
          background: "transparent",
          fontFamily: "Rajdhani, sans-serif",
        }}
      >
        {/* Live standings panel — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50px",
            width: "520px",
            background: "linear-gradient(135deg, rgba(0,0,0,0.96), rgba(10,10,20,0.92))",
            borderRadius: "16px",
            border: `2px solid ${primaryColor}`,
            overflow: "hidden",
            boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${primaryColor}20`,
            backdropFilter: "blur(20px)",
            animation: "slideIn 0.5s ease forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}dd)`,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ color: "#000", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {tournamentName || "LIVE STANDINGS"}
              </div>
              {organizerName && (
                <div style={{ color: "rgba(0,0,0,0.6)", fontSize: "10px", fontWeight: 700, marginTop: "2px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  by {organizerName}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.15)", padding: "4px 10px", borderRadius: "999px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "block", animation: "pulse 1.5s infinite" }} />
              <span style={{ color: "#000", fontSize: "11px", fontWeight: 900, letterSpacing: "0.1em" }}>LIVE</span>
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 44px 36px 52px", gap: "8px", padding: "6px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>#</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>TEAM</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textAlign: "center" }}>K</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textAlign: "center" }}>W</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textAlign: "right" }}>PTS</div>
          </div>

          {/* Standings rows */}
          <div style={{ padding: "4px 0" }}>
            {!data && (
              <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
                LOADING...
              </div>
            )}
            {data && standings.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
                NO DATA YET
              </div>
            )}
            {standings.slice(0, 12).map((team, i) => {
              const rank = team.rank || i + 1;
              const isFirst = rank === 1;
              const isTop3 = rank <= 3;
              const rankColor = rankColors[rank] || "rgba(255,255,255,0.4)";
              return (
                <div
                  key={team.teamId}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr 44px 36px 52px",
                    gap: "8px",
                    padding: "7px 18px",
                    background: isFirst
                      ? `linear-gradient(90deg, ${primaryColor}18, transparent)`
                      : isTop3
                      ? `linear-gradient(90deg, ${rankColor}08, transparent)`
                      : i % 2 === 0
                      ? "rgba(255,255,255,0.02)"
                      : "transparent",
                    borderLeft: isFirst ? `3px solid ${primaryColor}` : "3px solid transparent",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: 900, color: rankColor, lineHeight: 1 }}>{rank}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    {team.teamLogo && (
                      <img src={team.teamLogo} alt="" style={{ width: "20px", height: "20px", borderRadius: "3px", objectFit: "cover", flexShrink: 0 }} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: isTop3 ? 700 : 600, color: isFirst ? "#fff" : "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1 }}>
                        {team.teamTag ? `[${team.teamTag}] ` : ""}{team.teamName}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f87171", textAlign: "center", lineHeight: 1 }}>{team.totalKills}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: team.wwcdCount > 0 ? primaryColor : "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1 }}>{team.wwcdCount}</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, color: isFirst ? primaryColor : "#fff", textAlign: "right", lineHeight: 1 }}>{team.totalPoints}</div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "6px 18px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em" }}>K=KILLS · W=WWCD · PTS=POINTS</div>
            <div style={{ color: primaryColor, fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em" }}>TOURNAOPS.COM</div>
          </div>
        </div>
      
        {branding?.sponsors && branding.sponsors.length > 0 && (
          <SponsorTicker sponsors={branding.sponsors} primaryColor={primaryColor} variant="rotate" position="bottom" />
        )}
      </div>
    </>
  );
}
