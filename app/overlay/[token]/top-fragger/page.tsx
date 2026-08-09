"use client";
import SponsorTicker from "@/components/tournament/SponsorTicker";
import { useEffect, useState, use } from "react";

interface TopFragger {
  name: string;
  teamName: string;
  teamTag: string | null;
  teamLogo: string | null;
  kills: number;
  pubgId?: string;
  photo?: string;
}

interface Standing {
  teamId: string;
  teamName: string;
  teamTag: string | null;
  teamLogo: string | null;
  totalPoints: number;
  totalKills: number;
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
  topFraggers: TopFragger[];
  topFraggerTeam: Standing | null;
  organizer: Organizer | null;
  branding: Branding | null;
}

export default function TopFraggerOverlay({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<OverlayData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) {
          setData(json);
          setVisible(true);
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const primaryColor = data?.branding?.primaryColor || "#ef4444";
  const organizerName =
    data?.branding?.organizerName ||
    data?.organizer?.displayName ||
    data?.organizer?.username ||
    "TournaOps";
  const organizerLogo = data?.branding?.logoUrl || data?.organizer?.avatar || null;
  const tournamentName = data?.tournament?.name || "";

  const topFragger = data?.topFraggers?.[0] || null;
  const topFraggerTeam = data?.topFraggerTeam || null;

  const displayName = topFragger?.name || topFraggerTeam?.teamName || "TBA";
  const displayTeam = topFragger?.teamName || topFraggerTeam?.teamName || "";
  const displayTag = topFragger?.teamTag || topFraggerTeam?.teamTag || null;
  const displayKills = topFragger?.kills ?? topFraggerTeam?.totalKills ?? 0;
  const displayLogo = topFragger?.teamLogo || topFraggerTeam?.teamLogo || null;
  const displayPhoto = topFragger?.photo || null;
  const displayPoints = topFraggerTeam?.totalPoints ?? 0;

  const isPlayerMode = !!topFragger;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes slideIn {
          0% { transform: translateX(-40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          0% { transform: translateX(40px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 40px ${primaryColor}60, 0 0 80px ${primaryColor}30; }
          50% { box-shadow: 0 0 70px ${primaryColor}90, 0 0 140px ${primaryColor}50; }
        }
        @keyframes numberCount {
          0% { transform: scale(0.7); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background glow */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 1000px 700px at 50% 50%, ${primaryColor}12 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Organizer badge */}
        {(organizerLogo || organizerName) && (
          <div style={{ position: "absolute", top: "48px", right: "60px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "999px", padding: "8px 20px" }}>
            {organizerLogo && <img src={organizerLogo} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />}
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.08em" }}>{organizerName}</span>
          </div>
        )}

        {/* Tournament name */}
        {tournamentName && (
          <div style={{ position: "absolute", top: "54px", left: "60px", color: "rgba(255,255,255,0.4)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" }}>
            {tournamentName}
          </div>
        )}

        {/* Watermark */}
        <div style={{ position: "absolute", bottom: "40px", right: "60px", color: "rgba(255,255,255,0.18)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em" }}>TOURNAOPS.COM</div>

        {/* Loading */}
        {!data && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em" }}>LOADING...</div>
        )}

        {/* No data */}
        {data && !topFragger && !topFraggerTeam && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "24px", fontWeight: 700, letterSpacing: "0.2em" }}>NO MATCH DATA YET</div>
        )}

        {/* Main card */}
        {data && (topFragger || topFraggerTeam) && (
          <div
            style={{
              display: "flex",
              gap: "48px",
              alignItems: "center",
              background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(20,5,5,0.92))",
              borderRadius: "24px",
              border: `2px solid ${primaryColor}50`,
              padding: "48px 52px",
              animation: "glowPulse 3s ease-in-out infinite",
              maxWidth: "1100px",
              width: "100%",
            }}
          >
            {/* Left: Photo or logo */}
            <div style={{ flexShrink: 0, animation: visible ? "slideIn 0.7s ease forwards" : "none", opacity: 0 }}>
              {displayPhoto ? (
                <div style={{ width: "240px", height: "240px", borderRadius: "50%", overflow: "hidden", border: `4px solid ${primaryColor}`, boxShadow: `0 0 50px ${primaryColor}80` }}>
                  <img src={displayPhoto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : displayLogo ? (
                <div style={{ width: "200px", height: "200px", borderRadius: "20px", overflow: "hidden", border: `4px solid ${primaryColor}`, boxShadow: `0 0 50px ${primaryColor}80` }}>
                  <img src={displayLogo} alt={displayTeam} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "200px", height: "200px", borderRadius: "20px", background: `${primaryColor}20`, border: `4px solid ${primaryColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "72px", fontWeight: 900, color: primaryColor, boxShadow: `0 0 50px ${primaryColor}80` }}>
                  {displayName.charAt(0)}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div style={{ flex: 1, animation: visible ? "slideInRight 0.7s ease 0.1s forwards" : "none", opacity: 0 }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `linear-gradient(135deg, ${primaryColor}, #dc2626)`, color: "#fff", padding: "6px 20px", borderRadius: "999px", fontSize: "13px", fontWeight: 900, letterSpacing: "0.3em", marginBottom: "20px" }}>
                <span>&#x1F3AF;</span>
                <span>{isPlayerMode ? "TOP FRAGGER" : "TOP KILL TEAM"}</span>
              </div>

              {/* Team info */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                {displayLogo && !displayPhoto && (
                  <img src={displayLogo} alt="" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />
                )}
                <div>
                  {displayTag && (
                    <span style={{ fontSize: "18px", color: primaryColor, fontWeight: 700, marginRight: "8px" }}>[{displayTag}]</span>
                  )}
                  <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{displayTeam}</span>
                </div>
              </div>

              {/* Player / team name */}
              <div style={{ fontSize: "80px", fontWeight: 900, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "28px" }}>
                {displayName}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "32px", alignItems: "center", animation: visible ? "fadeUp 0.5s ease 0.4s forwards" : "none", opacity: 0 }}>
                {/* Kills */}
                <div style={{ background: `${primaryColor}15`, border: `2px solid ${primaryColor}40`, borderRadius: "14px", padding: "20px 28px", textAlign: "center" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: `${primaryColor}bb`, letterSpacing: "0.25em", marginBottom: "6px" }}>TOTAL KILLS</div>
                  <div style={{ fontSize: "72px", fontWeight: 900, color: primaryColor, lineHeight: 1, animation: visible ? "numberCount 0.5s ease 0.5s forwards" : "none", opacity: 0 }}>
                    {displayKills}
                  </div>
                </div>

                {/* Points — only show if we have team data */}
                {displayPoints > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "14px", padding: "20px 28px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.25em", marginBottom: "6px" }}>TEAM POINTS</div>
                    <div style={{ fontSize: "72px", fontWeight: 900, color: "#ffffff", lineHeight: 1, animation: visible ? "numberCount 0.5s ease 0.6s forwards" : "none", opacity: 0 }}>
                      {displayPoints}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      
        {data?.branding?.sponsors && data?.branding?.sponsors.length > 0 && (
          <SponsorTicker sponsors={(data?.branding?.sponsors ?? []) as any} primaryColor={primaryColor} variant="rotate" position="bottom" />
        )}
      </div>
    </>
  );
}
