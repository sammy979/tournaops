"use client";
import { ExternalLink, Award } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: string;
  website: string;
  description: string;
}

interface SponsorsBarProps {
  sponsors: Sponsor[];
  primaryColor?: string;
}

const TIER_ORDER = ["title", "platinum", "gold", "silver"];
const TIER_LABELS: Record<string, string> = {
  title: "Title Sponsor",
  platinum: "Platinum Partners",
  gold: "Gold Sponsors",
  silver: "Silver Sponsors",
};
const TIER_SIZE: Record<string, number> = {
  title: 140,
  platinum: 110,
  gold: 90,
  silver: 70,
};

export default function SponsorsBar({ sponsors = [], primaryColor = "#f59e0b" }: SponsorsBarProps) {
  if (!sponsors || sponsors.length === 0) return null;

  const grouped: Record<string, Sponsor[]> = {};
  for (const s of sponsors) {
    const tier = s.tier || "gold";
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(s);
  }

  return (
    <div style={{
      borderTop: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)",
      padding: "3rem 1.5rem",
      marginTop: "3rem",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: `${primaryColor}15`,
            border: `1px solid ${primaryColor}30`,
            padding: "0.375rem 1rem",
            borderRadius: "9999px",
            marginBottom: "0.75rem",
          }}>
            <Award style={{ width: "0.875rem", height: "0.875rem", color: primaryColor }} />
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Proudly Supported By
            </span>
          </div>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff" }}>Our Sponsors</h3>
        </div>

        {TIER_ORDER.map(tier => {
          const list = grouped[tier];
          if (!list || list.length === 0) return null;
          const size = TIER_SIZE[tier];

          return (
            <div key={tier} style={{ marginBottom: "2.5rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <span style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.15em",
                }}>
                  {TIER_LABELS[tier]}
                </span>
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                justifyContent: "center", gap: "1.5rem",
              }}>
                {list.map(sponsor => {
                  const Wrapper: any = sponsor.website ? "a" : "div";
                  const wrapperProps = sponsor.website ? {
                    href: sponsor.website,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  } : {};

                  return (
                    <Wrapper
                      key={sponsor.id}
                      {...wrapperProps}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        gap: "0.5rem",
                        padding: "1rem 1.25rem",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "1rem",
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                        minWidth: `${size + 40}px`,
                      }}
                      onMouseEnter={(e: any) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.borderColor = `${primaryColor}40`;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {sponsor.logo ? (
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          style={{
                            height: `${size * 0.5}px`,
                            maxWidth: `${size}px`,
                            objectFit: "contain",
                            filter: "brightness(1.1)",
                          }}
                        />
                      ) : (
                        <div style={{
                          width: `${size}px`, height: `${size * 0.5}px`,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: "0.5rem",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#6b7280", fontSize: "0.7rem", fontWeight: 700,
                        }}>
                          NO LOGO
                        </div>
                      )}
                      <div style={{
                        fontSize: "0.8rem", fontWeight: 700,
                        color: "#fff", textAlign: "center",
                      }}>
                        {sponsor.name || "Sponsor"}
                      </div>
                      {sponsor.description && (
                        <div style={{
                          fontSize: "0.65rem", color: "#9ca3af",
                          textAlign: "center", maxWidth: `${size + 20}px`,
                        }}>
                          {sponsor.description}
                        </div>
                      )}
                      {sponsor.website && (
                        <div style={{
                          display: "flex", alignItems: "center", gap: "0.25rem",
                          fontSize: "0.6rem", color: primaryColor, fontWeight: 600,
                        }}>
                          <ExternalLink style={{ width: "0.65rem", height: "0.65rem" }} />
                          Visit
                        </div>
                      )}
                    </Wrapper>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
