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
  tournament: { id: string; name: string; status: string; bannerImage?: string } | null;
  standings: Standing[];
  organizer: Organizer | null;
  branding: Branding | null;
}

export default function ChickenDinnerOverlay({
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

  const primaryColor = data?.branding?.primaryColor || "#f59e0b";
  const organizerName =
    data?.branding?.organizerName ||
    data?.organizer?.displayName ||
    data?.organizer?.username ||
    "TournaOps";
  const organizerLogo = data?.branding?.logoUrl || data?.organizer?.avatar || null;

  const standings = data?.standings || [];
  const winner =
    standings.find((s) => s.wwcdCount > 0 && s.rank === 1) ||
    standings.find((s) => s.rank === 1) ||
    null;

  const tournamentName = data?.tournament?.name || "";

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent !important; overflow: hidden; }
        @keyframes victoryScale {
          0% { transform: scale(0.4) translateY(60px); opacity: 0; }
          60% { transform: scale(1.08) translateY(-8px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes victoryFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { filter: drop-shadow(0 0 30px ${primaryColor}cc); }
          50% { filter: drop-shadow(0 0 70px ${primaryColor}ff); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.15; }
        }
        .winner-name {
          filter: drop-shadow(0 0 30px ${primaryColor}cc);
          animation: glowPulse 2.5s ease-in-out infinite;
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
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 900px 600px at 50% 55%, ${primaryColor}15 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Pulse rings */}
        <div style={{ position: "absolute", width: "860px", height: "860px", borderRadius: "50%", border: `2px solid ${primaryColor}35`, animation: "ringPulse 3s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "660px", height: "660px", borderRadius: "50%", border: `1px solid ${primaryColor}20`, animation: "ringPulse 3s ease-in-out infinite 1.2s", pointerEvents: "none" }} />

        {/* Organizer badge */}
        {(organizerLogo || organizerName) && (
          <div style={{ position: "absolute", top: "48px", right: "60px", display: "flex", alignItems: "center", gap: "10px", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "999px", padding: "8px 20px" }}>
            {organizerLogo && (
              <img src={organizerLogo} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
            )}
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.08em" }}>{organizerName}</span>
          </div>
        )}

        {/* Tournament name */}
        {tournamentName && (
          <div style={{ position: "absolute", top: "54px", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: "20px", fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {tournamentName}
          </div>
        )}

        {/* Watermark */}
        <div style={{ position: "absolute", bottom: "40px", right: "60px", color: "rgba(255,255,255,0.20)", fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em" }}>
          TOURNAOPS.COM
        </div>

        {/* Loading */}
        {!data && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.2em" }}>
            LOADING...
          </div>
        )}

        {/* No winner yet */}
        {data && !winner && (
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "28px", fontWeight: 700, letterSpacing: "0.2em" }}>
            AWAITING MATCH RESULT
          </div>
        )}

        {/* Winner display */}
        {data && winner && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", animation: "victoryScale 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>

            <div style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "0.55em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", marginBottom: "24px", animation: "victoryFade 0.6s ease 0.25s forwards", opacity: 0 }}>
              WINNER WINNER
            </div>

            {winner.teamLogo && (
              <div style={{ width: "148px", height: "148px", borderRadius: "50%", overflow: "hidden", border: `4px solid ${primaryColor}`, boxShadow: `0 0 50px ${primaryColor}80, 0 0 100px ${primaryColor}40`, marginBottom: "28px", flexShrink: 0 }}>
                <img src={winner.teamLogo} alt={winner.teamName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}

            {winner.teamTag && (
              <div style={{ fontSize: "26px", fontWeight: 700, color: primaryColor, letterSpacing: "0.2em", marginBottom: "6px" }}>
                [{winner.teamTag}]
              </div>
            )}

            <h1 className="winner-name" style={{ fontSize: "116px", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.02em", color: "#ffffff", textTransform: "uppercase", marginBottom: "14px", textAlign: "center" }}>
              {winner.teamName}
            </h1>

            <div style={{ fontSize: "46px", fontWeight: 900, letterSpacing: "0.35em", textTransform: "uppercase", background: `linear-gradient(90deg, ${primaryColor}, #f97316, ${primaryColor})`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 2.2s linear infinite", marginBottom: "44px" }}>
              CHICKEN DINNER
            </div>

            <div style={{ display: "flex", gap: "52px", alignItems: "center", animation: "victoryFade 0.6s ease 0.65s forwards", opacity: 0 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "54px", fontWeight: 900, color: primaryColor, lineHeight: 1 }}>{winner.totalPoints}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", marginTop: "6px" }}>TOTAL POINTS</div>
              </div>

              <div style={{ width: "1px", height: "56px", background: "rgba(255,255,255,0.12)" }} />

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "54px", fontWeight: 900, color: "#f87171", lineHeight: 1 }}>{winner.totalKills}</div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", marginTop: "6px" }}>TOTAL KILLS</div>
              </div>

              {winner.wwcdCount > 0 && (
                <>
                  <div style={{ width: "1px", height: "56px", background: "rgba(255,255,255,0.12)" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "54px", fontWeight: 900, color: "#4ade80", lineHeight: 1 }}>{winner.wwcdCount}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", marginTop: "6px" }}>WWCD</div>
                  </div>
                </>
              )}
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
