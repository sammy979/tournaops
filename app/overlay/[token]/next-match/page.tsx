"use client";
import { useEffect, useState, use } from "react";

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

interface Standing {
  teamId: string;
  teamName: string;
  teamTag: string | null;
  teamLogo: string | null;
  totalPoints: number;
  totalKills: number;
  rank: number;
}

interface OverlayData {
  tournament: { id: string; name: string; status: string } | null;
  standings: Standing[];
  organizer: Organizer | null;
  branding: Branding | null;
}

export default function NextMatchOverlay({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<OverlayData | null>(null);
  const [now, setNow] = useState(new Date());

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
    const dataInterval = setInterval(load, 5000);
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => {
      mounted = false;
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [token]);

  const primaryColor = data?.branding?.primaryColor || "#f59e0b";
  const accentColor = "#3b82f6";
  const organizerName =
    data?.branding?.organizerName ||
    data?.organizer?.displayName ||
    data?.organizer?.username ||
    "TournaOps";
  const organizerLogo = data?.branding?.logoUrl || data?.organizer?.avatar || null;
  const tournamentName = data?.tournament?.name || "";
  const standings = data?.standings || [];

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes fadeUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes clockPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 30px ${accentColor}30, 0 20px 60px rgba(0,0,0,0.5); }
          50% { box-shadow: 0 0 50px ${accentColor}50, 0 20px 60px rgba(0,0,0,0.5); }
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
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 600px at 50% 50%, ${accentColor}10 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Organizer badge */}
        {(organizerLogo || organizerName) && (
          <div style={{ position: "absolute", top: "48px", right: "60px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "999px", padding: "8px 20px" }}>
            {organizerLogo && <img src={organizerLogo} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />}
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.08em" }}>{organizerName}</span>
          </div>
        )}

        {/* Watermark */}
        <div style={{ position: "absolute", bottom: "40px", right: "60px", color: "rgba(255,255,255,0.18)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.15em" }}>TOURNAOPS.COM</div>

        {/* Main card */}
        <div
          style={{
            width: "840px",
            background: "linear-gradient(135deg, rgba(0,0,0,0.95), rgba(10,15,30,0.92))",
            borderRadius: "24px",
            border: `2px solid ${accentColor}60`,
            overflow: "hidden",
            animation: "borderGlow 3s ease-in-out infinite",
          }}
        >
          {/* Header bar */}
          <div style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>&#x1F3AE;</span>
              <span style={{ color: "#fff", fontSize: "16px", fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase" }}>NEXT MATCH</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em" }}>
              STARTING SOON
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "40px 36px", textAlign: "center" }}>
            {/* Tournament name */}
            <div style={{ fontSize: "36px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "8px", textTransform: "uppercase" }}>
              {tournamentName || "TOURNAMENT"}
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.3em", marginBottom: "36px" }}>
              GET READY FOR THE NEXT MATCH
            </div>

            {/* Clock */}
            <div style={{ background: `${accentColor}12`, border: `2px solid ${accentColor}35`, borderRadius: "16px", padding: "28px", marginBottom: "36px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: `${accentColor}bb`, letterSpacing: "0.3em", marginBottom: "8px" }}>CURRENT TIME</div>
              <div style={{ fontSize: "72px", fontWeight: 900, color: accentColor, fontFamily: "Rajdhani, monospace", lineHeight: 1, letterSpacing: "0.05em", animation: "clockPulse 2s ease-in-out infinite" }}>
                {timeStr}
              </div>
            </div>

            {/* Participating teams preview */}
            {standings.length > 0 && (
              <div style={{ animation: "fadeUp 0.6s ease 0.3s forwards", opacity: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.25em", marginBottom: "16px" }}>
                  {standings.length} TEAMS COMPETING
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  {standings.slice(0, 16).map((team) => (
                    <div
                      key={team.teamId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                      }}
                    >
                      {team.teamLogo && (
                        <img src={team.teamLogo} alt="" style={{ width: "18px", height: "18px", borderRadius: "3px", objectFit: "cover" }} />
                      )}
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.75)" }}>
                        {team.teamTag ? `[${team.teamTag}]` : team.teamName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data && (
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.15em" }}>LOADING...</div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "8px 28px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em" }}>MATCH WILL BEGIN SHORTLY</div>
            <div style={{ color: primaryColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>TOURNAOPS.COM</div>
          </div>
        </div>
      </div>
    </>
  );
}