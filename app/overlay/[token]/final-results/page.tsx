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
  sponsors?: Array<{ id: string; name: string; logo: string; tier: string; website?: string }>;
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

export default function FinalResultsOverlay({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<OverlayData | null>(null);

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
    const interval = setInterval(load, 5000);
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
  const organizerLogo = data?.branding?.logoUrl || data?.organizer?.avatar || null;
  const tournamentName = data?.tournament?.name || "";
  const standings = data?.standings || [];
  const top3 = standings.slice(0, 3);
  const rest = standings.slice(3, 10);

  const medalColors = ["#f59e0b", "#94a3b8", "#f97316"];
  const medalLabels = ["1ST", "2ND", "3RD"];
  const podiumHeights = ["280px", "220px", "180px"];
  const podiumOrder = [1, 0, 2];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes slideUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes podiumRise {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 1200px 700px at 50% 50%, ${primaryColor}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        {(organizerLogo || organizerName) && (
          <div style={{ position: "absolute", top: "48px", right: "60px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "999px", padding: "8px 20px" }}>
            {organizerLogo && <img src={organizerLogo} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />}
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.08em" }}>{organizerName}</span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: "36px", right: "60px", color: "rgba(255,255,255,0.18)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em" }}>TOURNAOPS.COM</div>

        <div style={{ textAlign: "center", marginBottom: "48px", animation: "slideUp 0.6s ease forwards" }}>
          <div style={{ fontSize: "14px", fontWeight: 900, letterSpacing: "0.45em", color: primaryColor, textTransform: "uppercase", marginBottom: "10px" }}>FINAL RESULTS</div>
          <div style={{ fontSize: "52px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1, textTransform: "uppercase" }}>{tournamentName || "TOURNAMENT"}</div>
        </div>

        {!data && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em" }}>LOADING...</div>
        )}

        {data && standings.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em" }}>AWAITING RESULTS</div>
        )}

        {data && standings.length > 0 && (
          <div style={{ display: "flex", gap: "60px", alignItems: "flex-end", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", flex: "0 0 auto" }}>
              {podiumOrder.map((idx) => {
                const team = top3[idx];
                if (!team) return <div key={idx} style={{ width: "280px" }} />;
                const color = medalColors[idx];
                const label = medalLabels[idx];
                const height = podiumHeights[idx];
                const isFirst = idx === 0;
                return (
                  <div key={team.teamId} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "280px", animation: `slideUp 0.7s ease ${0.1 * idx}s forwards`, opacity: 0 }}>
                    {team.teamLogo ? (
                      <div style={{ width: isFirst ? "100px" : "80px", height: isFirst ? "100px" : "80px", borderRadius: "50%", overflow: "hidden", border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}60`, marginBottom: "12px" }}>
                        <img src={team.teamLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ) : (
                      <div style={{ width: isFirst ? "100px" : "80px", height: isFirst ? "100px" : "80px", borderRadius: "50%", background: `${color}20`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isFirst ? "36px" : "28px", fontWeight: 900, color, marginBottom: "12px" }}>
                        {team.teamName.charAt(0)}
                      </div>
                    )}
                    {team.teamTag && (
                      <div style={{ fontSize: "14px", color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>[{team.teamTag}]</div>
                    )}
                    <div style={{ fontSize: isFirst ? "22px" : "18px", fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: "16px", lineHeight: 1.2 }}>{team.teamName}</div>
                    <div style={{ width: "100%", height, background: `linear-gradient(180deg, ${color}cc, ${color}88)`, borderRadius: "8px 8px 0 0", border: `2px solid ${color}`, boxShadow: `0 0 30px ${color}40`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", transformOrigin: "bottom", animation: `podiumRise 0.6s ease ${0.15 * idx}s forwards`, opacity: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: isFirst ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.7)", letterSpacing: "0.2em" }}>{label}</div>
                      <div style={{ fontSize: isFirst ? "48px" : "38px", fontWeight: 900, color: isFirst ? "#000" : "#fff", lineHeight: 1 }}>{team.totalPoints}</div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: isFirst ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)", letterSpacing: "0.15em" }}>PTS</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: isFirst ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)" }}>{team.totalKills}K</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {rest.length > 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", animation: "fadeIn 0.8s ease 0.5s forwards", opacity: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px", gap: "12px", padding: "0 16px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>#</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>TEAM</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textAlign: "center" }}>KILLS</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textAlign: "right" }}>PTS</div>
                </div>
                {rest.map((team, i) => (
                  <div key={team.teamId} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px 80px", gap: "12px", padding: "10px 16px", background: i % 2 === 0 ? "rgba(255,255,255,0.03)" : "transparent", borderRadius: "8px" }}>
                    <div style={{ fontSize: "22px", fontWeight: 900, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>{team.rank}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                      {team.teamLogo && <img src={team.teamLogo} alt="" style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />}
                      <div style={{ minWidth: 0 }}>
                        {team.teamTag && <div style={{ fontSize: "11px", color: primaryColor, fontWeight: 700, letterSpacing: "0.08em" }}>[{team.teamTag}]</div>}
                        <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.teamName}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: 700, color: "#f87171", textAlign: "center", lineHeight: 1, alignSelf: "center" }}>{team.totalKills}</div>
                    <div style={{ fontSize: "24px", fontWeight: 900, color: "#fff", textAlign: "right", lineHeight: 1, alignSelf: "center" }}>{team.totalPoints}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      
        {data?.branding?.sponsors && data?.branding?.sponsors.length > 0 && (
          <SponsorTicker sponsors={(data?.branding?.sponsors ?? []) as any} primaryColor={primaryColor} variant="rotate" position="bottom" />
        )}
      </div>
    </>
  );
}
