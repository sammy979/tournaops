"use client";
import { useEffect, useState } from "react";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: string;
  website?: string;
}

interface SponsorTickerProps {
  sponsors: Sponsor[];
  primaryColor?: string;
  position?: "top" | "bottom";
  variant?: "ticker" | "rotate" | "static";
}

const TIER_WEIGHT: Record<string, number> = {
  title: 4,
  platinum: 3,
  gold: 2,
  silver: 1,
};

export default function SponsorTicker({
  sponsors = [],
  primaryColor = "#f59e0b",
  position = "bottom",
  variant = "rotate",
}: SponsorTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedSponsors = [...sponsors].sort(
    (a, b) => (TIER_WEIGHT[b.tier] || 0) - (TIER_WEIGHT[a.tier] || 0)
  );

  useEffect(() => {
    if (variant !== "rotate" || sortedSponsors.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % sortedSponsors.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sortedSponsors.length, variant]);

  if (!sortedSponsors || sortedSponsors.length === 0) return null;

  const positionStyles: React.CSSProperties = position === "top"
    ? { top: "30px", left: "50%", transform: "translateX(-50%)" }
    : { bottom: "30px", right: "50px" };

  // ROTATE variant: shows one sponsor at a time, cycles
  if (variant === "rotate") {
    const sponsor = sortedSponsors[currentIndex];
    return (
      <>
        <style>{`
          @keyframes sponsorFadeIn {
            0% { opacity: 0; transform: translateY(10px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <div style={{
          position: "absolute",
          ...positionStyles,
          background: "linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,30,0.85))",
          border: `2px solid ${primaryColor}`,
          borderRadius: "1rem",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${primaryColor}30`,
          backdropFilter: "blur(20px)",
          minWidth: "280px",
        }}>
          <div style={{
            fontSize: "0.65rem",
            fontWeight: 800,
            color: primaryColor,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            borderRight: `1px solid ${primaryColor}50`,
            paddingRight: "1rem",
            writingMode: "vertical-lr",
            transform: "rotate(180deg)",
            textAlign: "center",
          }}>
            Sponsor
          </div>
          <div
            key={sponsor.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              animation: "sponsorFadeIn 0.6s ease-out",
              minWidth: "160px",
            }}
          >
            {sponsor.logo ? (
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                style={{
                  height: "60px",
                  maxWidth: "180px",
                  objectFit: "contain",
                  filter: "brightness(1.1)",
                }}
              />
            ) : (
              <div style={{
                fontSize: "1.5rem",
                fontWeight: 900,
                color: "#fff",
                padding: "0.5rem 1rem",
              }}>
                {sponsor.name}
              </div>
            )}
            {sponsor.logo && (
              <div style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                {sponsor.name}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // TICKER variant: horizontal scrolling
  if (variant === "ticker") {
    return (
      <>
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.85)",
          borderTop: `2px solid ${primaryColor}`,
          padding: "0.75rem 0",
          overflow: "hidden",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{
            display: "flex",
            gap: "3rem",
            animation: `tickerScroll ${sortedSponsors.length * 6}s linear infinite`,
            width: "fit-content",
          }}>
            {[...sortedSponsors, ...sortedSponsors].map((sponsor, i) => (
              <div key={`${sponsor.id}-${i}`} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                whiteSpace: "nowrap",
              }}>
                {sponsor.logo && (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    style={{ height: "36px", maxWidth: "120px", objectFit: "contain" }}
                  />
                )}
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                  {sponsor.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  // STATIC variant: all sponsors visible
  return (
    <div style={{
      position: "absolute",
      ...positionStyles,
      display: "flex",
      gap: "1rem",
      alignItems: "center",
      background: "rgba(0,0,0,0.7)",
      padding: "0.75rem 1.25rem",
      borderRadius: "0.75rem",
      backdropFilter: "blur(10px)",
    }}>
      {sortedSponsors.slice(0, 5).map(sponsor => (
        <div key={sponsor.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {sponsor.logo && (
            <img src={sponsor.logo} alt={sponsor.name} style={{ height: "32px", maxWidth: "80px", objectFit: "contain" }} />
          )}
        </div>
      ))}
    </div>
  );
}
