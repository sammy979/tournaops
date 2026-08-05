"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ChickenDinnerOverlay() {
  const params = useParams();
  const token = params?.token as string;
  const [winner, setWinner] = useState<any>(null);
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
          setWinner(data.standings?.[0]);
          setTournamentName(data.tournament?.name || "");
          setOrganizer(data.organizer);
          setBranding(data.branding);
        }
      } catch {}
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const primaryColor = branding?.primaryColor || "#facc15";
  const organizerName = branding?.organizerName || organizer?.displayName || organizer?.username || "TournaOps";
  const organizerLogo = branding?.logoUrl || organizer?.avatar;

  const getTeamLogo = (teamName: string, existing?: string) => {
    if (existing) return existing;
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(`esports team logo "${teamName}", minimalist, professional, gaming`)}?width=200&height=200&nologo=true&model=flux&seed=${teamName?.length || 1}`;
  };

  const bgImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(`PUBG victory celebration, chicken dinner, golden confetti explosion, epic winning moment, cinematic`)}?width=1920&height=1080&nologo=true&model=flux`;

  return (
    <div style={{
      background: "transparent", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 40, fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        position: "relative", maxWidth: 800, width: "100%",
        borderRadius: 24, overflow: "hidden",
        border: `3px solid ${primaryColor}`,
        boxShadow: `0 30px 100px ${primaryColor}80`,
      }}>
        <div style={{
          background: `url(${bgImage}) center/cover`,
          padding: "60px 40px", position: "relative", minHeight: 500,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(0,0,0,0.75), rgba(30,20,0,0.85))",
          }}></div>

          {/* Organizer badge */}
          <div style={{
            position: "absolute", top: 20, right: 20,
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.7)", padding: "6px 12px",
            borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {organizerLogo && (
              <img src={organizerLogo} style={{ width: 20, height: 20, borderRadius: "50%" }} alt="" />
            )}
            <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>{organizerName}</span>
          </div>

          <div style={{ position: "relative", textAlign: "center", color: "white" }}>
            <div style={{ fontSize: 80, marginBottom: 20, animation: "bounce 1s infinite" }}>🏆</div>
            
            <div style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${primaryColor}, #f97316)`,
              color: "black",
              padding: "6px 24px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 4,
              marginBottom: 20,
            }}>
              WINNER WINNER
            </div>
            
            <h1 style={{
              fontSize: 72,
              fontWeight: 900,
              margin: 0,
              background: `linear-gradient(135deg, ${primaryColor}, #f97316)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}>
              CHICKEN DINNER!
            </h1>

            {winner ? (
              <>
                <div style={{ 
                  marginTop: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                }}>
                  {/* Team Logo */}
                  <img 
                    src={getTeamLogo(winner.teamName, winner.teamLogo)}
                    style={{ 
                      width: 100, height: 100, borderRadius: 12,
                      border: `3px solid ${primaryColor}`,
                      boxShadow: `0 0 40px ${primaryColor}80`,
                    }}
                    alt=""
                  />
                  
                  <div>
                    {winner.teamTag && (
                      <div style={{ fontSize: 24, color: primaryColor, fontWeight: 700 }}>
                        [{winner.teamTag}]
                      </div>
                    )}
                    <div style={{ fontSize: 48, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>
                      {winner.teamName}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: 30,
                  display: "flex",
                  justifyContent: "center",
                  gap: 40,
                }}>
                  <Stat label="POINTS" value={winner.totalPoints} color={primaryColor} />
                  <Stat label="KILLS" value={winner.totalKills} color={primaryColor} />
                  <Stat label="WWCDS" value={winner.wwcdCount} color={primaryColor} />
                </div>
              </>
            ) : (
              <div style={{ marginTop: 40, fontSize: 20, color: "#9ca3af" }}>
                Awaiting champion...
              </div>
            )}

            <div style={{ marginTop: 30, fontSize: 12, color: primaryColor, letterSpacing: 3, fontWeight: 700 }}>
              {tournamentName?.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }`}</style>
    </div>
  );
}

function Stat({ label, value, color }: any) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 42, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9ca3af", letterSpacing: 2, fontWeight: 700 }}>{label}</div>
    </div>
  );
}