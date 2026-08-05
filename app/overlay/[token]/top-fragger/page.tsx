"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function TopFraggerOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [topFragger, setTopFragger] = useState<any>(null);
  const [topTeam, setTopTeam] = useState<any>(null);
  const [tournamentName, setTournamentName] = useState("");
  const [organizer, setOrganizer] = useState<any>(null);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    async function load() {
      try {
        const res = await fetch(`/api/overlay/${token}`);
        if (res.ok) {
          const data = await res.json();
          setTopFragger(data.topFraggers?.[0]);
          setTopTeam(data.topFraggerTeam);
          setTournamentName(data.tournament?.name || "");
          setOrganizer(data.organizer);
          setBranding(data.branding);
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [token]);

  const primaryColor = branding?.primaryColor || "#ef4444";
  const organizerName = branding?.organizerName || organizer?.displayName || organizer?.username || "TournaOps";
  const organizerLogo = branding?.logoUrl || organizer?.avatar;

  // Use existing player photo OR generate AI avatar
  const getPlayerPhoto = (playerName: string, existingPhoto?: string) => {
    if (existingPhoto) return existingPhoto;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG player character portrait, tactical gear, helmet, intense expression, cinematic lighting, esports style, "${playerName}"`)}?width=512&height=512&nologo=true&model=flux&seed=${playerName?.length || 1}`;
  };

  const getTeamLogo = (teamName: string, existingLogo?: string | null) => {
    if (existingLogo) return existingLogo;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`esports team logo "${teamName}", minimalist, professional`)}?width=200&height=200&nologo=true&model=flux&seed=${teamName?.length || 1}`;
  };

  const displayName = topFragger?.name || topTeam?.teamName || "TBA";
  const displayTeam = topFragger?.teamName || topTeam?.teamName || "";
  const displayTag = topFragger?.teamTag || topTeam?.teamTag;
  const displayKills = topFragger?.kills || topTeam?.totalKills || 0;
  const displayPhoto = topFragger 
    ? getPlayerPhoto(topFragger.name, topFragger.photo)
    : `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG top killer champion, epic sniper aim, muzzle flash, red lighting`)}?width=512&height=512&nologo=true&model=flux`;

  const bgImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG battle scene, muzzle flashes, tactical warfare, red neon lighting, cinematic action`)}?width=1920&height=1080&nologo=true&model=flux`;

  return (
    <div style={{
      background: "transparent",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        position: "relative",
        maxWidth: 800,
        width: "100%",
        borderRadius: 24,
        overflow: "hidden",
        border: `3px solid ${primaryColor}`,
        boxShadow: `0 30px 100px ${primaryColor}80`,
      }}>
        {/* Background */}
        <div style={{
          background: `url(${bgImage}) center/cover`,
          padding: "40px",
          position: "relative",
          minHeight: 400,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.85), rgba(50,0,0,0.9))",
          }}></div>

          {/* Organizer badge */}
          <div style={{
            position: "absolute", top: 20, right: 20,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.7)",
            padding: "6px 12px", borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {organizerLogo && (
              <img src={organizerLogo} style={{ width: 20, height: 20, borderRadius: "50%" }} alt="" />
            )}
            <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{organizerName}</span>
          </div>

          <div style={{ position: "relative", display: "flex", gap: 30, alignItems: "center" }}>
            {/* Player Photo */}
            <div style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${primaryColor}`,
              boxShadow: `0 0 60px ${primaryColor}`,
              flexShrink: 0,
            }}>
              <img 
                src={displayPhoto}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt={displayName}
              />
            </div>

            {/* Info */}
            <div style={{ flex: 1, color: "white" }}>
              <div style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${primaryColor}, #dc2626)`,
                color: "white",
                padding: "6px 20px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 4,
                marginBottom: 15,
                boxShadow: `0 0 30px ${primaryColor}80`,
              }}>
                🎯 TOP FRAGGER
              </div>

              <div style={{
                fontSize: 42,
                fontWeight: 900,
                color: "white",
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 10,
                textShadow: "0 0 30px rgba(0,0,0,0.8)",
              }}>
                {displayName}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                {(topFragger?.teamLogo || topTeam?.teamLogo) && (
                  <img 
                    src={getTeamLogo(displayTeam, topFragger?.teamLogo || topTeam?.teamLogo)}
                    style={{ width: 30, height: 30, borderRadius: 4 }}
                    alt=""
                  />
                )}
                <div>
                  {displayTag && (
                    <span style={{ color: primaryColor, fontSize: 16, fontWeight: 700, marginRight: 8 }}>
                      [{displayTag}]
                    </span>
                  )}
                  <span style={{ color: "#d1d5db", fontSize: 16, fontWeight: 600 }}>
                    {displayTeam}
                  </span>
                </div>
              </div>

              {/* Kills Counter */}
              <div style={{
                padding: 20,
                background: `${primaryColor}15`,
                border: `2px solid ${primaryColor}40`,
                borderRadius: 16,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#fca5a5", letterSpacing: 3, fontWeight: 700 }}>
                  TOTAL KILLS
                </div>
                <div style={{ 
                  fontSize: 80, 
                  fontWeight: 900, 
                  color: primaryColor, 
                  lineHeight: 1,
                  marginTop: 5,
                  textShadow: `0 0 40px ${primaryColor}80`,
                }}>
                  {displayKills}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ 
            marginTop: 30, 
            textAlign: "center",
            fontSize: 12, 
            color: primaryColor, 
            letterSpacing: 3, 
            fontWeight: 700 
          }}>
            {tournamentName?.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}